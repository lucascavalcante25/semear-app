package br.com.semear.service;

import br.com.semear.domain.*;
import br.com.semear.domain.enumeration.CodigoDepartamento;
import br.com.semear.domain.enumeration.PapelCultoResponsavel;
import br.com.semear.domain.enumeration.StatusEscalaPublicacao;
import br.com.semear.domain.enumeration.TipoCulto;
import br.com.semear.repository.*;
import br.com.semear.service.dto.CultoAgendaItemDTO;
import br.com.semear.service.dto.CultoAgendaListaDTO;
import br.com.semear.service.dto.CultoCancelarDTO;
import br.com.semear.service.dto.CultoOcorrenciaSalvarDTO;
import br.com.semear.service.dto.NotificacaoPayloadDTO;
import br.com.semear.service.util.CultoRecorrenciaUtils;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CultoAgendaService {

    private static final String ENTITY = "culto";
    private static final ZoneId ZONE = ZoneId.of("America/Fortaleza");
    /** Janela alinhada à UI (mês atual + próximo) com folga para passados. */
    private static final int DIAS_PASSADOS = 62;
    private static final int DIAS_FUTUROS = 62;
    private static final DateTimeFormatter DATA_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @PersistenceContext
    private EntityManager entityManager;

    private final CultoRegistroRepository cultoRegistroRepository;
    private final CultoOcorrenciaRepository cultoOcorrenciaRepository;
    private final CultoOcorrenciaLouvorRepository cultoOcorrenciaLouvorRepository;
    private final CultoOcorrenciaResponsavelRepository cultoOcorrenciaResponsavelRepository;
    private final EscalaRepository escalaRepository;
    private final EscalaItemRepository escalaItemRepository;
    private final GrupoLouvorRepository grupoLouvorRepository;
    private final GrupoLouvorItemRepository grupoLouvorItemRepository;
    private final LouvorRepository louvorRepository;
    private final UserRepository userRepository;
    private final TenantService tenantService;
    private final NotificacaoEnvioService notificacaoEnvioService;

    public CultoAgendaService(
        CultoRegistroRepository cultoRegistroRepository,
        CultoOcorrenciaRepository cultoOcorrenciaRepository,
        CultoOcorrenciaLouvorRepository cultoOcorrenciaLouvorRepository,
        CultoOcorrenciaResponsavelRepository cultoOcorrenciaResponsavelRepository,
        EscalaRepository escalaRepository,
        EscalaItemRepository escalaItemRepository,
        GrupoLouvorRepository grupoLouvorRepository,
        GrupoLouvorItemRepository grupoLouvorItemRepository,
        LouvorRepository louvorRepository,
        UserRepository userRepository,
        TenantService tenantService,
        NotificacaoEnvioService notificacaoEnvioService
    ) {
        this.cultoRegistroRepository = cultoRegistroRepository;
        this.cultoOcorrenciaRepository = cultoOcorrenciaRepository;
        this.cultoOcorrenciaLouvorRepository = cultoOcorrenciaLouvorRepository;
        this.cultoOcorrenciaResponsavelRepository = cultoOcorrenciaResponsavelRepository;
        this.escalaRepository = escalaRepository;
        this.escalaItemRepository = escalaItemRepository;
        this.grupoLouvorRepository = grupoLouvorRepository;
        this.grupoLouvorItemRepository = grupoLouvorItemRepository;
        this.louvorRepository = louvorRepository;
        this.userRepository = userRepository;
        this.tenantService = tenantService;
        this.notificacaoEnvioService = notificacaoEnvioService;
    }

    @Transactional(readOnly = true)
    public CultoAgendaListaDTO listarAgenda() {
        Long igrejaId = tenantService.getIgrejaIdAtual();
        LocalDate hoje = LocalDate.now(ZONE);
        LocalDate inicio = hoje.minusDays(DIAS_PASSADOS);
        LocalDate fim = hoje.plusDays(DIAS_FUTUROS);

        List<CultoRegistro> cultos = cultoRegistroRepository
            .findByIgrejaIdOrderByNomeAsc(igrejaId)
            .stream()
            .filter(c -> Boolean.TRUE.equals(c.getAtivo()))
            .toList();

        List<Slot> slots = projetarSlots(cultos, inicio, fim);
        Map<String, CultoOcorrencia> ocorrencias = cultoOcorrenciaRepository
            .findByIgrejaIdAndDataEventoBetweenOrderByDataEventoAsc(igrejaId, inicio, fim)
            .stream()
            .collect(Collectors.toMap(o -> chave(o.getCultoRegistro().getId(), o.getDataEvento()), o -> o, (a, b) -> a));

        List<Long> cultoIds = cultos.stream().map(CultoRegistro::getId).toList();
        Map<String, List<Escala>> escalasPorSlot = new HashMap<>();
        Map<Long, List<EscalaItem>> itensPorEscala = new HashMap<>();
        Instant inicioInst = inicio.atStartOfDay(ZONE).toInstant();
        Instant fimInst = fim.plusDays(1).atStartOfDay(ZONE).toInstant();
        if (!cultoIds.isEmpty()) {
            List<Escala> escalas = escalaRepository.findByIgrejaCultosAndPeriodo(
                igrejaId,
                cultoIds,
                inicioInst,
                fimInst,
                StatusEscalaPublicacao.PUBLICADA
            );
            for (Escala e : escalas) {
                if (e.getCultoRegistro() == null || e.getDataEvento() == null) continue;
                LocalDate data = e.getDataEvento().atZone(ZONE).toLocalDate();
                String k = chave(e.getCultoRegistro().getId(), data);
                escalasPorSlot.computeIfAbsent(k, x -> new ArrayList<>()).add(e);
            }
            carregarItens(escalas, itensPorEscala);
        }

        // Limpeza semanal/mensal não tem cultoRegistro — anexa pela semana do culto.
        Instant limpezaInicio = inicio.minusDays(7).atStartOfDay(ZONE).toInstant();
        Instant limpezaFim = fim.plusDays(8).atStartOfDay(ZONE).toInstant();
        List<Escala> limpezas = escalaRepository.findLimpezaNoPeriodo(
            igrejaId,
            limpezaInicio,
            limpezaFim,
            StatusEscalaPublicacao.PUBLICADA,
            CodigoDepartamento.LIMPEZA
        );
        carregarItens(limpezas, itensPorEscala);
        Map<String, List<Escala>> limpezasPorSemanaIso = indexarLimpezasPorSemana(limpezas);

        List<Long> ocorrenciaIds = ocorrencias
            .values()
            .stream()
            .map(CultoOcorrencia::getId)
            .filter(Objects::nonNull)
            .distinct()
            .toList();
        Map<Long, List<CultoAgendaItemDTO.CultoLouvorItemDTO>> louvoresPorOcorrencia = carregarLouvoresAgenda(ocorrenciaIds);
        Map<Long, List<CultoAgendaItemDTO.CultoResponsavelDTO>> responsaveisManuaisPorOcorrencia =
            carregarResponsaveisManuais(ocorrenciaIds);

        List<CultoAgendaItemDTO> todos = new ArrayList<>();
        for (Slot slot : slots) {
            String k = chave(slot.culto.getId(), slot.data);
            CultoOcorrencia oc = ocorrencias.get(k);
            List<Escala> escalasSlot = escalasPorSlot.getOrDefault(k, List.of());
            CultoAgendaItemDTO item = montarItem(
                slot,
                oc,
                escalasSlot,
                itensPorEscala,
                louvoresPorOcorrencia,
                responsaveisManuaisPorOcorrencia
            );
            anexarLimpezaDaSemana(item, slot.data, limpezasPorSemanaIso, itensPorEscala);
            todos.add(item);
        }

        CultoAgendaListaDTO lista = new CultoAgendaListaDTO();
        lista.setProximos(
            todos.stream().filter(i -> !i.getData().isBefore(hoje)).sorted(Comparator.comparing(CultoAgendaItemDTO::getData)).toList()
        );
        lista.setPassados(
            todos
                .stream()
                .filter(i -> i.getData().isBefore(hoje))
                .sorted(Comparator.comparing(CultoAgendaItemDTO::getData).reversed())
                .toList()
        );
        return lista;
    }

    @Transactional(readOnly = true)
    public CultoAgendaItemDTO obterDetalhe(Long cultoRegistroId, LocalDate data) {
        Long igrejaId = tenantService.getIgrejaIdAtual();
        CultoRegistro culto = cultoRegistroRepository
            .findByIdAndIgrejaId(cultoRegistroId, igrejaId)
            .orElseThrow(() -> new BadRequestAlertException("Culto não encontrado", ENTITY, "notfound"));
        CultoOcorrencia oc = cultoOcorrenciaRepository.findByCultoRegistroIdAndDataEvento(cultoRegistroId, data).orElse(null);
        Instant inicio = data.atStartOfDay(ZONE).toInstant();
        Instant fim = data.plusDays(1).atStartOfDay(ZONE).toInstant();
        List<Escala> escalas = escalaRepository.findByIgrejaCultosAndPeriodo(
            igrejaId,
            List.of(cultoRegistroId),
            inicio,
            fim,
            StatusEscalaPublicacao.PUBLICADA
        );
        Map<Long, List<EscalaItem>> itens = new HashMap<>();
        carregarItens(escalas, itens);

        List<Escala> limpezas = escalaRepository.findLimpezaNoPeriodo(
            igrejaId,
            data.minusDays(7).atStartOfDay(ZONE).toInstant(),
            data.plusDays(8).atStartOfDay(ZONE).toInstant(),
            StatusEscalaPublicacao.PUBLICADA,
            CodigoDepartamento.LIMPEZA
        );
        carregarItens(limpezas, itens);

        Map<Long, List<CultoAgendaItemDTO.CultoLouvorItemDTO>> louvoresPorOcorrencia = Map.of();
        Map<Long, List<CultoAgendaItemDTO.CultoResponsavelDTO>> responsaveisManuaisPorOcorrencia = Map.of();
        if (oc != null && oc.getId() != null) {
            louvoresPorOcorrencia = carregarLouvoresAgenda(List.of(oc.getId()));
            responsaveisManuaisPorOcorrencia = carregarResponsaveisManuais(List.of(oc.getId()));
        }
        CultoAgendaItemDTO item = montarItem(
            new Slot(culto, data),
            oc,
            escalas,
            itens,
            louvoresPorOcorrencia,
            responsaveisManuaisPorOcorrencia
        );
        anexarLimpezaDaSemana(item, data, indexarLimpezasPorSemana(limpezas), itens);
        return item;
    }

    public CultoAgendaItemDTO cancelarOcorrencia(CultoCancelarDTO dto) {
        if (dto.getCultoRegistroId() == null || dto.getData() == null) {
            throw new BadRequestAlertException("Culto e data são obrigatórios", ENTITY, "dadosinvalidos");
        }
        String motivo = dto.getMotivoCancelamento() != null ? dto.getMotivoCancelamento().trim() : "";
        if (motivo.isBlank()) {
            throw new BadRequestAlertException("Informe o motivo do cancelamento", ENTITY, "motivobrigatorio");
        }
        Long igrejaId = tenantService.getIgrejaIdAtual();
        Igreja igreja = tenantService.resolverIgrejaParaCriacao();
        CultoRegistro culto = cultoRegistroRepository
            .findByIdAndIgrejaId(dto.getCultoRegistroId(), igrejaId)
            .orElseThrow(() -> new BadRequestAlertException("Culto não encontrado", ENTITY, "notfound"));

        CultoOcorrencia oc = cultoOcorrenciaRepository
            .findByCultoRegistroIdAndDataEvento(dto.getCultoRegistroId(), dto.getData())
            .orElseGet(() -> {
                CultoOcorrencia nova = new CultoOcorrencia();
                nova.setIgreja(igreja);
                nova.setCultoRegistro(culto);
                nova.setDataEvento(dto.getData());
                nova.setCriadoEm(Instant.now());
                return nova;
            });

        if (Boolean.TRUE.equals(oc.getCancelado())) {
            throw new BadRequestAlertException("Este culto já está cancelado", ENTITY, "jacancelado");
        }

        User usuario = tenantService.getUsuarioAtual();
        oc.setCancelado(true);
        oc.setMotivoCancelamento(motivo);
        oc.setCanceladoEm(Instant.now());
        oc.setCanceladoPor(usuario);
        oc.setAtualizadoEm(Instant.now());
        oc = cultoOcorrenciaRepository.save(oc);

        NotificacaoPayloadDTO payload = new NotificacaoPayloadDTO();
        payload.setIgrejaId(igrejaId);
        payload.setTipo("CULTO_CANCELADO");
        payload.setEntidadeTipo("CULTO_OCORRENCIA");
        payload.setEntidadeId(oc.getId());
        payload.setTitulo("Culto cancelado");
        payload.setMensagem(
            "\"" +
            culto.getNome() +
            "\" de " +
            DATA_FMT.format(dto.getData()) +
            (culto.getHorario() != null ? " às " + culto.getHorario() : "") +
            " foi cancelado. Motivo: " +
            motivo
        );
        payload.setRotaDestino("/cultos");
        payload.setRespeitarHorarioSilencioso(false);
        payload.setRegistrarDeduplicacao(true);
        payload.setContextoDestinatarios("cancelamento de culto — toda a igreja");
        notificacaoEnvioService.enviarParaIgreja(igrejaId, payload);

        return obterDetalhe(dto.getCultoRegistroId(), dto.getData());
    }

    public CultoAgendaItemDTO reativarOcorrencia(CultoCancelarDTO dto) {
        if (dto.getCultoRegistroId() == null || dto.getData() == null) {
            throw new BadRequestAlertException("Culto e data são obrigatórios", ENTITY, "dadosinvalidos");
        }
        Long igrejaId = tenantService.getIgrejaIdAtual();
        cultoRegistroRepository
            .findByIdAndIgrejaId(dto.getCultoRegistroId(), igrejaId)
            .orElseThrow(() -> new BadRequestAlertException("Culto não encontrado", ENTITY, "notfound"));

        CultoOcorrencia oc = cultoOcorrenciaRepository
            .findByCultoRegistroIdAndDataEvento(dto.getCultoRegistroId(), dto.getData())
            .orElseThrow(() -> new BadRequestAlertException("Ocorrência não encontrada", ENTITY, "notfound"));

        if (!Boolean.TRUE.equals(oc.getCancelado())) {
            throw new BadRequestAlertException("Este culto não está cancelado", ENTITY, "naocancelado");
        }

        oc.setCancelado(false);
        oc.setMotivoCancelamento(null);
        oc.setCanceladoEm(null);
        oc.setCanceladoPor(null);
        oc.setAtualizadoEm(Instant.now());
        cultoOcorrenciaRepository.save(oc);

        return obterDetalhe(dto.getCultoRegistroId(), dto.getData());
    }

    public CultoAgendaItemDTO salvarOcorrencia(CultoOcorrenciaSalvarDTO dto) {
        if (dto.getCultoRegistroId() == null || dto.getData() == null) {
            throw new BadRequestAlertException("Culto e data são obrigatórios", ENTITY, "dadosinvalidos");
        }
        Long igrejaId = tenantService.getIgrejaIdAtual();
        Igreja igreja = tenantService.resolverIgrejaParaCriacao();
        CultoRegistro culto = cultoRegistroRepository
            .findByIdAndIgrejaId(dto.getCultoRegistroId(), igrejaId)
            .orElseThrow(() -> new BadRequestAlertException("Culto não encontrado", ENTITY, "notfound"));

        CultoOcorrencia oc = cultoOcorrenciaRepository
            .findByCultoRegistroIdAndDataEvento(dto.getCultoRegistroId(), dto.getData())
            .orElseGet(() -> {
                CultoOcorrencia nova = new CultoOcorrencia();
                nova.setIgreja(igreja);
                nova.setCultoRegistro(culto);
                nova.setDataEvento(dto.getData());
                nova.setCriadoEm(Instant.now());
                return nova;
            });

        oc.setPregador(trimOrNull(dto.getPregador()));
        oc.setTituloMensagem(trimOrNull(dto.getTituloMensagem()));
        oc.setVersiculoCentral(trimOrNull(dto.getVersiculoCentral()));
        oc.setObservacoes(trimOrNull(dto.getObservacoes()));
        oc.setAtualizadoEm(Instant.now());

        if (dto.getGrupoLouvorOrigemId() != null) {
            GrupoLouvor grupo = grupoLouvorRepository
                .findByIdAndIgrejaId(dto.getGrupoLouvorOrigemId(), igrejaId)
                .orElseThrow(() -> new BadRequestAlertException("Grupo de louvor não encontrado", ENTITY, "gruponotfound"));
            oc.setGrupoLouvorOrigem(grupo);
        } else {
            oc.setGrupoLouvorOrigem(null);
        }

        oc = cultoOcorrenciaRepository.save(oc);

        cultoOcorrenciaLouvorRepository.deleteByCultoOcorrenciaId(oc.getId());
        entityManager.flush();

        List<Long> louvorIds = dto.getLouvorIds() == null
            ? List.of()
            : dto.getLouvorIds().stream().filter(Objects::nonNull).distinct().toList();
        int ordem = 0;
        for (Long louvorId : louvorIds) {
            Louvor louvor = louvorRepository
                .findById(louvorId)
                .filter(l -> l.getIgreja() != null && Objects.equals(l.getIgreja().getId(), igrejaId))
                .orElseThrow(() -> new BadRequestAlertException("Louvor não encontrado", ENTITY, "louvornotfound"));
            CultoOcorrenciaLouvor item = new CultoOcorrenciaLouvor();
            item.setCultoOcorrencia(oc);
            item.setLouvor(louvor);
            item.setOrdem(ordem++);
            cultoOcorrenciaLouvorRepository.save(item);
        }

        if (dto.getResponsaveisManuais() != null) {
            cultoOcorrenciaResponsavelRepository.deleteByCultoOcorrenciaId(oc.getId());
            entityManager.flush();
            for (CultoOcorrenciaSalvarDTO.ResponsavelDTO r : dto.getResponsaveisManuais()) {
                if (r.getPapel() == null || r.getUserId() == null) continue;
                User user = userRepository
                    .findById(r.getUserId())
                    .filter(u -> u.getIgreja() != null && Objects.equals(u.getIgreja().getId(), igrejaId))
                    .orElseThrow(() -> new BadRequestAlertException("Membro não encontrado", ENTITY, "usernotfound"));
                CultoOcorrenciaResponsavel resp = new CultoOcorrenciaResponsavel();
                resp.setCultoOcorrencia(oc);
                resp.setPapel(r.getPapel());
                resp.setUser(user);
                resp.setOrigemManual(true);
                cultoOcorrenciaResponsavelRepository.save(resp);
            }
        }

        return obterDetalhe(dto.getCultoRegistroId(), dto.getData());
    }

    /** Copia louvores do grupo para o payload (sem mutar o grupo). */
    @Transactional(readOnly = true)
    public List<CultoAgendaItemDTO.CultoLouvorItemDTO> previewGrupoLouvor(Long grupoId) {
        Long igrejaId = tenantService.getIgrejaIdAtual();
        grupoLouvorRepository
            .findByIdAndIgrejaId(grupoId, igrejaId)
            .orElseThrow(() -> new BadRequestAlertException("Grupo não encontrado", ENTITY, "gruponotfound"));
        List<Long> ids = grupoLouvorItemRepository.findLouvorIdsByGrupoIdOrderByOrdem(grupoId);
        return montarPreviewLouvores(ids);
    }

    private List<CultoAgendaItemDTO.CultoLouvorItemDTO> montarPreviewLouvores(List<Long> ids) {
        List<CultoAgendaItemDTO.CultoLouvorItemDTO> out = new ArrayList<>();
        int ordem = 0;
        for (Long louvorId : ids) {
            Optional<Louvor> opt = louvorRepository.findById(louvorId);
            if (opt.isEmpty()) continue;
            out.add(mapearLouvorItem(opt.get(), ordem++));
        }
        return out;
    }

    private CultoAgendaItemDTO.CultoLouvorItemDTO mapearLouvorItem(Louvor l, int ordem) {
        CultoAgendaItemDTO.CultoLouvorItemDTO item = new CultoAgendaItemDTO.CultoLouvorItemDTO();
        item.setLouvorId(l.getId());
        item.setTitulo(l.getTitulo());
        item.setArtista(l.getArtista());
        item.setOrdem(ordem);
        item.setYoutubeUrl(l.getYoutubeUrl());
        item.setTonalidade(l.getTonalidade());
        item.setTemLetraSalva(l.getLetraConteudo() != null && !l.getLetraConteudo().isBlank());
        item.setTemCifraApiSalva(l.getCifraConteudo() != null && !l.getCifraConteudo().isBlank());
        return item;
    }

    private CultoAgendaItemDTO montarItem(
        Slot slot,
        CultoOcorrencia oc,
        List<Escala> escalas,
        Map<Long, List<EscalaItem>> itensPorEscala,
        Map<Long, List<CultoAgendaItemDTO.CultoLouvorItemDTO>> louvoresPorOcorrencia,
        Map<Long, List<CultoAgendaItemDTO.CultoResponsavelDTO>> responsaveisManuaisPorOcorrencia
    ) {
        CultoAgendaItemDTO dto = new CultoAgendaItemDTO();
        dto.setCultoRegistroId(slot.culto.getId());
        dto.setNome(slot.culto.getNome());
        dto.setTipo(slot.culto.getTipo() != null ? slot.culto.getTipo() : TipoCulto.RECORRENTE);
        dto.setData(slot.data);
        dto.setHorario(slot.culto.getHorario());
        dto.setTemEscalaGerada(!escalas.isEmpty());

        if (oc != null) {
            dto.setOcorrenciaId(oc.getId());
            dto.setPregador(oc.getPregador());
            dto.setTituloMensagem(oc.getTituloMensagem());
            dto.setVersiculoCentral(oc.getVersiculoCentral());
            dto.setObservacoes(oc.getObservacoes());
            dto.setCancelado(Boolean.TRUE.equals(oc.getCancelado()));
            dto.setMotivoCancelamento(oc.getMotivoCancelamento());
            dto.setCanceladoEm(oc.getCanceladoEm());
            if (oc.getGrupoLouvorOrigem() != null) {
                dto.setGrupoLouvorOrigemId(oc.getGrupoLouvorOrigem().getId());
                dto.setGrupoLouvorOrigemNome(oc.getGrupoLouvorOrigem().getNome());
            }
            dto.setLouvores(louvoresPorOcorrencia.getOrDefault(oc.getId(), List.of()));

            List<CultoAgendaItemDTO.CultoResponsavelDTO> manuais =
                responsaveisManuaisPorOcorrencia.getOrDefault(oc.getId(), List.of());
            if (!manuais.isEmpty()) {
                dto.setTemOverrideResponsaveis(true);
                dto.setResponsaveis(manuais);
            }
        }

        if (!dto.isTemOverrideResponsaveis()) {
            dto.setResponsaveis(responsaveisDaEscala(escalas, itensPorEscala));
        }
        return dto;
    }

    private Map<Long, List<CultoAgendaItemDTO.CultoLouvorItemDTO>> carregarLouvoresAgenda(Collection<Long> ocorrenciaIds) {
        if (ocorrenciaIds == null || ocorrenciaIds.isEmpty()) return Map.of();
        Map<Long, List<CultoAgendaItemDTO.CultoLouvorItemDTO>> porOc = new HashMap<>();
        for (CultoOcorrenciaLouvorRepository.CultoLouvorAgendaProjection row : cultoOcorrenciaLouvorRepository.findAgendaByOcorrenciaIdIn(
            ocorrenciaIds
        )) {
            CultoAgendaItemDTO.CultoLouvorItemDTO item = new CultoAgendaItemDTO.CultoLouvorItemDTO();
            item.setLouvorId(row.getLouvorId());
            item.setTitulo(row.getTitulo());
            item.setArtista(row.getArtista());
            item.setOrdem(row.getOrdem());
            item.setYoutubeUrl(row.getYoutubeUrl());
            item.setTonalidade(row.getTonalidade());
            item.setTemLetraSalva(Boolean.TRUE.equals(row.getTemLetra()));
            item.setTemCifraApiSalva(Boolean.TRUE.equals(row.getTemCifra()));
            porOc.computeIfAbsent(row.getOcorrenciaId(), x -> new ArrayList<>()).add(item);
        }
        return porOc;
    }

    private Map<Long, List<CultoAgendaItemDTO.CultoResponsavelDTO>> carregarResponsaveisManuais(Collection<Long> ocorrenciaIds) {
        if (ocorrenciaIds == null || ocorrenciaIds.isEmpty()) return Map.of();
        Map<Long, List<CultoAgendaItemDTO.CultoResponsavelDTO>> porOc = new HashMap<>();
        for (CultoOcorrenciaResponsavel r : cultoOcorrenciaResponsavelRepository.findByCultoOcorrenciaIdInWithUser(ocorrenciaIds)) {
            if (r.getCultoOcorrencia() == null || r.getUser() == null) continue;
            CultoAgendaItemDTO.CultoResponsavelDTO rd = new CultoAgendaItemDTO.CultoResponsavelDTO();
            rd.setPapel(r.getPapel());
            rd.setUserId(r.getUser().getId());
            rd.setNome(nomeUser(r.getUser()));
            rd.setOrigemManual(true);
            porOc.computeIfAbsent(r.getCultoOcorrencia().getId(), x -> new ArrayList<>()).add(rd);
        }
        return porOc;
    }

    private void carregarItens(List<Escala> escalas, Map<Long, List<EscalaItem>> itensPorEscala) {
        List<Long> ids = escalas.stream().map(Escala::getId).filter(Objects::nonNull).toList();
        if (ids.isEmpty()) return;
        for (EscalaItem item : escalaItemRepository.findByEscalaIdInWithUser(ids)) {
            itensPorEscala.computeIfAbsent(item.getEscala().getId(), x -> new ArrayList<>()).add(item);
        }
    }

    private Map<String, List<Escala>> indexarLimpezasPorSemana(List<Escala> limpezas) {
        Map<String, List<Escala>> porSemana = new HashMap<>();
        for (Escala e : limpezas) {
            if (e.getDataEvento() == null) continue;
            LocalDate d = e.getDataEvento().atZone(ZONE).toLocalDate();
            porSemana.computeIfAbsent(chaveSemanaIso(d), x -> new ArrayList<>()).add(e);
        }
        return porSemana;
    }

    private String chaveSemanaIso(LocalDate data) {
        WeekFields semana = WeekFields.ISO;
        return data.get(semana.weekBasedYear()) + "-W" + data.get(semana.weekOfWeekBasedYear());
    }

    /**
     * Limpeza semanal/mensal não vincula ao culto: associa a da mesma semana ISO (seg–dom).
     */
    private void anexarLimpezaDaSemana(
        CultoAgendaItemDTO dto,
        LocalDate dataCulto,
        Map<String, List<Escala>> limpezasPorSemanaIso,
        Map<Long, List<EscalaItem>> itensPorEscala
    ) {
        if (dto.isTemOverrideResponsaveis()) return;
        boolean jaTemLimpeza = dto
            .getResponsaveis()
            .stream()
            .anyMatch(r -> r.getPapel() == PapelCultoResponsavel.LIMPEZA);
        if (jaTemLimpeza) return;

        List<Escala> candidatas = limpezasPorSemanaIso.getOrDefault(chaveSemanaIso(dataCulto), List.of());
        Escala limpeza = candidatas
            .stream()
            .filter(e -> e.getDataEvento() != null)
            .min(
                Comparator.comparingLong((Escala e) ->
                    Math.abs(ChronoUnit.DAYS.between(dataCulto, e.getDataEvento().atZone(ZONE).toLocalDate()))
                )
            )
            .orElse(null);
        if (limpeza == null) return;

        List<CultoAgendaItemDTO.CultoResponsavelDTO> responsaveis = new ArrayList<>(dto.getResponsaveis());
        for (EscalaItem item : itensPorEscala.getOrDefault(limpeza.getId(), List.of())) {
            if (item.getUser() == null) continue;
            CultoAgendaItemDTO.CultoResponsavelDTO rd = new CultoAgendaItemDTO.CultoResponsavelDTO();
            rd.setPapel(PapelCultoResponsavel.LIMPEZA);
            rd.setUserId(item.getUser().getId());
            rd.setNome(nomeUser(item.getUser()));
            rd.setOrigemManual(false);
            responsaveis.add(rd);
            break;
        }
        dto.setResponsaveis(responsaveis);
        if (!responsaveis.isEmpty()) {
            dto.setTemEscalaGerada(true);
        }
    }

    private List<CultoAgendaItemDTO.CultoResponsavelDTO> responsaveisDaEscala(
        List<Escala> escalas,
        Map<Long, List<EscalaItem>> itensPorEscala
    ) {
        List<CultoAgendaItemDTO.CultoResponsavelDTO> out = new ArrayList<>();
        Set<PapelCultoResponsavel> papeisJaIncluidos = EnumSet.noneOf(PapelCultoResponsavel.class);
        for (Escala e : escalas) {
            for (EscalaItem item : itensPorEscala.getOrDefault(e.getId(), List.of())) {
                if (item.getUser() == null) continue;
                // Em escala agrupada (portaria+recepção), o departamento da escala é Portaria;
                // o papel correto vem da função do item.
                PapelCultoResponsavel papel = papelPorNome(item.getFuncao());
                if (papel == null) {
                    papel = papelDoDepartamento(e.getDepartamento());
                }
                if (papel == null || !papeisJaIncluidos.add(papel)) continue;
                CultoAgendaItemDTO.CultoResponsavelDTO rd = new CultoAgendaItemDTO.CultoResponsavelDTO();
                rd.setPapel(papel);
                rd.setUserId(item.getUser().getId());
                rd.setNome(nomeUser(item.getUser()));
                rd.setOrigemManual(false);
                out.add(rd);
            }
        }
        return out;
    }

    private PapelCultoResponsavel papelDoDepartamento(Departamento d) {
        if (d == null) return null;
        if (d.getCodigo() != null) {
            return switch (d.getCodigo()) {
                case PORTARIA -> PapelCultoResponsavel.PORTARIA;
                case RECEPCAO -> PapelCultoResponsavel.RECEPCAO;
                case LIMPEZA -> PapelCultoResponsavel.LIMPEZA;
                default -> null;
            };
        }
        return papelPorNome(d.getNome());
    }

    private PapelCultoResponsavel papelPorNome(String nome) {
        if (nome == null || nome.isBlank()) return null;
        String n = nome.toLowerCase(Locale.ROOT);
        if (n.contains("portaria")) return PapelCultoResponsavel.PORTARIA;
        if (n.contains("recep")) return PapelCultoResponsavel.RECEPCAO;
        if (n.contains("limpeza")) return PapelCultoResponsavel.LIMPEZA;
        return null;
    }

    private List<Slot> projetarSlots(List<CultoRegistro> cultos, LocalDate inicio, LocalDate fim) {
        List<Slot> slots = new ArrayList<>();
        for (CultoRegistro culto : cultos) {
            TipoCulto tipo = culto.getTipo() != null ? culto.getTipo() : TipoCulto.RECORRENTE;
            if (tipo == TipoCulto.EXTRAORDINARIO) {
                if (culto.getDataEspecifica() != null && !culto.getDataEspecifica().isBefore(inicio) && !culto.getDataEspecifica().isAfter(fim)) {
                    slots.add(new Slot(culto, culto.getDataEspecifica()));
                }
                continue;
            }
            for (LocalDate d = inicio; !d.isAfter(fim); d = d.plusDays(1)) {
                if (CultoRecorrenciaUtils.cultoOcorreNaData(culto, d)) {
                    slots.add(new Slot(culto, d));
                }
            }
        }
        return slots;
    }

    private String chave(Long cultoId, LocalDate data) {
        return cultoId + "|" + data;
    }

    private String nomeUser(User u) {
        String fn = u.getFirstName() != null ? u.getFirstName() : "";
        String ln = u.getLastName() != null ? u.getLastName() : "";
        String nome = (fn + " " + ln).trim();
        return nome.isEmpty() ? u.getLogin() : nome;
    }

    private String trimOrNull(String v) {
        if (v == null) return null;
        String t = v.trim();
        return t.isEmpty() ? null : t;
    }

    private record Slot(CultoRegistro culto, LocalDate data) {}
}
