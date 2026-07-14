package br.com.semear.service;

import br.com.semear.domain.*;
import br.com.semear.domain.enumeration.*;
import br.com.semear.repository.*;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.service.dto.*;
import br.com.semear.service.util.CultoRecorrenciaUtils;
import br.com.semear.service.util.EscalaNotificacaoUtils;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EscalaAutomacaoService {

    private static final Logger LOG = LoggerFactory.getLogger(EscalaAutomacaoService.class);
    private static final String ENTITY = "escalaAutomacao";
    private static final String LOTE_LIMPEZA_PREFIX = "__loteLimpeza:";
    private static final ZoneId FUSO = ZoneId.of("America/Sao_Paulo");

    private final CultoRegistroRepository cultoRegistroRepository;
    private final CultoEscalaRegraRepository cultoEscalaRegraRepository;
    private final EscalaConfigAutomaticaRepository configRepository;
    private final EscalaGeracaoRepository geracaoRepository;
    private final EscalaRepository escalaRepository;
    private final EscalaItemRepository escalaItemRepository;
    private final DepartamentoMembroRepository departamentoMembroRepository;
    private final DepartamentoRepository departamentoRepository;
    private final IgrejaRepository igrejaRepository;
    private final EscalaLoginAvisoVistoRepository avisoVistoRepository;
    private final TenantService tenantService;
    private final NotificacaoService notificacaoService;

    public EscalaAutomacaoService(
        CultoRegistroRepository cultoRegistroRepository,
        CultoEscalaRegraRepository cultoEscalaRegraRepository,
        EscalaConfigAutomaticaRepository configRepository,
        EscalaGeracaoRepository geracaoRepository,
        EscalaRepository escalaRepository,
        EscalaItemRepository escalaItemRepository,
        DepartamentoMembroRepository departamentoMembroRepository,
        DepartamentoRepository departamentoRepository,
        IgrejaRepository igrejaRepository,
        EscalaLoginAvisoVistoRepository avisoVistoRepository,
        TenantService tenantService,
        NotificacaoService notificacaoService
    ) {
        this.cultoRegistroRepository = cultoRegistroRepository;
        this.cultoEscalaRegraRepository = cultoEscalaRegraRepository;
        this.configRepository = configRepository;
        this.geracaoRepository = geracaoRepository;
        this.escalaRepository = escalaRepository;
        this.escalaItemRepository = escalaItemRepository;
        this.departamentoMembroRepository = departamentoMembroRepository;
        this.departamentoRepository = departamentoRepository;
        this.igrejaRepository = igrejaRepository;
        this.avisoVistoRepository = avisoVistoRepository;
        this.tenantService = tenantService;
        this.notificacaoService = notificacaoService;
    }

    @Transactional(readOnly = true)
    public EscalaConfigAutomaticaDTO obterConfig() {
        Long igrejaId = tenantService.getIgrejaIdAtual();
        EscalaConfigAutomaticaDTO dto = configRepository
            .findByIgrejaId(igrejaId)
            .map(this::toConfigDto)
            .orElseGet(this::configPadraoDto);
        preencherDisponibilidadeGeracao(dto, igrejaId);
        return dto;
    }

    private EscalaConfigAutomaticaDTO configPadraoDto() {
        EscalaConfigAutomaticaDTO dto = new EscalaConfigAutomaticaDTO();
        dto.setMesesCiclo(3);
        dto.setDiasAntecedencia(14);
        dto.setAtivo(true);
        dto.setGerarPortaria(true);
        dto.setGerarRecepcao(true);
        dto.setGerarLimpeza(false);
        dto.setAgruparPortariaRecepcao(false);
        dto.setLimpezaMensal(true);
        dto.setPodeGerarProximoCiclo(true);
        return dto;
    }

    private void preencherDisponibilidadeGeracao(EscalaConfigAutomaticaDTO dto, Long igrejaId) {
        int diasAntecedencia = dto.getDiasAntecedencia() != null ? dto.getDiasAntecedencia() : 14;
        LocalDate hoje = LocalDate.now(FUSO);

        Optional<EscalaGeracao> rascunho = geracaoRepository
            .findFirstByIgrejaIdAndStatusOrderByCriadoEmDesc(igrejaId, StatusEscalaPublicacao.RASCUNHO)
            .filter(g -> possuiEscalasPortariaRecepcao(g.getId()));
        if (rascunho.isPresent()) {
            dto.setPodeGerarProximoCiclo(false);
            dto.setMotivoBloqueioGeracao("Existe um ciclo em rascunho. Publique-o ou descarte-o antes de gerar outro.");
            return;
        }

        Optional<EscalaGeracao> vigente = encontrarUltimaGeracaoPortariaRecepcao(igrejaId, StatusEscalaPublicacao.PUBLICADA);
        if (vigente.isEmpty()) {
            dto.setPodeGerarProximoCiclo(true);
            dto.setMotivoBloqueioGeracao(null);
            dto.setProximaDataGeracao(null);
            return;
        }

        LocalDate dataFim = vigente.get().getDataFim();
        LocalDate dataLiberacao = dataFim.minusDays(diasAntecedencia);
        dto.setProximaDataGeracao(dataLiberacao);

        if (hoje.isBefore(dataLiberacao)) {
            dto.setPodeGerarProximoCiclo(false);
            dto.setMotivoBloqueioGeracao(
                "Próxima geração liberada em " +
                dataLiberacao.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) +
                " (" +
                diasAntecedencia +
                " dias antes do fim do ciclo vigente)."
            );
        } else {
            dto.setPodeGerarProximoCiclo(true);
            dto.setMotivoBloqueioGeracao(null);
        }
    }

    /** Última geração (por data fim) que ainda tem escalas de portaria/recepção. */
    private Optional<EscalaGeracao> encontrarUltimaGeracaoPortariaRecepcao(Long igrejaId, StatusEscalaPublicacao status) {
        return geracaoRepository
            .findByIgrejaIdOrderByDataInicioDesc(igrejaId)
            .stream()
            .filter(g -> g.getStatus() == status)
            .filter(g -> possuiEscalasPortariaRecepcao(g.getId()))
            .max(Comparator.comparing(EscalaGeracao::getDataFim, Comparator.nullsLast(Comparator.naturalOrder())));
    }

    public EscalaConfigAutomaticaDTO salvarConfig(EscalaConfigAutomaticaDTO dto) {
        EscalaConfigAutomatica config = resolverConfig();
        if (dto.getMesesCiclo() != null) {
            if (dto.getMesesCiclo() < 1 || dto.getMesesCiclo() > 12) {
                throw new BadRequestAlertException("Meses do ciclo deve ser entre 1 e 12", ENTITY, "cicloinvalido");
            }
            config.setMesesCiclo(dto.getMesesCiclo());
        }
        if (dto.getDiasAntecedencia() != null) {
            if (dto.getDiasAntecedencia() < 1 || dto.getDiasAntecedencia() > 60) {
                throw new BadRequestAlertException("Dias de antecedência deve ser entre 1 e 60", ENTITY, "antecedenciainvalida");
            }
            config.setDiasAntecedencia(dto.getDiasAntecedencia());
        }
        if (dto.getAtivo() != null) {
            config.setAtivo(dto.getAtivo());
        }
        if (dto.getGerarPortaria() != null) {
            config.setGerarPortaria(dto.getGerarPortaria());
        }
        if (dto.getGerarRecepcao() != null) {
            config.setGerarRecepcao(dto.getGerarRecepcao());
        }
        if (dto.getGerarLimpeza() != null) {
            config.setGerarLimpeza(dto.getGerarLimpeza());
        }
        if (dto.getAgruparPortariaRecepcao() != null) {
            config.setAgruparPortariaRecepcao(dto.getAgruparPortariaRecepcao());
        }
        if (dto.getLimpezaMensal() != null && dto.getModoLimpeza() == null) {
            config.setLimpezaMensal(dto.getLimpezaMensal());
            config.setModoLimpeza(Boolean.TRUE.equals(dto.getLimpezaMensal()) ? ModoLimpezaEscala.MENSAL : ModoLimpezaEscala.POR_CULTO);
        }
        if (dto.getModoLimpeza() != null) {
            config.setModoLimpeza(dto.getModoLimpeza());
            config.setLimpezaMensal(dto.getModoLimpeza() == ModoLimpezaEscala.MENSAL);
        }
        if (dto.getDiaSemanaLimpeza() != null) {
            config.setDiaSemanaLimpeza(dto.getDiaSemanaLimpeza());
        }
        config.setAtualizadoEm(Instant.now());
        EscalaConfigAutomaticaDTO salvo = toConfigDto(configRepository.save(config));
        preencherDisponibilidadeGeracao(salvo, tenantService.getIgrejaIdAtual());
        return salvo;
    }

    @Transactional(readOnly = true)
    public List<CultoRegistroDTO> listarCultos() {
        Long igrejaId = tenantService.getIgrejaIdAtual();
        return cultoRegistroRepository
            .findByIgrejaIdOrderByNomeAsc(igrejaId)
            .stream()
            .filter(c -> Boolean.TRUE.equals(c.getAtivo()))
            .map(this::toCultoDto)
            .toList();
    }

    public List<CultoRegistroDTO> salvarCultos(List<CultoRegistroDTO> cultos) {
        Long igrejaId = tenantService.getIgrejaIdAtual();
        Igreja igreja = tenantService.resolverIgrejaParaCriacao();
        List<CultoRegistro> existentes = cultoRegistroRepository.findByIgrejaIdOrderByNomeAsc(igrejaId);
        Set<Long> idsPayload = cultos.stream().map(CultoRegistroDTO::getId).filter(Objects::nonNull).collect(Collectors.toSet());

        for (CultoRegistro antigo : existentes) {
            if (!idsPayload.contains(antigo.getId())) {
                antigo.setAtivo(false);
                cultoRegistroRepository.save(antigo);
            }
        }

        for (CultoRegistroDTO dto : cultos) {
            validarCulto(dto);
            CultoRegistro culto;
            if (dto.getId() != null) {
                culto = cultoRegistroRepository.findByIdAndIgrejaId(dto.getId(), igrejaId).orElseThrow(this::naoEncontrado);
            } else {
                culto = new CultoRegistro();
                culto.setIgreja(igreja);
                culto.setCriadoEm(Instant.now());
            }
            culto.setNome(dto.getNome().trim());
            culto.setDiaSemana(dto.getDiaSemana());
            culto.setHorario(dto.getHorario().trim());
            culto.setTipo(dto.getTipo() != null ? dto.getTipo() : br.com.semear.domain.enumeration.TipoCulto.RECORRENTE);
            culto.setDataEspecifica(dto.getDataEspecifica());
            FrequenciaCulto freq =
                dto.getFrequencia() != null ? dto.getFrequencia() : FrequenciaCulto.TODA_SEMANA;
            if (culto.getTipo() == br.com.semear.domain.enumeration.TipoCulto.EXTRAORDINARIO) {
                freq = FrequenciaCulto.TODA_SEMANA;
            }
            culto.setFrequencia(freq);
            culto.setDataAncora(freq == FrequenciaCulto.SEMANAS_ALTERNADAS ? dto.getDataAncora() : null);
            culto.setAtivo(dto.getAtivo() == null || dto.getAtivo());
            culto = cultoRegistroRepository.save(culto);

            cultoEscalaRegraRepository.deleteByCultoRegistroId(culto.getId());
            if (dto.getRegras() != null) {
                for (CultoEscalaRegraDTO regraDto : dto.getRegras()) {
                    if (regraDto.getDepartamentoId() == null) {
                        continue;
                    }
                    CultoEscalaRegra regra = new CultoEscalaRegra();
                    regra.setCultoRegistro(culto);
                    Departamento dept = departamentoRepository
                        .findByIdAndIgrejaId(regraDto.getDepartamentoId(), igrejaId)
                        .orElseThrow(this::naoEncontrado);
                    regra.setDepartamento(dept);
                    regra.setRegraGenero(regraDto.getRegraGenero() != null ? regraDto.getRegraGenero() : RegraGeneroEscala.QUALQUER);
                    regra.setAtivo(regraDto.getAtivo() == null || regraDto.getAtivo());
                    cultoEscalaRegraRepository.save(regra);
                }
            }
        }

        return listarCultos();
    }

    @Transactional(readOnly = true)
    public List<EscalaGeracaoDTO> listarGeracoes() {
        Long igrejaId = tenantService.getIgrejaIdAtual();
        return geracaoRepository
            .findByIgrejaIdOrderByDataInicioDesc(igrejaId)
            .stream()
            .filter(
                g ->
                    g.getStatus() == StatusEscalaPublicacao.RASCUNHO || possuiEscalasPortariaRecepcao(g.getId())
            )
            .map(this::toGeracaoDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<EscalaDTO> listarEscalasDaGeracao(Long geracaoId) {
        Long igrejaId = tenantService.getIgrejaIdAtual();
        geracaoRepository.findByIdAndIgrejaId(geracaoId, igrejaId).orElseThrow(this::naoEncontrado);
        return escalaRepository
            .findByGeracaoId(geracaoId)
            .stream()
            .sorted(Comparator.comparing(Escala::getDataEvento, Comparator.nullsLast(Comparator.naturalOrder())))
            .map(this::toEscalaDtoComItens)
            .toList();
    }

    public EscalaGeracaoDTO gerarProximoCiclo(OrigemEscalaGeracao origem) {
        return gerarProximoCiclo(origem, null);
    }

    public EscalaGeracaoDTO gerarProximoCiclo(OrigemEscalaGeracao origem, GerarCicloEscalasDTO req) {
        EscopoGeracaoEscala escopo = req != null ? req.getEscopo() : null;
        Long igrejaId = tenantService.getIgrejaIdAtual();
        EscalaConfigAutomatica config = resolverConfig(igrejaId);
        if (origem == OrigemEscalaGeracao.MANUAL && escopo != EscopoGeracaoEscala.LIMPEZA) {
            EscalaConfigAutomaticaDTO disponibilidade = toConfigDto(config);
            preencherDisponibilidadeGeracao(disponibilidade, igrejaId);
            if (!Boolean.TRUE.equals(disponibilidade.getPodeGerarProximoCiclo())) {
                String msg = disponibilidade.getMotivoBloqueioGeracao() != null
                    ? disponibilidade.getMotivoBloqueioGeracao()
                    : "Geração indisponível no momento.";
                throw new BadRequestAlertException(msg, ENTITY, "geracaobloqueada");
            }
        }
        return toGeracaoDto(executarGeracaoParaIgreja(igrejaId, origem, escopo, req));
    }

    public EscalaGeracaoDTO publicarGeracao(Long id) {
        Long igrejaId = tenantService.getIgrejaIdAtual();
        EscalaGeracao geracao = geracaoRepository.findByIdAndIgrejaId(id, igrejaId).orElseThrow(this::naoEncontrado);
        if (geracao.getStatus() != StatusEscalaPublicacao.RASCUNHO) {
            throw new BadRequestAlertException("Somente rascunhos podem ser publicados", ENTITY, "statusinvalido");
        }
        geracao.setStatus(StatusEscalaPublicacao.PUBLICADA);
        geracao.setPublicadoEm(Instant.now());
        geracaoRepository.save(geracao);

        for (Escala escala : escalaRepository.findByGeracaoId(geracao.getId())) {
            escala.setStatus(StatusEscalaPublicacao.PUBLICADA);
            escalaRepository.save(escala);
            for (EscalaItem item : escalaItemRepository.findByEscalaId(escala.getId())) {
                notificacaoService.notificarEscalaItemAtribuido(escala, item);
            }
        }
        return toGeracaoDto(geracao);
    }

    public void descartarGeracaoRascunho(Long id) {
        Long igrejaId = tenantService.getIgrejaIdAtual();
        EscalaGeracao geracao = geracaoRepository.findByIdAndIgrejaId(id, igrejaId).orElseThrow(this::naoEncontrado);
        if (geracao.getStatus() != StatusEscalaPublicacao.RASCUNHO) {
            throw new BadRequestAlertException("Somente rascunhos podem ser descartados", ENTITY, "statusinvalido");
        }
        List<Escala> alvo = escalaRepository
            .findByGeracaoId(geracao.getId())
            .stream()
            .filter(e -> !escalaEhLimpeza(e))
            .toList();
        if (alvo.isEmpty()) {
            geracaoRepository.delete(geracao);
            return;
        }
        excluirEscalasPortariaRecepcaoDaGeracao(geracao);
    }

    public void excluirEscalasPortariaRecepcaoDaGeracao(Long id) {
        Long igrejaId = tenantService.getIgrejaIdAtual();
        EscalaGeracao geracao = geracaoRepository.findByIdAndIgrejaId(id, igrejaId).orElseThrow(this::naoEncontrado);
        excluirEscalasPortariaRecepcaoDaGeracao(geracao);
    }

    private void excluirEscalasPortariaRecepcaoDaGeracao(EscalaGeracao geracao) {
        List<Escala> alvo = escalaRepository
            .findByGeracaoId(geracao.getId())
            .stream()
            .filter(e -> !escalaEhLimpeza(e))
            .toList();

        if (alvo.isEmpty()) {
            throw new BadRequestAlertException("Nenhuma escala de portaria ou recepção encontrada neste ciclo", ENTITY, "semescalas");
        }

        for (Escala escala : alvo) {
            if (escala.getStatus() == StatusEscalaPublicacao.PUBLICADA) {
                notificacaoService.notificarEscalasExcluidas(escala);
            }
            for (EscalaItem item : escalaItemRepository.findByEscalaId(escala.getId())) {
                escalaItemRepository.delete(item);
            }
            escalaRepository.delete(escala);
        }

        boolean restamEscalas = !escalaRepository.findByGeracaoId(geracao.getId()).isEmpty();
        if (!restamEscalas) {
            geracaoRepository.delete(geracao);
        }
    }

    @Transactional(readOnly = true)
    public List<EscalaLimpezaLoteDTO> listarLotesLimpeza() {
        Long igrejaId = tenantService.getIgrejaIdAtual();
        Map<String, List<Escala>> grupos = new LinkedHashMap<>();

        for (Escala escala : escalaRepository.findByIgrejaIdOrderByDataEventoDesc(igrejaId)) {
            if (!escalaEhLimpeza(escala)) {
                continue;
            }
            String chave = extrairChaveLoteLimpeza(escala);
            grupos.computeIfAbsent(chave, k -> new ArrayList<>()).add(escala);
        }

        return grupos
            .entrySet()
            .stream()
            .map(entry -> toLoteLimpezaDto(entry.getKey(), entry.getValue()))
            .sorted(Comparator.comparing(EscalaLimpezaLoteDTO::getCriadoEm, Comparator.nullsLast(Comparator.reverseOrder())))
            .toList();
    }

    public void excluirLoteLimpeza(String chave) {
        if (chave == null || chave.isBlank()) {
            throw new BadRequestAlertException("Lote inválido", ENTITY, "loteinvalido");
        }
        List<Escala> alvo = buscarEscalasDoLoteLimpeza(chave);
        if (alvo.isEmpty()) {
            throw new BadRequestAlertException("Lote de limpeza não encontrado", ENTITY, "lotenaoencontrado");
        }
        removerEscalas(alvo);
    }

    public EscalaLimpezaLoteDTO publicarLoteLimpeza(String chave) {
        if (chave == null || chave.isBlank()) {
            throw new BadRequestAlertException("Lote inválido", ENTITY, "loteinvalido");
        }
        List<Escala> alvo = buscarEscalasDoLoteLimpeza(chave);
        if (alvo.isEmpty()) {
            throw new BadRequestAlertException("Lote de limpeza não encontrado", ENTITY, "lotenaoencontrado");
        }
        boolean temRascunho = alvo.stream().anyMatch(e -> e.getStatus() == StatusEscalaPublicacao.RASCUNHO);
        if (!temRascunho) {
            throw new BadRequestAlertException("Este lote já foi publicado", ENTITY, "statusinvalido");
        }
        for (Escala escala : alvo) {
            escala.setStatus(StatusEscalaPublicacao.PUBLICADA);
            escalaRepository.save(escala);
            for (EscalaItem item : escalaItemRepository.findByEscalaId(escala.getId())) {
                notificacaoService.notificarEscalaItemAtribuido(escala, item);
            }
        }
        return toLoteLimpezaDto(chave, alvo);
    }

    @Transactional(readOnly = true)
    public List<EscalaDTO> listarEscalasDoLoteLimpeza(String chave) {
        if (chave == null || chave.isBlank()) {
            throw new BadRequestAlertException("Lote inválido", ENTITY, "loteinvalido");
        }
        return buscarEscalasDoLoteLimpeza(chave)
            .stream()
            .sorted(Comparator.comparing(Escala::getDataEvento, Comparator.nullsLast(Comparator.naturalOrder())))
            .map(this::toEscalaDtoComItens)
            .toList();
    }

    private List<Escala> buscarEscalasDoLoteLimpeza(String chave) {
        Long igrejaId = tenantService.getIgrejaIdAtual();
        return escalaRepository
            .findByIgrejaIdOrderByDataEventoDesc(igrejaId)
            .stream()
            .filter(this::escalaEhLimpeza)
            .filter(e -> chave.equals(extrairChaveLoteLimpeza(e)))
            .toList();
    }

    private void removerEscalas(List<Escala> escalas) {
        for (Escala escala : escalas) {
            if (escala.getStatus() == StatusEscalaPublicacao.PUBLICADA) {
                notificacaoService.notificarEscalasExcluidas(escala);
            }
            for (EscalaItem item : escalaItemRepository.findByEscalaId(escala.getId())) {
                escalaItemRepository.delete(item);
            }
            escalaRepository.delete(escala);
        }
    }

    @Transactional(readOnly = true)
    public List<EscalaAlertaSecretariaDTO> alertasSecretaria() {
        if (!usuarioPodeGerenciarEscalas()) {
            return List.of();
        }
        Long igrejaId = tenantService.getIgrejaIdAtual();
        EscalaConfigAutomatica config = resolverConfig();
        if (!Boolean.TRUE.equals(config.getAtivo())) {
            return List.of();
        }

        List<EscalaAlertaSecretariaDTO> alertas = new ArrayList<>();
        LocalDate hoje = LocalDate.now(FUSO);

        geracaoRepository.findFirstByIgrejaIdAndStatusOrderByCriadoEmDesc(igrejaId, StatusEscalaPublicacao.RASCUNHO).ifPresent(rascunho -> {
            EscalaAlertaSecretariaDTO a = new EscalaAlertaSecretariaDTO();
            a.setTipo("RASCUNHO_PENDENTE");
            a.setTitulo("Escalas em rascunho");
            a.setMensagem("Há um ciclo de escalas aguardando revisão e publicação.");
            a.setGeracaoId(rascunho.getId());
            alertas.add(a);
        });

        encontrarUltimaGeracaoPortariaRecepcao(igrejaId, StatusEscalaPublicacao.PUBLICADA).ifPresent(vigente -> {
            long dias = ChronoUnit.DAYS.between(hoje, vigente.getDataFim());
            if (dias <= config.getDiasAntecedencia()) {
                boolean temRascunhoFuturo = geracaoRepository
                    .findFirstByIgrejaIdAndStatusOrderByCriadoEmDesc(igrejaId, StatusEscalaPublicacao.RASCUNHO)
                    .filter(g -> possuiEscalasPortariaRecepcao(g.getId()))
                    .isPresent();
                if (!temRascunhoFuturo) {
                    EscalaAlertaSecretariaDTO a = new EscalaAlertaSecretariaDTO();
                    a.setTipo("GERAR_PROXIMO");
                    a.setTitulo("Gerar próximo ciclo de escalas");
                    a.setMensagem(
                        "O ciclo atual termina em " +
                        vigente.getDataFim().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) +
                        ". Gere o próximo sorteio."
                    );
                    a.setDiasRestantes((int) Math.max(dias, 0));
                    alertas.add(a);
                }
            }
        });

        if (encontrarUltimaGeracaoPortariaRecepcao(igrejaId, StatusEscalaPublicacao.PUBLICADA).isEmpty()) {
            EscalaAlertaSecretariaDTO a = new EscalaAlertaSecretariaDTO();
            a.setTipo("SEM_CICLO");
            a.setTitulo("Configure e gere o primeiro ciclo");
            a.setMensagem("Cadastre cultos, departamentos e gere o primeiro ciclo de escalas automáticas.");
            alertas.add(a);
        }

        return alertas;
    }

    @Transactional(readOnly = true)
    public List<EscalaLoginAvisoDTO> avisosLoginUsuario() {
        User user = tenantService.getUsuarioAtual();
        LocalDate hoje = LocalDate.now(FUSO);
        Instant desde = hoje.atStartOfDay(FUSO).toInstant();

        return escalaItemRepository
            .findItensUsuarioAguardandoConfirmacao(user.getId(), StatusEscalaPublicacao.PUBLICADA, desde)
            .stream()
            .filter(item -> item.getEscala() != null && EscalaNotificacaoUtils.escalaElegivelParaNotificacao(item.getEscala()))
            .map(this::toLoginAviso)
            .toList();
    }

    public void marcarAvisoLoginVisto(Long escalaItemId) {
        User user = tenantService.getUsuarioAtual();
        EscalaItem item = escalaItemRepository.findById(escalaItemId).orElseThrow(this::naoEncontrado);
        if (!Objects.equals(item.getUser().getId(), user.getId())) {
            throw new BadRequestAlertException("Acesso negado", ENTITY, "acessonegado");
        }
        if (avisoVistoRepository.existsByUserIdAndEscalaItemId(user.getId(), escalaItemId)) {
            return;
        }
        EscalaLoginAvisoVisto visto = new EscalaLoginAvisoVisto();
        visto.setUser(user);
        visto.setEscalaItem(item);
        visto.setVistoEm(Instant.now());
        avisoVistoRepository.save(visto);
    }

    public void executarRotinaAgendadaIgreja(Long igrejaId) {
        EscalaConfigAutomatica config = configRepository.findByIgrejaId(igrejaId).orElse(null);
        if (config == null || !Boolean.TRUE.equals(config.getAtivo())) {
            return;
        }
        LocalDate hoje = LocalDate.now(FUSO);
        Optional<EscalaGeracao> vigente = encontrarUltimaGeracaoPortariaRecepcao(igrejaId, StatusEscalaPublicacao.PUBLICADA);
        if (vigente.isEmpty()) {
            return;
        }
        long dias = ChronoUnit.DAYS.between(hoje, vigente.get().getDataFim());
        if (dias > config.getDiasAntecedencia()) {
            return;
        }
        boolean jaTemRascunho = geracaoRepository
            .findFirstByIgrejaIdAndStatusOrderByCriadoEmDesc(igrejaId, StatusEscalaPublicacao.RASCUNHO)
            .filter(g -> possuiEscalasPortariaRecepcao(g.getId()))
            .isPresent();
        if (jaTemRascunho) {
            return;
        }
        LOG.info("Gerando ciclo de escalas automaticamente para igreja {}", igrejaId);
        try {
            executarGeracaoParaIgreja(igrejaId, OrigemEscalaGeracao.AGENDADO, null, null);
        } catch (BadRequestAlertException e) {
            LOG.debug("Rotina agendada ignorada para igreja {}: {}", igrejaId, e.getMessage());
        }
    }

    private EscalaGeracao executarGeracaoParaIgreja(
        Long igrejaId,
        OrigemEscalaGeracao origem,
        EscopoGeracaoEscala escopo,
        GerarCicloEscalasDTO req
    ) {
        EscalaConfigAutomatica config = resolverConfig(igrejaId);
        boolean somenteLimpeza = escopo == EscopoGeracaoEscala.LIMPEZA;
        boolean somentePortariaRecepcao = escopo == EscopoGeracaoEscala.PORTARIA_RECEPCAO;
        boolean geracaoCompleta = escopo == null;

        if (!Boolean.TRUE.equals(config.getAtivo()) && !somenteLimpeza) {
            throw new BadRequestAlertException("Automação de escalas está desativada", ENTITY, "inativa");
        }

        Long igrejaIdAtual = igrejaId;
        List<CultoRegistro> cultos = cultoRegistroRepository
            .findByIgrejaIdOrderByNomeAsc(igrejaIdAtual)
            .stream()
            .filter(c -> Boolean.TRUE.equals(c.getAtivo()))
            .filter(c -> c.getTipo() == null || c.getTipo() == br.com.semear.domain.enumeration.TipoCulto.RECORRENTE)
            .toList();

        if (!somenteLimpeza && cultos.isEmpty()) {
            throw new BadRequestAlertException("Cadastre ao menos um culto regular", ENTITY, "semcultos");
        }

        boolean geraPortariaRecep = geracaoCompleta || somentePortariaRecepcao;
        boolean geraLimpeza = geracaoCompleta || somenteLimpeza;

        if (geraPortariaRecep) {
            if (!Boolean.TRUE.equals(config.getGerarPortaria()) && !Boolean.TRUE.equals(config.getGerarRecepcao())) {
                throw new BadRequestAlertException(
                    "Ative Portaria e/ou Recepção no sorteio",
                    ENTITY,
                    "semopcoes"
                );
            }
            boolean temRegraCulto = cultos
                .stream()
                .anyMatch(c -> !filtrarRegrasAtivas(c.getId(), config, true, false).isEmpty());
            if (!temRegraCulto) {
                throw new BadRequestAlertException(
                    "Configure cultos com portaria e/ou recepção",
                    ENTITY,
                    "semregras"
                );
            }
        }

        if (geraLimpeza && !Boolean.TRUE.equals(config.getGerarLimpeza())) {
            throw new BadRequestAlertException("Ative a geração de limpeza nas configurações", ENTITY, "limpezainativa");
        }

        if (
            geraPortariaRecep &&
            !Boolean.TRUE.equals(config.getGerarPortaria()) &&
            !Boolean.TRUE.equals(config.getGerarRecepcao()) &&
            !geraLimpeza
        ) {
            throw new BadRequestAlertException("Selecione ao menos um tipo de escala para gerar", ENTITY, "semopcoes");
        }

        LocalDate[] periodo = resolverPeriodoGeracao(igrejaIdAtual, config.getMesesCiclo(), escopo);
        LocalDate inicio = periodo[0];
        LocalDate fim = periodo[1];

        Optional<EscalaGeracao> rascunhoMesmoPeriodo = geracaoRepository
            .findByIgrejaIdOrderByDataInicioDesc(igrejaIdAtual)
            .stream()
            .filter(g -> g.getStatus() == StatusEscalaPublicacao.RASCUNHO)
            .filter(g -> g.getDataInicio().equals(inicio) && g.getDataFim().equals(fim))
            .findFirst();

        // Se houver mais de uma publicada no mesmo período (ex.: limpeza e portaria separadas),
        // prefere a que já tem portaria/recepção; senão a mais recente.
        Optional<EscalaGeracao> publicadaMesmoPeriodo = geracaoRepository
            .findByIgrejaIdOrderByDataInicioDesc(igrejaIdAtual)
            .stream()
            .filter(g -> g.getStatus() == StatusEscalaPublicacao.PUBLICADA)
            .filter(g -> g.getDataInicio().equals(inicio) && g.getDataFim().equals(fim))
            .max(
                Comparator
                    .comparing((EscalaGeracao g) -> possuiEscalasPortariaRecepcao(g.getId()))
                    .thenComparing(EscalaGeracao::getId)
            );

        if (somenteLimpeza && Boolean.TRUE.equals(req != null ? req.getSubstituirLimpezaExistente() : null)) {
            rascunhoMesmoPeriodo.ifPresent(this::removerEscalasLimpezaDaGeracao);
            publicadaMesmoPeriodo.ifPresent(this::removerEscalasLimpezaDaGeracao);
        }

        if (somenteLimpeza && rascunhoMesmoPeriodo.isPresent()) {
            EscalaGeracao geracao = rascunhoMesmoPeriodo.get();
            Map<Long, Integer> cargaGeracao = new HashMap<>();
            Instant historicoDesde = Instant.now().minus(365, ChronoUnit.DAYS);
            gerarEscalasLimpeza(geracao, inicio, fim, igrejaIdAtual, config, cultos, cargaGeracao, historicoDesde);
            return geracao;
        }

        if (somenteLimpeza && publicadaMesmoPeriodo.isPresent()) {
            EscalaGeracao geracao = publicadaMesmoPeriodo.get();
            Map<Long, Integer> cargaGeracao = new HashMap<>();
            Instant historicoDesde = Instant.now().minus(365, ChronoUnit.DAYS);
            gerarEscalasLimpeza(geracao, inicio, fim, igrejaIdAtual, config, cultos, cargaGeracao, historicoDesde);
            return geracao;
        }

        // Reusa só rascunho do mesmo período (sem portaria ainda). Nunca injeta em ciclo
        // já PUBLICADO — isso publicava na hora e pulava a revisão.
        if (somentePortariaRecepcao && rascunhoMesmoPeriodo.isPresent()) {
            EscalaGeracao geracao = rascunhoMesmoPeriodo.get();
            if (possuiEscalasPortariaRecepcao(geracao.getId())) {
                throw new BadRequestAlertException(
                    "Já existe rascunho de portaria/recepção neste período. Publique ou descarte antes de gerar de novo.",
                    ENTITY,
                    "rascunhoexistente"
                );
            }
            Map<Long, Integer> cargaGeracao = new HashMap<>();
            Instant historicoDesde = Instant.now().minus(365, ChronoUnit.DAYS);
            gerarEscalasPortariaRecepcao(
                geracao,
                inicio,
                fim,
                igrejaIdAtual,
                config,
                cultos,
                cargaGeracao,
                historicoDesde
            );
            return geracao;
        }

        if (
            somentePortariaRecepcao &&
            publicadaMesmoPeriodo.isPresent() &&
            possuiEscalasPortariaRecepcao(publicadaMesmoPeriodo.get().getId())
        ) {
            throw new BadRequestAlertException(
                "Já existem escalas de portaria/recepção neste período. Exclua-as antes de gerar de novo.",
                ENTITY,
                "portariaexistente"
            );
        }

        if (!somenteLimpeza && rascunhoMesmoPeriodo.isPresent()) {
            throw new BadRequestAlertException("Já existe rascunho para o próximo período", ENTITY, "rascunhoexistente");
        }

        if (
            !somenteLimpeza &&
            geracaoRepository.existsByIgrejaIdAndStatusAndDataInicioGreaterThanEqual(
                igrejaIdAtual,
                StatusEscalaPublicacao.RASCUNHO,
                inicio.minusDays(1)
            )
        ) {
            throw new BadRequestAlertException("Já existe rascunho para o próximo período", ENTITY, "rascunhoexistente");
        }

        EscalaGeracao geracao = new EscalaGeracao();
        geracao.setIgreja(igrejaRepository.findById(igrejaIdAtual).orElseThrow(this::naoEncontrado));
        geracao.setDataInicio(inicio);
        geracao.setDataFim(fim);
        geracao.setStatus(StatusEscalaPublicacao.RASCUNHO);
        geracao.setOrigem(origem);
        geracao.setCriadoEm(Instant.now());
        try {
            geracao.setCriadoPor(tenantService.getUsuarioAtual());
        } catch (Exception ignored) {
            // scheduler sem usuário logado
        }
        geracao = geracaoRepository.save(geracao);

        Map<Long, Integer> cargaGeracao = new HashMap<>();
        Instant historicoDesde = Instant.now().minus(365, ChronoUnit.DAYS);

        if (geraPortariaRecep) {
            gerarEscalasPortariaRecepcao(
                geracao,
                inicio,
                fim,
                igrejaIdAtual,
                config,
                cultos,
                cargaGeracao,
                historicoDesde
            );
        }

        if (geraLimpeza && Boolean.TRUE.equals(config.getGerarLimpeza())) {
            gerarEscalasLimpeza(geracao, inicio, fim, igrejaIdAtual, config, cultos, cargaGeracao, historicoDesde);
        }

        return geracao;
    }

    private void gerarEscalasPortariaRecepcao(
        EscalaGeracao geracao,
        LocalDate inicio,
        LocalDate fim,
        Long igrejaId,
        EscalaConfigAutomatica config,
        List<CultoRegistro> cultos,
        Map<Long, Integer> cargaGeracao,
        Instant historicoDesde
    ) {
        for (LocalDate data = inicio; !data.isAfter(fim); data = data.plusDays(1)) {
            for (CultoRegistro culto : cultos) {
                if (!CultoRecorrenciaUtils.cultoOcorreNaData(culto, data)) {
                    continue;
                }
                List<CultoEscalaRegra> regras = filtrarRegrasAtivas(culto.getId(), config, true, false);
                if (regras.isEmpty()) {
                    continue;
                }

                if (Boolean.TRUE.equals(config.getAgruparPortariaRecepcao())) {
                    Optional<CultoEscalaRegra> portaria = regras
                        .stream()
                        .filter(r -> departamentoEhCodigo(r.getDepartamento(), CodigoDepartamento.PORTARIA))
                        .findFirst();
                    Optional<CultoEscalaRegra> recepcao = regras
                        .stream()
                        .filter(r -> departamentoEhCodigo(r.getDepartamento(), CodigoDepartamento.RECEPCAO))
                        .findFirst();
                    boolean agrupou = false;
                    if (
                        portaria.isPresent() &&
                        recepcao.isPresent() &&
                        Boolean.TRUE.equals(config.getGerarPortaria()) &&
                        Boolean.TRUE.equals(config.getGerarRecepcao())
                    ) {
                        Departamento deptPortaria = departamentoRepository
                            .findByIdAndIgrejaId(portaria.get().getDepartamento().getId(), igrejaId)
                            .orElse(null);
                        Departamento deptRecepcao = departamentoRepository
                            .findByIdAndIgrejaId(recepcao.get().getDepartamento().getId(), igrejaId)
                            .orElse(null);
                        if (deptPortaria != null && deptRecepcao != null) {
                            criarEscalaAgrupadaPortariaRecepcao(
                                geracao,
                                culto,
                                portaria.get(),
                                recepcao.get(),
                                deptPortaria,
                                deptRecepcao,
                                data,
                                cargaGeracao,
                                historicoDesde
                            );
                            agrupou = true;
                        }
                    }
                    for (CultoEscalaRegra regra : regras) {
                        if (
                            agrupou &&
                            (departamentoEhCodigo(regra.getDepartamento(), CodigoDepartamento.PORTARIA) ||
                                departamentoEhCodigo(regra.getDepartamento(), CodigoDepartamento.RECEPCAO))
                        ) {
                            continue;
                        }
                        processarRegraIndividual(
                            geracao,
                            culto,
                            regra,
                            igrejaId,
                            data,
                            cargaGeracao,
                            historicoDesde,
                            config,
                            true,
                            false
                        );
                    }
                } else {
                    for (CultoEscalaRegra regra : regras) {
                        processarRegraIndividual(
                            geracao,
                            culto,
                            regra,
                            igrejaId,
                            data,
                            cargaGeracao,
                            historicoDesde,
                            config,
                            true,
                            false
                        );
                    }
                }
            }
        }
    }

    private void processarRegraIndividual(
        EscalaGeracao geracao,
        CultoRegistro culto,
        CultoEscalaRegra regra,
        Long igrejaId,
        LocalDate data,
        Map<Long, Integer> cargaGeracao,
        Instant historicoDesde,
        EscalaConfigAutomatica config,
        boolean incluirPortariaRecepcao,
        boolean incluirLimpeza
    ) {
        Long deptId = regra.getDepartamento() != null ? regra.getDepartamento().getId() : null;
        if (deptId == null) {
            return;
        }
        Departamento departamento = departamentoRepository.findByIdAndIgrejaId(deptId, igrejaId).orElse(null);
        if (departamento == null || !regraPermitidaPelaConfig(departamento, config, incluirPortariaRecepcao, incluirLimpeza)) {
            return;
        }
        if (Boolean.TRUE.equals(config.getGerarLimpeza()) && departamentoEhCodigo(departamento, CodigoDepartamento.LIMPEZA) && resolverModoLimpeza(config) != ModoLimpezaEscala.POR_CULTO) {
            return;
        }
        criarEscalaSorteada(geracao, culto, regra, departamento, data, cargaGeracao, historicoDesde);
    }

    private List<CultoEscalaRegra> filtrarRegrasAtivas(
        Long cultoId,
        EscalaConfigAutomatica config,
        boolean incluirPortariaRecepcao,
        boolean incluirLimpeza
    ) {
        return cultoEscalaRegraRepository
            .findByCultoRegistroId(cultoId)
            .stream()
            .filter(r -> Boolean.TRUE.equals(r.getAtivo()))
            .filter(r -> r.getDepartamento() != null && regraPermitidaPelaConfig(r.getDepartamento(), config, incluirPortariaRecepcao, incluirLimpeza))
            .toList();
    }

    private boolean regraPermitidaPelaConfig(
        Departamento departamento,
        EscalaConfigAutomatica config,
        boolean incluirPortariaRecepcao,
        boolean incluirLimpeza
    ) {
        if (departamentoEhCodigo(departamento, CodigoDepartamento.PORTARIA)) {
            return incluirPortariaRecepcao && Boolean.TRUE.equals(config.getGerarPortaria());
        }
        if (departamentoEhCodigo(departamento, CodigoDepartamento.RECEPCAO)) {
            return incluirPortariaRecepcao && Boolean.TRUE.equals(config.getGerarRecepcao());
        }
        if (departamentoEhCodigo(departamento, CodigoDepartamento.LIMPEZA)) {
            return incluirLimpeza && Boolean.TRUE.equals(config.getGerarLimpeza()) && resolverModoLimpeza(config) == ModoLimpezaEscala.POR_CULTO;
        }
        return incluirPortariaRecepcao;
    }

    private boolean departamentoEhCodigo(Departamento departamento, CodigoDepartamento codigo) {
        if (departamento == null) {
            return false;
        }
        if (codigo.equals(departamento.getCodigo())) {
            return true;
        }
        String nome = departamento.getNome() != null ? departamento.getNome().toLowerCase() : "";
        return switch (codigo) {
            case PORTARIA -> nome.contains("portaria");
            case RECEPCAO -> nome.contains("recep");
            case LIMPEZA -> nome.contains("limpeza");
            case OUTRO -> false;
        };
    }

    private void gerarEscalasLimpeza(
        EscalaGeracao geracao,
        LocalDate inicio,
        LocalDate fim,
        Long igrejaId,
        EscalaConfigAutomatica config,
        List<CultoRegistro> cultos,
        Map<Long, Integer> cargaGeracao,
        Instant historicoDesde
    ) {
        ModoLimpezaEscala modo = resolverModoLimpeza(config);
        String loteChave = geracao.getId() + "-" + Instant.now().toEpochMilli() + "-" + modo.name();
        switch (modo) {
            case MENSAL -> gerarEscalasLimpezaMensal(geracao, inicio, fim, igrejaId, config, cargaGeracao, historicoDesde, loteChave);
            case SEMANAL -> gerarEscalasLimpezaSemanal(geracao, inicio, fim, igrejaId, config, cargaGeracao, historicoDesde, loteChave);
            case POR_CULTO -> gerarEscalasLimpezaPorCulto(geracao, inicio, fim, igrejaId, cultos, cargaGeracao, historicoDesde, loteChave);
        }
    }

    private ModoLimpezaEscala resolverModoLimpeza(EscalaConfigAutomatica config) {
        if (config.getModoLimpeza() != null) {
            return config.getModoLimpeza();
        }
        return Boolean.TRUE.equals(config.getLimpezaMensal()) ? ModoLimpezaEscala.MENSAL : ModoLimpezaEscala.POR_CULTO;
    }

    private void gerarEscalasLimpezaSemanal(
        EscalaGeracao geracao,
        LocalDate inicio,
        LocalDate fim,
        Long igrejaId,
        EscalaConfigAutomatica config,
        Map<Long, Integer> cargaGeracao,
        Instant historicoDesde,
        String loteChave
    ) {
        Departamento limpeza = departamentoRepository
            .findByIgrejaIdOrderByNomeAsc(igrejaId)
            .stream()
            .filter(d -> departamentoEhCodigo(d, CodigoDepartamento.LIMPEZA))
            .findFirst()
            .orElse(null);
        if (limpeza == null) {
            LOG.warn("Limpeza semanal ativada mas departamento Limpeza não encontrado na igreja {}", igrejaId);
            return;
        }

        CultoEscalaRegra regraLimpeza = new CultoEscalaRegra();
        regraLimpeza.setRegraGenero(RegraGeneroEscala.QUALQUER);
        DiaSemanaCulto diaLimpeza = config.getDiaSemanaLimpeza() != null ? config.getDiaSemanaLimpeza() : DiaSemanaCulto.DOMINGO;

        for (LocalDate data = inicio; !data.isAfter(fim); data = data.plusDays(1)) {
            if (!diaCompativel(data, diaLimpeza)) {
                continue;
            }
            if (jaExisteLimpezaNaData(geracao, data, limpeza.getId())) {
                continue;
            }
            CultoRegistro cultoVirtual = new CultoRegistro();
            cultoVirtual.setNome("Limpeza semanal");
            cultoVirtual.setHorario("08:00");
            criarEscalaSorteada(geracao, cultoVirtual, regraLimpeza, limpeza, data, cargaGeracao, historicoDesde, loteChave);
        }
    }

    private void gerarEscalasLimpezaPorCulto(
        EscalaGeracao geracao,
        LocalDate inicio,
        LocalDate fim,
        Long igrejaId,
        List<CultoRegistro> cultos,
        Map<Long, Integer> cargaGeracao,
        Instant historicoDesde,
        String loteChave
    ) {
        Departamento limpeza = departamentoRepository
            .findByIgrejaIdOrderByNomeAsc(igrejaId)
            .stream()
            .filter(d -> departamentoEhCodigo(d, CodigoDepartamento.LIMPEZA))
            .findFirst()
            .orElse(null);
        if (limpeza == null) {
            LOG.warn("Limpeza por culto ativada mas departamento Limpeza não encontrado na igreja {}", igrejaId);
            return;
        }

        CultoEscalaRegra regraLimpeza = new CultoEscalaRegra();
        regraLimpeza.setRegraGenero(RegraGeneroEscala.QUALQUER);

        for (LocalDate data = inicio; !data.isAfter(fim); data = data.plusDays(1)) {
            for (CultoRegistro culto : cultos) {
                if (!CultoRecorrenciaUtils.cultoOcorreNaData(culto, data)) {
                    continue;
                }
                criarEscalaSorteada(geracao, culto, regraLimpeza, limpeza, data, cargaGeracao, historicoDesde, loteChave);
            }
        }
    }

    private void gerarEscalasLimpezaMensal(
        EscalaGeracao geracao,
        LocalDate inicio,
        LocalDate fim,
        Long igrejaId,
        EscalaConfigAutomatica config,
        Map<Long, Integer> cargaGeracao,
        Instant historicoDesde,
        String loteChave
    ) {
        Departamento limpeza = departamentoRepository
            .findByIgrejaIdOrderByNomeAsc(igrejaId)
            .stream()
            .filter(d -> departamentoEhCodigo(d, CodigoDepartamento.LIMPEZA))
            .findFirst()
            .orElse(null);
        if (limpeza == null) {
            LOG.warn("Limpeza mensal ativada mas departamento Limpeza não encontrado na igreja {}", igrejaId);
            return;
        }

        CultoEscalaRegra regraLimpeza = new CultoEscalaRegra();
        regraLimpeza.setRegraGenero(RegraGeneroEscala.QUALQUER);

        YearMonth mesAtual = YearMonth.from(inicio);
        YearMonth mesFim = YearMonth.from(fim);
        DiaSemanaCulto diaLimpeza = config.getDiaSemanaLimpeza() != null ? config.getDiaSemanaLimpeza() : DiaSemanaCulto.DOMINGO;
        while (!mesAtual.isAfter(mesFim)) {
            LocalDate dataLimpeza = primeiroDiaSemanaDoMes(mesAtual, diaLimpeza);
            if (dataLimpeza.isBefore(inicio)) {
                dataLimpeza = inicio;
            }
            if (!dataLimpeza.isAfter(fim) && !jaExisteLimpezaNaData(geracao, dataLimpeza, limpeza.getId())) {
                CultoRegistro cultoVirtual = new CultoRegistro();
                cultoVirtual.setNome("Limpeza mensal");
                cultoVirtual.setHorario("08:00");
                criarEscalaSorteada(geracao, cultoVirtual, regraLimpeza, limpeza, dataLimpeza, cargaGeracao, historicoDesde, loteChave);
            }
            mesAtual = mesAtual.plusMonths(1);
        }
    }

    private boolean jaExisteLimpezaNaData(EscalaGeracao geracao, LocalDate data, Long departamentoLimpezaId) {
        Instant desde = data.atStartOfDay(FUSO).toInstant();
        Instant ate = data.atTime(23, 59, 59).atZone(FUSO).toInstant();
        return escalaRepository
            .findByGeracaoId(geracao.getId())
            .stream()
            .anyMatch(e ->
                e.getDepartamento() != null &&
                Objects.equals(e.getDepartamento().getId(), departamentoLimpezaId) &&
                e.getDataEvento() != null &&
                !e.getDataEvento().isBefore(desde) &&
                !e.getDataEvento().isAfter(ate)
            );
    }

    private LocalDate primeiroDiaSemanaDoMes(YearMonth mes, DiaSemanaCulto diaSemana) {
        LocalDate dia = mes.atDay(1);
        while (!diaCompativel(dia, diaSemana)) {
            dia = dia.plusDays(1);
        }
        return dia;
    }

    private void criarEscalaAgrupadaPortariaRecepcao(
        EscalaGeracao geracao,
        CultoRegistro culto,
        CultoEscalaRegra regraPortaria,
        CultoEscalaRegra regraRecepcao,
        Departamento deptPortaria,
        Departamento deptRecepcao,
        LocalDate data,
        Map<Long, Integer> cargaGeracao,
        Instant historicoDesde
    ) {
        User homem = escolherMembro(deptPortaria, regraPortaria.getRegraGenero(), cargaGeracao, historicoDesde);
        User mulher = escolherMembro(deptRecepcao, regraRecepcao.getRegraGenero(), cargaGeracao, historicoDesde);
        if (homem == null || mulher == null) {
            if (homem != null) {
                criarEscalaSorteada(geracao, culto, regraPortaria, deptPortaria, data, cargaGeracao, historicoDesde);
            }
            if (mulher != null) {
                criarEscalaSorteada(geracao, culto, regraRecepcao, deptRecepcao, data, cargaGeracao, historicoDesde);
            }
            return;
        }

        Escala escala = new Escala();
        escala.setIgreja(geracao.getIgreja());
        escala.setDepartamento(deptPortaria);
        escala.setCultoRegistro(culto);
        escala.setGeracao(geracao);
        escala.setStatus(StatusEscalaPublicacao.RASCUNHO);
        escala.setTitulo(
            "Portaria e Recepção — " + culto.getNome() + " " + data.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
        );
        escala.setDataEvento(combinarDataHorario(data, culto.getHorario()));
        escala.setCriadoEm(Instant.now());
        escala = escalaRepository.save(escala);

        EscalaItem itemPortaria = new EscalaItem();
        itemPortaria.setEscala(escala);
        itemPortaria.setUser(homem);
        itemPortaria.setFuncao(deptPortaria.getNome());
        itemPortaria.setConfirmado(false);
        escalaItemRepository.save(itemPortaria);

        EscalaItem itemRecepcao = new EscalaItem();
        itemRecepcao.setEscala(escala);
        itemRecepcao.setUser(mulher);
        itemRecepcao.setFuncao(deptRecepcao.getNome());
        itemRecepcao.setConfirmado(false);
        escalaItemRepository.save(itemRecepcao);
    }

    private User escolherMembro(
        Departamento departamento,
        RegraGeneroEscala regraGenero,
        Map<Long, Integer> cargaGeracao,
        Instant historicoDesde
    ) {
        List<DepartamentoMembro> membros = departamentoMembroRepository.findByDepartamentoId(departamento.getId());
        List<User> elegiveis = membros
            .stream()
            .map(DepartamentoMembro::getUser)
            .filter(Objects::nonNull)
            .filter(u -> Boolean.TRUE.equals(u.isActivated()) && !u.isDependente())
            .filter(u -> compativelGenero(u, regraGenero))
            .toList();
        if (elegiveis.isEmpty()) {
            LOG.warn("Sem membros elegíveis para departamento {}", departamento.getId());
            return null;
        }
        User escolhido = elegiveis
            .stream()
            .min(
                Comparator.comparingLong((User u) ->
                    escalaRepository.countServicosUsuarioDesde(departamento.getId(), u.getId(), StatusEscalaPublicacao.PUBLICADA, historicoDesde) +
                    cargaGeracao.getOrDefault(u.getId(), 0)
                ).thenComparing(User::getId)
            )
            .orElse(null);
        if (escolhido != null) {
            cargaGeracao.merge(escolhido.getId(), 1, Integer::sum);
        }
        return escolhido;
    }

    private void criarEscalaSorteada(
        EscalaGeracao geracao,
        CultoRegistro culto,
        CultoEscalaRegra regra,
        Departamento departamento,
        LocalDate data,
        Map<Long, Integer> cargaGeracao,
        Instant historicoDesde
    ) {
        criarEscalaSorteada(geracao, culto, regra, departamento, data, cargaGeracao, historicoDesde, null);
    }

    private void criarEscalaSorteada(
        EscalaGeracao geracao,
        CultoRegistro culto,
        CultoEscalaRegra regra,
        Departamento departamento,
        LocalDate data,
        Map<Long, Integer> cargaGeracao,
        Instant historicoDesde,
        String loteLimpezaChave
    ) {
        User escolhido = escolherMembro(departamento, regra.getRegraGenero(), cargaGeracao, historicoDesde);
        if (escolhido == null) {
            return;
        }

        Escala escala = new Escala();
        escala.setIgreja(geracao.getIgreja());
        escala.setDepartamento(departamento);
        if (culto.getId() != null) {
            escala.setCultoRegistro(culto);
        }
        escala.setGeracao(geracao);
        // Sorteio sempre nasce em rascunho; publicação (ciclo ou lote) é que libera.
        escala.setStatus(StatusEscalaPublicacao.RASCUNHO);
        escala.setTitulo(departamento.getNome() + " — " + culto.getNome() + " " + data.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        escala.setDataEvento(combinarDataHorario(data, culto.getHorario()));
        if (loteLimpezaChave != null) {
            escala.setObservacao(LOTE_LIMPEZA_PREFIX + loteLimpezaChave);
        }
        escala.setCriadoEm(Instant.now());
        escala = escalaRepository.save(escala);

        EscalaItem item = new EscalaItem();
        item.setEscala(escala);
        item.setUser(escolhido);
        item.setFuncao(departamento.getNome());
        item.setConfirmado(false);
        escalaItemRepository.save(item);

        if (escala.getStatus() == StatusEscalaPublicacao.PUBLICADA) {
            notificacaoService.notificarEscalaItemAtribuido(escala, item);
        }
    }

    private LocalDate[] resolverPeriodoGeracao(Long igrejaId, int mesesCiclo, EscopoGeracaoEscala escopo) {
        if (escopo == EscopoGeracaoEscala.LIMPEZA) {
            LocalDate hoje = LocalDate.now(FUSO);

            Optional<EscalaGeracao> rascunho = geracaoRepository
                .findFirstByIgrejaIdAndStatusOrderByCriadoEmDesc(igrejaId, StatusEscalaPublicacao.RASCUNHO);
            if (rascunho.isPresent()) {
                EscalaGeracao g = rascunho.get();
                return new LocalDate[] { g.getDataInicio(), g.getDataFim() };
            }

            Optional<EscalaGeracao> vigente = geracaoRepository
                .findByIgrejaIdOrderByDataInicioDesc(igrejaId)
                .stream()
                .filter(g -> g.getStatus() == StatusEscalaPublicacao.PUBLICADA)
                .filter(g -> !hoje.isBefore(g.getDataInicio()) && !hoje.isAfter(g.getDataFim()))
                .findFirst();
            if (vigente.isPresent()) {
                EscalaGeracao g = vigente.get();
                return new LocalDate[] { g.getDataInicio(), g.getDataFim() };
            }

            Optional<EscalaGeracao> ultimaPublicada = geracaoRepository.findFirstByIgrejaIdAndStatusOrderByDataFimDesc(
                igrejaId,
                StatusEscalaPublicacao.PUBLICADA
            );
            if (ultimaPublicada.isPresent()) {
                EscalaGeracao g = ultimaPublicada.get();
                return new LocalDate[] { g.getDataInicio(), g.getDataFim() };
            }
        }
        return calcularProximoPeriodo(igrejaId, mesesCiclo);
    }

    private LocalDate[] calcularProximoPeriodo(Long igrejaId, int mesesCiclo) {
        LocalDate hoje = LocalDate.now(FUSO);
        Optional<EscalaGeracao> ultimaPublicada = encontrarUltimaGeracaoPortariaRecepcao(
            igrejaId,
            StatusEscalaPublicacao.PUBLICADA
        );
        LocalDate inicio;
        if (ultimaPublicada.isPresent()) {
            inicio = ultimaPublicada.get().getDataFim().plusDays(1);
        } else {
            inicio = hoje;
        }
        LocalDate fim = inicio.plusMonths(mesesCiclo).minusDays(1);
        return new LocalDate[] { inicio, fim };
    }

    private boolean compativelGenero(User user, RegraGeneroEscala regra) {
        if (regra == null || regra == RegraGeneroEscala.QUALQUER) {
            return true;
        }
        if (user.getSexo() == null) {
            return false;
        }
        return switch (regra) {
            case MASCULINO -> user.getSexo() == Sexo.MASCULINO;
            case FEMININO -> user.getSexo() == Sexo.FEMININO;
            case QUALQUER -> true;
        };
    }

    private boolean diaCompativel(LocalDate data, DiaSemanaCulto diaSemana) {
        return CultoRecorrenciaUtils.diaCompativel(data, diaSemana);
    }

    private Instant combinarDataHorario(LocalDate data, String horario) {
        try {
            LocalTime time = LocalTime.parse(horario.length() == 5 ? horario : horario.substring(0, 5));
            return data.atTime(time).atZone(FUSO).toInstant();
        } catch (Exception e) {
            return data.atTime(19, 0).atZone(FUSO).toInstant();
        }
    }

    private EscalaConfigAutomatica resolverConfig() {
        return resolverConfig(tenantService.getIgrejaIdAtual());
    }

    private EscalaConfigAutomatica resolverConfig(Long igrejaId) {
        EscalaConfigAutomatica config = configRepository.findByIgrejaId(igrejaId).orElseGet(() -> {
            EscalaConfigAutomatica c = new EscalaConfigAutomatica();
            c.setIgreja(igrejaRepository.findById(igrejaId).orElseThrow(this::naoEncontrado));
            c.setMesesCiclo(3);
            c.setDiasAntecedencia(14);
            c.setAtivo(true);
            c.setGerarPortaria(true);
            c.setGerarRecepcao(true);
            c.setGerarLimpeza(false);
            c.setAgruparPortariaRecepcao(false);
            c.setLimpezaMensal(true);
            c.setModoLimpeza(ModoLimpezaEscala.MENSAL);
            c.setDiaSemanaLimpeza(DiaSemanaCulto.DOMINGO);
            c.setAtualizadoEm(Instant.now());
            return configRepository.save(c);
        });
        if (config.getDiaSemanaLimpeza() == null) {
            config.setDiaSemanaLimpeza(DiaSemanaCulto.DOMINGO);
        }
        if (config.getModoLimpeza() == null) {
            config.setModoLimpeza(Boolean.TRUE.equals(config.getLimpezaMensal()) ? ModoLimpezaEscala.MENSAL : ModoLimpezaEscala.POR_CULTO);
        }
        return config;
    }

    private void validarCulto(CultoRegistroDTO dto) {
        if (dto.getNome() == null || dto.getNome().isBlank()) {
            throw new BadRequestAlertException("Nome do culto é obrigatório", ENTITY, "nomeobrigatorio");
        }
        if (dto.getHorario() == null || dto.getHorario().isBlank()) {
            throw new BadRequestAlertException("Horário é obrigatório", ENTITY, "horarioobrigatorio");
        }
        br.com.semear.domain.enumeration.TipoCulto tipo =
            dto.getTipo() != null ? dto.getTipo() : br.com.semear.domain.enumeration.TipoCulto.RECORRENTE;
        if (tipo == br.com.semear.domain.enumeration.TipoCulto.EXTRAORDINARIO) {
            if (dto.getDataEspecifica() == null) {
                throw new BadRequestAlertException("Data é obrigatória para culto extraordinário", ENTITY, "dataobrigatoria");
            }
            if (dto.getDiaSemana() == null) {
                dto.setDiaSemana(CultoRecorrenciaUtils.diaSemanaDe(dto.getDataEspecifica()));
            }
            return;
        }
        if (dto.getDiaSemana() == null) {
            throw new BadRequestAlertException("Dia da semana é obrigatório", ENTITY, "diaobrigatorio");
        }
        FrequenciaCulto freq = dto.getFrequencia() != null ? dto.getFrequencia() : FrequenciaCulto.TODA_SEMANA;
        dto.setFrequencia(freq);
        if (freq == FrequenciaCulto.SEMANAS_ALTERNADAS) {
            if (dto.getDataAncora() == null) {
                throw new BadRequestAlertException(
                    "Informe a primeira ocorrência para cultos em semanas alternadas",
                    ENTITY,
                    "ancoraobrigatoria"
                );
            }
            if (!CultoRecorrenciaUtils.diaCompativel(dto.getDataAncora(), dto.getDiaSemana())) {
                throw new BadRequestAlertException(
                    "A data da primeira ocorrência deve cair no dia da semana do culto",
                    ENTITY,
                    "ancorainvalida"
                );
            }
        } else {
            dto.setDataAncora(null);
        }
    }

    private DiaSemanaCulto diaSemanaDe(java.time.LocalDate data) {
        return CultoRecorrenciaUtils.diaSemanaDe(data);
    }

    private CultoRegistroDTO toCultoDto(CultoRegistro entity) {
        CultoRegistroDTO dto = new CultoRegistroDTO();
        dto.setId(entity.getId());
        dto.setNome(entity.getNome());
        dto.setDiaSemana(entity.getDiaSemana());
        dto.setHorario(entity.getHorario());
        dto.setTipo(entity.getTipo() != null ? entity.getTipo() : br.com.semear.domain.enumeration.TipoCulto.RECORRENTE);
        dto.setDataEspecifica(entity.getDataEspecifica());
        dto.setFrequencia(entity.getFrequencia() != null ? entity.getFrequencia() : FrequenciaCulto.TODA_SEMANA);
        dto.setDataAncora(entity.getDataAncora());
        dto.setAtivo(entity.getAtivo());
        dto.setRegras(
            cultoEscalaRegraRepository.findByCultoRegistroId(entity.getId()).stream().map(this::toRegraDto).toList()
        );
        return dto;
    }

    private CultoEscalaRegraDTO toRegraDto(CultoEscalaRegra entity) {
        CultoEscalaRegraDTO dto = new CultoEscalaRegraDTO();
        dto.setId(entity.getId());
        if (entity.getDepartamento() != null && entity.getDepartamento().getId() != null) {
            dto.setDepartamentoId(entity.getDepartamento().getId());
            departamentoRepository.findById(entity.getDepartamento().getId()).ifPresent(d -> dto.setDepartamentoNome(d.getNome()));
        }
        dto.setRegraGenero(entity.getRegraGenero());
        dto.setAtivo(entity.getAtivo());
        return dto;
    }

    private EscalaConfigAutomaticaDTO toConfigDto(EscalaConfigAutomatica entity) {
        EscalaConfigAutomaticaDTO dto = new EscalaConfigAutomaticaDTO();
        dto.setId(entity.getId());
        dto.setMesesCiclo(entity.getMesesCiclo());
        dto.setDiasAntecedencia(entity.getDiasAntecedencia());
        dto.setAtivo(entity.getAtivo());
        dto.setGerarPortaria(entity.getGerarPortaria());
        dto.setGerarRecepcao(entity.getGerarRecepcao());
        dto.setGerarLimpeza(entity.getGerarLimpeza());
        dto.setAgruparPortariaRecepcao(entity.getAgruparPortariaRecepcao());
        dto.setLimpezaMensal(entity.getLimpezaMensal());
        dto.setModoLimpeza(entity.getModoLimpeza() != null ? entity.getModoLimpeza() : resolverModoLimpeza(entity));
        dto.setDiaSemanaLimpeza(entity.getDiaSemanaLimpeza());
        return dto;
    }

    private EscalaDTO toEscalaDtoComItens(Escala entity) {
        EscalaDTO dto = new EscalaDTO();
        dto.setId(entity.getId());
        if (entity.getIgreja() != null) {
            dto.setIgrejaId(entity.getIgreja().getId());
        }
        if (entity.getDepartamento() != null) {
            dto.setDepartamentoId(entity.getDepartamento().getId());
            dto.setDepartamentoNome(entity.getDepartamento().getNome());
        }
        dto.setTitulo(entity.getTitulo());
        dto.setDataEvento(entity.getDataEvento());
        dto.setObservacao(entity.getObservacao());
        dto.setStatus(entity.getStatus() != null ? entity.getStatus().name() : StatusEscalaPublicacao.PUBLICADA.name());
        dto.setCriadoEm(entity.getCriadoEm());
        dto.setItens(
            escalaItemRepository.findByEscalaId(entity.getId()).stream().map(item -> {
                EscalaItemDTO itemDto = new EscalaItemDTO();
                itemDto.setId(item.getId());
                itemDto.setEscalaId(entity.getId());
                if (item.getUser() != null) {
                    itemDto.setUserId(item.getUser().getId());
                    String nome =
                        ((item.getUser().getFirstName() != null ? item.getUser().getFirstName() : "") +
                            (item.getUser().getLastName() != null ? " " + item.getUser().getLastName() : "")).trim();
                    itemDto.setUserNome(nome);
                }
                itemDto.setFuncao(item.getFuncao());
                itemDto.setConfirmado(item.getConfirmado());
                itemDto.setConfirmadoEm(item.getConfirmadoEm());
                return itemDto;
            }).toList()
        );
        return dto;
    }

    private EscalaGeracaoDTO toGeracaoDto(EscalaGeracao entity) {
        EscalaGeracaoDTO dto = new EscalaGeracaoDTO();
        dto.setId(entity.getId());
        dto.setDataInicio(entity.getDataInicio());
        dto.setDataFim(entity.getDataFim());
        dto.setStatus(entity.getStatus());
        dto.setOrigem(entity.getOrigem());
        dto.setCriadoEm(entity.getCriadoEm());
        dto.setPublicadoEm(entity.getPublicadoEm());
        dto.setTotalEscalas(
            (int) escalaRepository.findByGeracaoId(entity.getId()).stream().filter(e -> !escalaEhLimpeza(e)).count()
        );
        return dto;
    }

    private boolean possuiEscalasPortariaRecepcao(Long geracaoId) {
        return escalaRepository.findByGeracaoId(geracaoId).stream().anyMatch(e -> !escalaEhLimpeza(e));
    }

    private EscalaLoginAvisoDTO toLoginAviso(EscalaItem item) {
        Escala escala = item.getEscala();
        EscalaLoginAvisoDTO dto = new EscalaLoginAvisoDTO();
        dto.setEscalaItemId(item.getId());
        dto.setEscalaId(escala.getId());
        dto.setTituloEscala(escala.getTitulo());
        dto.setFuncao(item.getFuncao());
        dto.setDataEvento(escala.getDataEvento());
        if (escala.getDepartamento() != null) {
            dto.setDepartamentoNome(escala.getDepartamento().getNome());
            dto.setOrientacoesServico(escala.getDepartamento().getOrientacoesServico());
        }
        if (escala.getCultoRegistro() != null) {
            dto.setCultoNome(escala.getCultoRegistro().getNome());
        }
        return dto;
    }

    private boolean usuarioPodeGerenciarEscalas() {
        try {
            User user = tenantService.getUsuarioAtual();
            return user
                .getAuthorities()
                .stream()
                .anyMatch(a ->
                    AuthoritiesConstants.SECRETARIA.equals(a.getName()) ||
                    AuthoritiesConstants.ADMIN.equals(a.getName()) ||
                    AuthoritiesConstants.ADMIN_IGREJA.equals(a.getName()) ||
                    AuthoritiesConstants.PASTOR.equals(a.getName()) ||
                    AuthoritiesConstants.COPASTOR.equals(a.getName())
                );
        } catch (Exception e) {
            return false;
        }
    }

    private void removerEscalasLimpezaDaGeracao(EscalaGeracao geracao) {
        for (Escala escala : escalaRepository.findByGeracaoId(geracao.getId())) {
            if (!escalaEhLimpeza(escala)) {
                continue;
            }
            if (escala.getStatus() == StatusEscalaPublicacao.PUBLICADA) {
                notificacaoService.notificarEscalasExcluidas(escala);
            }
            for (EscalaItem item : escalaItemRepository.findByEscalaId(escala.getId())) {
                escalaItemRepository.delete(item);
            }
            escalaRepository.delete(escala);
        }
    }

    private boolean escalaEhLimpeza(Escala escala) {
        return escala.getDepartamento() != null && departamentoEhCodigo(escala.getDepartamento(), CodigoDepartamento.LIMPEZA);
    }

    private String extrairChaveLoteLimpeza(Escala escala) {
        String obs = escala.getObservacao();
        if (obs != null && obs.startsWith(LOTE_LIMPEZA_PREFIX)) {
            return obs.substring(LOTE_LIMPEZA_PREFIX.length());
        }
        Long geracaoId = escala.getGeracao() != null ? escala.getGeracao().getId() : 0L;
        String modo = inferirModoLimpeza(escala.getTitulo());
        Instant criado = escala.getCriadoEm() != null ? escala.getCriadoEm() : Instant.EPOCH;
        long minuto = criado.truncatedTo(ChronoUnit.MINUTES).toEpochMilli();
        return "legacy-" + geracaoId + "-" + modo + "-" + minuto;
    }

    private String inferirModoLimpeza(String titulo) {
        if (titulo != null && titulo.toLowerCase().contains("limpeza mensal")) {
            return "MENSAL";
        }
        if (titulo != null && titulo.toLowerCase().contains("limpeza semanal")) {
            return "SEMANAL";
        }
        return "POR_CULTO";
    }

    private EscalaLimpezaLoteDTO toLoteLimpezaDto(String chave, List<Escala> escalas) {
        Escala referencia = escalas.get(0);
        EscalaLimpezaLoteDTO dto = new EscalaLimpezaLoteDTO();
        dto.setChave(chave);
        dto.setGeracaoId(referencia.getGeracao() != null ? referencia.getGeracao().getId() : null);
        dto.setTotalEscalas(escalas.size());

        Instant criado = escalas
            .stream()
            .map(Escala::getCriadoEm)
            .filter(Objects::nonNull)
            .min(Comparator.naturalOrder())
            .orElse(null);
        if (criado != null) {
            dto.setCriadoEm(criado.toString());
        }

        if (chave.startsWith("legacy-")) {
            String[] partes = chave.split("-");
            if (partes.length >= 3) {
                dto.setModo(partes[2]);
            }
        } else if (chave.endsWith("-MENSAL")) {
            dto.setModo("MENSAL");
        } else if (chave.contains("SEMANAL")) {
            dto.setModo("SEMANAL");
        } else if (chave.contains("POR_CULTO")) {
            dto.setModo("POR_CULTO");
        } else {
            dto.setModo(inferirModoLimpeza(referencia.getTitulo()));
        }

        if (referencia.getGeracao() != null) {
            EscalaGeracao g = referencia.getGeracao();
            dto.setCicloPeriodo(
                g.getDataInicio().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) +
                " — " +
                g.getDataFim().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
            );
        }

        boolean temRascunho = escalas.stream().anyMatch(e -> e.getStatus() == StatusEscalaPublicacao.RASCUNHO);
        dto.setStatus(temRascunho ? StatusEscalaPublicacao.RASCUNHO.name() : StatusEscalaPublicacao.PUBLICADA.name());
        return dto;
    }

    private BadRequestAlertException naoEncontrado() {
        return new BadRequestAlertException("Registro não encontrado", ENTITY, "naoencontrado");
    }
}
