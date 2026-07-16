package br.com.semear.service;

import br.com.semear.domain.Evento;
import br.com.semear.domain.EventoBanner;
import br.com.semear.domain.EventoInscricao;
import br.com.semear.domain.User;
import br.com.semear.domain.enumeration.CategoriaEvento;
import br.com.semear.domain.enumeration.PublicoEvento;
import br.com.semear.domain.enumeration.StatusEvento;
import br.com.semear.domain.enumeration.StatusInscricaoEvento;
import br.com.semear.repository.EventoBannerRepository;
import br.com.semear.repository.EventoInscricaoRepository;
import br.com.semear.repository.EventoRepository;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.service.dto.ConfigNotificacaoDTO;
import br.com.semear.service.dto.EventoDTO;
import br.com.semear.service.dto.EventoFiltroDTO;
import br.com.semear.service.dto.EventoInscricaoDTO;
import br.com.semear.service.util.ConfigNotificacaoJsonUtil;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class EventoService {

    private static final Logger LOG = LoggerFactory.getLogger(EventoService.class);
    private static final String ENTITY = "evento";
    private static final Instant LIMITE_DATA_FUTURA = Instant.parse("9999-12-31T23:59:59Z");
    private static final long TAMANHO_MAX_BANNER_BYTES = 3L * 1024 * 1024;

    @Value("${semear.upload-dir:${user.home}/semear-app/uploads}")
    private String uploadDir;

    private final EventoRepository eventoRepository;
    private final EventoBannerRepository eventoBannerRepository;
    private final EventoInscricaoRepository eventoInscricaoRepository;
    private final TenantService tenantService;
    private final EventoNotificacaoService eventoNotificacaoService;
    private final NotificacaoProgramadaService notificacaoProgramadaService;

    public EventoService(
        EventoRepository eventoRepository,
        EventoBannerRepository eventoBannerRepository,
        EventoInscricaoRepository eventoInscricaoRepository,
        TenantService tenantService,
        EventoNotificacaoService eventoNotificacaoService,
        NotificacaoProgramadaService notificacaoProgramadaService
    ) {
        this.eventoRepository = eventoRepository;
        this.eventoBannerRepository = eventoBannerRepository;
        this.eventoInscricaoRepository = eventoInscricaoRepository;
        this.tenantService = tenantService;
        this.eventoNotificacaoService = eventoNotificacaoService;
        this.notificacaoProgramadaService = notificacaoProgramadaService;
    }

    @Transactional(readOnly = true)
    public List<EventoDTO> listar(EventoFiltroDTO filtro) {
        User usuario = tenantService.getUsuarioAtual();
        return aplicarBuscaTexto(buscarComFiltros(filtro), filtro != null ? filtro.getBusca() : null)
            .stream()
            .map(e -> toDtoResumo(e, usuario))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<EventoDTO> listarProximos() {
        EventoFiltroDTO filtro = new EventoFiltroDTO();
        filtro.setPeriodo("PROXIMOS");
        return listar(filtro);
    }

    @Transactional(readOnly = true)
    public List<EventoDTO> listarPassados() {
        EventoFiltroDTO filtro = new EventoFiltroDTO();
        filtro.setPeriodo("PASSADOS");
        return listar(filtro);
    }

    @Transactional(readOnly = true)
    public List<EventoDTO> listarMinhasInscricoes() {
        User usuario = tenantService.getUsuarioAtual();
        Long igrejaId = tenantService.getIgrejaIdAtual();
        return eventoInscricaoRepository
            .findByUserIdAndStatusAndEventoIgrejaIdOrderByCriadoEmDesc(usuario.getId(), StatusInscricaoEvento.ATIVA, igrejaId)
            .stream()
            .map(EventoInscricao::getEvento)
            .filter(Objects::nonNull)
            .map(e -> toDtoResumo(e, usuario))
            .toList();
    }

    @Transactional(readOnly = true)
    public Optional<EventoDTO> obter(Long id) {
        User usuario = tenantService.getUsuarioAtual();
        return obterEntidade(id).map(e -> toDtoComInscricoes(e, usuario, null, null));
    }

    @Transactional(readOnly = true)
    public List<EventoInscricaoDTO> listarInscritos(Long eventoId, String filtroStatus, String busca) {
        validarLideranca();
        Evento evento = obterEntidade(eventoId).orElseThrow(this::naoEncontrado);
        List<EventoInscricao> inscricoes = eventoInscricaoRepository.findByEventoId(evento.getId());
        return inscricoes
            .stream()
            .map(this::toInscricaoDto)
            .filter(i -> filtrarInscricaoPorStatus(i, filtroStatus))
            .filter(i -> filtrarInscricaoPorBusca(i, busca))
            .toList();
    }

    public EventoDTO criar(EventoDTO dto) {
        validarDados(dto);
        Evento entity = new Evento();
        entity.setIgreja(tenantService.resolverIgrejaParaCriacao());
        aplicarDados(entity, dto);
        entity.setCriadoEm(Instant.now());
        if (entity.getStatus() == null) {
            entity.setStatus(StatusEvento.PUBLICADO);
        }
        if (entity.getCategoria() == null) {
            entity.setCategoria(CategoriaEvento.OUTRO);
        }
        Evento salvo = eventoRepository.save(entity);
        try {
            ConfigNotificacaoDTO config = dto.getConfigNotificacao();
            notificacaoProgramadaService.sincronizarEvento(salvo, config, true);
        } catch (BadRequestAlertException e) {
            throw e;
        } catch (RuntimeException e) {
            LOG.warn("Evento {} criado, mas falhou sincronizar notificações: {}", salvo.getId(), e.getMessage());
        }
        return toDtoComInscricoes(salvo, tenantService.getUsuarioAtual(), null, null);
    }

    public EventoDTO atualizar(Long id, EventoDTO dto) {
        validarDados(dto);
        Evento entity = obterEntidade(id).orElseThrow(this::naoEncontrado);
        EventoSnapshot antes = EventoSnapshot.from(entity);
        String imagemAnterior = entity.getImagemUrl();
        aplicarDados(entity, dto);
        if (dto.getImagemUrl() == null && ehBannerInterno(imagemAnterior)) {
            eventoBannerRepository.deleteById(entity.getId());
            removerArquivoBanner(entity.getId());
            entity.setImagemUrl(null);
        } else if (dto.getImagemUrl() != null) {
            // Remove querystring de cache-bust acidental (?v=...) antes de persistir.
            String limpa = dto.getImagemUrl().split("\\?")[0];
            entity.setImagemUrl(limpa);
        }
        Evento salvo = eventoRepository.saveAndFlush(entity);
        try {
            notificarAlteracoesImportantes(antes, salvo);
        } catch (BadRequestAlertException e) {
            throw e;
        } catch (RuntimeException e) {
            LOG.warn("Evento {} atualizado, mas falhou notificar alterações: {}", salvo.getId(), e.getMessage());
        }
        try {
            notificacaoProgramadaService.sincronizarEvento(salvo, dto.getConfigNotificacao(), false);
        } catch (BadRequestAlertException e) {
            throw e;
        } catch (RuntimeException e) {
            LOG.warn("Evento {} atualizado, mas falhou sincronizar notificações: {}", salvo.getId(), e.getMessage());
        }
        return toDtoComInscricoes(salvo, tenantService.getUsuarioAtual(), null, null);
    }

    public void excluir(Long id) {
        Evento entity = obterEntidade(id).orElseThrow(this::naoEncontrado);
        notificarExclusaoEvento(entity);
        notificacaoProgramadaService.cancelarEntidade("EVENTO", entity.getId());
        eventoInscricaoRepository.findByEventoId(entity.getId()).forEach(eventoInscricaoRepository::delete);
        removerArquivoBanner(entity.getId());
        eventoRepository.delete(entity);
    }

    private void notificarExclusaoEvento(Evento evento) {
        ConfigNotificacaoDTO config = notificacaoProgramadaService.lerConfig(evento.getConfigNotificacao());
        if (config.isEfetivamenteAtivo()) {
            notificacaoProgramadaService.notificarExclusaoEvento(evento, config);
            return;
        }
        List<EventoInscricao> inscritos = eventoInscricaoRepository.findByEventoIdAndStatus(
            evento.getId(),
            StatusInscricaoEvento.ATIVA
        );
        for (EventoInscricao inscricao : inscritos) {
            if (inscricao.getUser() != null) {
                eventoNotificacaoService.notificarExclusaoEvento(evento, inscricao.getUser());
            }
        }
    }

    public EventoDTO uploadBanner(Long id, MultipartFile file) {
        validarLideranca();
        if (file == null || file.isEmpty()) {
            throw new BadRequestAlertException("Arquivo vazio", ENTITY, "arquivovazio");
        }
        if (file.getSize() > TAMANHO_MAX_BANNER_BYTES) {
            throw new BadRequestAlertException("Banner deve ter no máximo 3 MB", ENTITY, "arquivoGrande");
        }
        String contentType = file.getContentType();
        if (contentType == null || !isTipoImagemPermitido(contentType)) {
            throw new BadRequestAlertException("Use JPEG, PNG, GIF ou WebP", ENTITY, "tipoinvalido");
        }
        Evento entity = obterEntidade(id).orElseThrow(this::naoEncontrado);
        final byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            LOG.error("Erro ao ler bytes do banner do evento {}", entity.getId(), e);
            throw new BadRequestAlertException("Erro ao ler o arquivo do banner", ENTITY, "errosalvar");
        }

        try {
            EventoBanner banner = eventoBannerRepository.findById(entity.getId()).orElseGet(EventoBanner::new);
            banner.setEventoId(entity.getId());
            banner.setContentType(contentType);
            banner.setDados(bytes);
            banner.setAtualizadoEm(Instant.now());
            eventoBannerRepository.saveAndFlush(banner);
        } catch (RuntimeException e) {
            LOG.error("Falha ao persistir banner do evento {}", id, e);
            throw new BadRequestAlertException(
                "Não foi possível gravar o banner. Tente outra imagem (JPEG/PNG, até 3 MB).",
                ENTITY,
                "errosalvar"
            );
        }

        // Mantém cópia em disco quando possível (dev/local); o banco é a fonte da verdade.
        try {
            removerArquivoBanner(entity.getId());
            String ext = extensaoPorContentType(contentType);
            Path dir = diretorioBanner(entity.getId());
            Files.createDirectories(dir);
            Files.write(dir.resolve("banner." + ext), bytes);
        } catch (IOException e) {
            LOG.warn("Banner salvo no banco, mas falhou cópia em disco do evento {}: {}", entity.getId(), e.getMessage());
        }

        entity.setImagemUrl("/api/eventos/" + entity.getId() + "/banner");
        Evento salvo = eventoRepository.saveAndFlush(entity);
        LOG.info("Banner do evento {} persistido ({} bytes, {})", entity.getId(), bytes.length, contentType);
        return toDtoComInscricoes(salvo, tenantService.getUsuarioAtual(), null, null);
    }

    @Transactional(readOnly = true)
    public Optional<BannerArquivo> obterBanner(Long id) {
        Optional<EventoBanner> noBanco = eventoBannerRepository.findById(id);
        if (noBanco.isPresent() && noBanco.get().getDados() != null && noBanco.get().getDados().length > 0) {
            EventoBanner b = noBanco.get();
            return Optional.of(new BannerArquivo(b.getDados(), b.getContentType()));
        }

        Path dir = diretorioBanner(id);
        if (!Files.isDirectory(dir)) {
            return Optional.empty();
        }
        try {
            Optional<Path> arquivo = Files.list(dir)
                .filter(p -> p.getFileName().toString().startsWith("banner."))
                .findFirst();
            if (arquivo.isEmpty()) {
                return Optional.empty();
            }
            Path path = arquivo.get();
            String nome = path.getFileName().toString();
            String ext = nome.substring(nome.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
            return Optional.of(new BannerArquivo(Files.readAllBytes(path), contentTypePorExtensao(ext)));
        } catch (IOException e) {
            LOG.warn("Erro ao ler banner do evento {}", id, e);
            return Optional.empty();
        }
    }

    public EventoDTO removerBanner(Long id) {
        validarLideranca();
        Evento entity = obterEntidade(id).orElseThrow(this::naoEncontrado);
        eventoBannerRepository.deleteById(id);
        removerArquivoBanner(entity.getId());
        entity.setImagemUrl(null);
        Evento salvo = eventoRepository.save(entity);
        return toDtoComInscricoes(salvo, tenantService.getUsuarioAtual(), null, null);
    }

    public EventoInscricaoDTO inscrever(Long id) {
        Evento evento = obterEntidade(id).orElseThrow(this::naoEncontrado);
        validarInscricaoPermitida(evento);
        User user = tenantService.getUsuarioAtual();
        Optional<EventoInscricao> existente = eventoInscricaoRepository.findByEventoIdAndUserId(evento.getId(), user.getId());
        if (existente.isPresent()) {
            EventoInscricao inscricao = existente.get();
            if (inscricao.getStatus() == StatusInscricaoEvento.ATIVA) {
                return toInscricaoDto(inscricao);
            }
            inscricao.setStatus(StatusInscricaoEvento.ATIVA);
            inscricao.setCanceladoEm(null);
            inscricao.setConfirmado(false);
            inscricao.setCriadoEm(Instant.now());
            EventoInscricao salva = eventoInscricaoRepository.save(inscricao);
            eventoNotificacaoService.notificarConfirmacaoInscricao(evento, user);
            return toInscricaoDto(salva);
        }
        validarCapacidade(evento);
        EventoInscricao inscricao = new EventoInscricao();
        inscricao.setEvento(evento);
        inscricao.setUser(user);
        inscricao.setConfirmado(false);
        inscricao.setStatus(StatusInscricaoEvento.ATIVA);
        inscricao.setCriadoEm(Instant.now());
        EventoInscricao salva = eventoInscricaoRepository.save(inscricao);
        eventoNotificacaoService.notificarConfirmacaoInscricao(evento, user);
        return toInscricaoDto(salva);
    }

    public void desinscrever(Long id) {
        Evento evento = obterEntidade(id).orElseThrow(this::naoEncontrado);
        User user = tenantService.getUsuarioAtual();
        EventoInscricao inscricao = eventoInscricaoRepository
            .findByEventoIdAndUserId(evento.getId(), user.getId())
            .orElseThrow(() -> new BadRequestAlertException("Inscrição não encontrada", ENTITY, "inscricaonaoencontrada"));
        if (inscricao.getStatus() == StatusInscricaoEvento.CANCELADA) {
            return;
        }
        validarPrazoCancelamento(evento);
        inscricao.setStatus(StatusInscricaoEvento.CANCELADA);
        inscricao.setCanceladoEm(Instant.now());
        eventoInscricaoRepository.save(inscricao);
    }

    public EventoInscricaoDTO checkIn(Long eventoId, Long inscricaoId) {
        validarLideranca();
        Evento evento = obterEntidade(eventoId).orElseThrow(this::naoEncontrado);
        EventoInscricao inscricao = eventoInscricaoRepository
            .findByIdAndEventoId(inscricaoId, evento.getId())
            .orElseThrow(() -> new BadRequestAlertException("Inscrição não encontrada", ENTITY, "inscricaonaoencontrada"));
        if (inscricao.getStatus() != StatusInscricaoEvento.ATIVA) {
            throw new BadRequestAlertException("Inscrição não está ativa", ENTITY, "inscricaoinativa");
        }
        inscricao.setConfirmado(true);
        return toInscricaoDto(eventoInscricaoRepository.save(inscricao));
    }

    public List<EventoInscricaoDTO> checkInLote(Long eventoId, List<Long> inscricaoIds) {
        validarLideranca();
        if (inscricaoIds == null || inscricaoIds.isEmpty()) {
            return List.of();
        }
        List<EventoInscricaoDTO> resultados = new ArrayList<>();
        for (Long inscricaoId : inscricaoIds) {
            try {
                resultados.add(checkIn(eventoId, inscricaoId));
            } catch (BadRequestAlertException ignored) {
                // ignora inscrições inválidas no lote
            }
        }
        return resultados;
    }

    @Transactional(readOnly = true)
    public String exportarInscritosCsv(Long eventoId) {
        validarLideranca();
        Evento evento = obterEntidade(eventoId).orElseThrow(this::naoEncontrado);
        List<EventoInscricaoDTO> inscritos = eventoInscricaoRepository
            .findByEventoId(evento.getId())
            .stream()
            .map(this::toInscricaoDto)
            .toList();
        StringBuilder csv = new StringBuilder();
        csv.append("Nome,E-mail,Telefone,Data inscrição,Status,Check-in\n");
        for (EventoInscricaoDTO i : inscritos) {
            csv
                .append(csvValor(i.getUserNome()))
                .append(',')
                .append(csvValor(i.getUserEmail()))
                .append(',')
                .append(csvValor(i.getUserTelefone()))
                .append(',')
                .append(csvValor(i.getCriadoEm() != null ? i.getCriadoEm().toString() : ""))
                .append(',')
                .append(csvValor(i.getStatus() != null ? i.getStatus().name() : ""))
                .append(',')
                .append(csvValor(Boolean.TRUE.equals(i.getConfirmado()) ? "Confirmado" : "Pendente"))
                .append('\n');
        }
        return csv.toString();
    }

    private List<Evento> buscarComFiltros(EventoFiltroDTO filtro) {
        Long igrejaId = tenantService.getIgrejaIdAtual();
        Instant agora = Instant.now();
        Instant apos = Instant.EPOCH;
        Instant antes = LIMITE_DATA_FUTURA;
        if (filtro != null && filtro.getPeriodo() != null) {
            switch (filtro.getPeriodo().toUpperCase(Locale.ROOT)) {
                case "PROXIMOS" -> apos = agora;
                case "PASSADOS" -> {
                    apos = Instant.EPOCH;
                    antes = agora;
                }
                default -> {
                    // TODOS
                }
            }
        }
        List<Evento> eventos = eventoRepository.buscarComFiltros(
            igrejaId,
            filtro != null ? filtro.getCategoria() : null,
            filtro != null ? filtro.getPublico() : null,
            filtro != null ? filtro.getStatus() : null,
            filtro != null ? filtro.getInscricoesAbertas() : null,
            apos,
            antes
        );
        if (filtro != null && "PASSADOS".equalsIgnoreCase(filtro.getPeriodo())) {
            return eventos.stream()
                .sorted((a, b) -> b.getDataInicio().compareTo(a.getDataInicio()))
                .toList();
        }
        return eventos;
    }

    private List<Evento> aplicarBuscaTexto(List<Evento> eventos, String busca) {
        if (busca == null || busca.isBlank()) {
            return eventos;
        }
        String termo = busca.trim().toLowerCase(Locale.ROOT);
        return eventos
            .stream()
            .filter(e ->
                contem(e.getTitulo(), termo) || contem(e.getLocal(), termo) || contem(e.getDescricao(), termo)
            )
            .toList();
    }

    private boolean contem(String valor, String termo) {
        return valor != null && valor.toLowerCase(Locale.ROOT).contains(termo);
    }

    private void validarInscricaoPermitida(Evento evento) {
        if (evento.getStatus() != StatusEvento.PUBLICADO) {
            throw new BadRequestAlertException("Evento não está publicado", ENTITY, "eventonaopublicado");
        }
        if (!Boolean.TRUE.equals(evento.getInscricoesAbertas())) {
            throw new BadRequestAlertException("Inscrições estão fechadas para este evento", ENTITY, "inscricoesfechadas");
        }
        if (evento.getDataInicio() != null && evento.getDataInicio().isBefore(Instant.now())) {
            throw new BadRequestAlertException("Evento já ocorreu", ENTITY, "eventopassado");
        }
        validarCapacidade(evento);
    }

    private void validarPrazoCancelamento(Evento evento) {
        if (evento.getPrazoCancelamentoInscricao() != null && Instant.now().isAfter(evento.getPrazoCancelamentoInscricao())) {
            throw new BadRequestAlertException("Prazo para cancelar inscrição encerrado", ENTITY, "prazocancelamento");
        }
    }

    private void validarCapacidade(Evento evento) {
        if (evento.getCapacidade() == null) {
            return;
        }
        long total = eventoInscricaoRepository.countByEventoIdAndStatus(evento.getId(), StatusInscricaoEvento.ATIVA);
        if (total >= evento.getCapacidade()) {
            throw new BadRequestAlertException("Capacidade máxima do evento atingida", ENTITY, "capacidadeesgotada");
        }
    }

    private void notificarAlteracoesImportantes(EventoSnapshot antes, Evento depois) {
        List<String> alteracoes = new ArrayList<>();
        if (!Objects.equals(antes.titulo, depois.getTitulo())) {
            alteracoes.add("título");
        }
        if (!Objects.equals(antes.dataInicio, depois.getDataInicio()) || !Objects.equals(antes.dataFim, depois.getDataFim())) {
            alteracoes.add("data/horário");
        }
        if (!Objects.equals(antes.local, depois.getLocal())) {
            alteracoes.add("local");
        }
        if (!Objects.equals(antes.status, depois.getStatus())) {
            alteracoes.add("status");
        }
        if (alteracoes.isEmpty()) {
            return;
        }
        String detalhe = alteracoes.stream().collect(Collectors.joining(", "));
        ConfigNotificacaoDTO config = notificacaoProgramadaService.lerConfig(depois.getConfigNotificacao());
        if (config.isEfetivamenteAtivo() && Boolean.TRUE.equals(config.getEnviarNaAlteracao())) {
            if (depois.getStatus() == StatusEvento.CANCELADO) {
                notificacaoProgramadaService.notificarCancelamentoEvento(depois, config);
            } else {
                notificacaoProgramadaService.notificarAlteracaoEvento(depois, config, detalhe);
            }
            return;
        }
        List<EventoInscricao> inscritos = eventoInscricaoRepository.findByEventoIdAndStatus(
            depois.getId(),
            StatusInscricaoEvento.ATIVA
        );
        for (EventoInscricao inscricao : inscritos) {
            if (inscricao.getUser() == null) {
                continue;
            }
            if (depois.getStatus() == StatusEvento.CANCELADO) {
                eventoNotificacaoService.notificarCancelamentoEvento(depois, inscricao.getUser());
            } else {
                eventoNotificacaoService.notificarAlteracaoEvento(depois, inscricao.getUser(), detalhe);
            }
        }
    }

    private void aplicarDados(Evento entity, EventoDTO dto) {
        entity.setTitulo(dto.getTitulo().trim());
        entity.setDescricao(dto.getDescricao());
        entity.setDataInicio(dto.getDataInicio());
        entity.setDataFim(dto.getDataFim());
        entity.setLocal(dto.getLocal());
        entity.setPublico(dto.getPublico());
        entity.setInscricoesAbertas(dto.getInscricoesAbertas() != null ? dto.getInscricoesAbertas() : false);
        entity.setCapacidade(dto.getCapacidade());
        entity.setCategoria(dto.getCategoria() != null ? dto.getCategoria() : CategoriaEvento.OUTRO);
        entity.setStatus(dto.getStatus() != null ? dto.getStatus() : StatusEvento.PUBLICADO);
        entity.setImagemUrl(dto.getImagemUrl());
        entity.setLinkExterno(dto.getLinkExterno());
        entity.setPrazoCancelamentoInscricao(dto.getPrazoCancelamentoInscricao());
        entity.setConfigNotificacao(ConfigNotificacaoJsonUtil.serializar(dto.getConfigNotificacao()));
    }

    private void validarDados(EventoDTO dto) {
        if (dto.getTitulo() == null || dto.getTitulo().isBlank()) {
            throw new BadRequestAlertException("Título do evento é obrigatório", ENTITY, "tituloobrigatorio");
        }
        if (dto.getDataInicio() == null) {
            throw new BadRequestAlertException("Data de início é obrigatória", ENTITY, "datainicioobrigatoria");
        }
        if (dto.getPublico() == null) {
            throw new BadRequestAlertException("Público do evento é obrigatório", ENTITY, "publicoobrigatorio");
        }
    }

    private Optional<Evento> obterEntidade(Long id) {
        return eventoRepository.findByIdAndIgrejaId(id, tenantService.getIgrejaIdAtual());
    }

    private EventoDTO toDtoResumo(Evento entity, User usuario) {
        EventoDTO dto = preencherDtoBase(entity);
        long total = eventoInscricaoRepository.countByEventoIdAndStatus(entity.getId(), StatusInscricaoEvento.ATIVA);
        dto.setTotalInscritos((int) total);
        Optional<EventoInscricao> inscricaoOpt = eventoInscricaoRepository.findByEventoIdAndUserId(entity.getId(), usuario.getId());
        if (inscricaoOpt.isPresent()) {
            EventoInscricao inscricao = inscricaoOpt.get();
            dto.setInscrito(inscricao.getStatus() == StatusInscricaoEvento.ATIVA);
            dto.setSituacaoInscricao(inscricao.getStatus().name());
        } else {
            dto.setInscrito(false);
            dto.setSituacaoInscricao(null);
        }
        preencherSituacaoInscricaoEvento(dto, entity, total);
        return dto;
    }

    private EventoDTO toDtoComInscricoes(Evento entity, User usuario, String filtroStatus, String busca) {
        EventoDTO dto = toDtoResumo(entity, usuario);
        dto.setInscricoes(
            eventoInscricaoRepository
                .findByEventoId(entity.getId())
                .stream()
                .map(this::toInscricaoDto)
                .filter(i -> filtrarInscricaoPorStatus(i, filtroStatus))
                .filter(i -> filtrarInscricaoPorBusca(i, busca))
                .toList()
        );
        return dto;
    }

    private void preencherSituacaoInscricaoEvento(EventoDTO dto, Evento entity, long totalAtivos) {
        boolean lotado = entity.getCapacidade() != null && totalAtivos >= entity.getCapacidade();
        dto.setLotado(lotado);
        boolean encerradas =
            !Boolean.TRUE.equals(entity.getInscricoesAbertas()) ||
            entity.getStatus() != StatusEvento.PUBLICADO ||
            (entity.getDataInicio() != null && entity.getDataInicio().isBefore(Instant.now()));
        dto.setInscricoesEncerradas(encerradas);
        if (entity.getCapacidade() != null) {
            dto.setVagasDisponiveis(Math.max(0, entity.getCapacidade() - (int) totalAtivos));
        }
    }

    private EventoDTO preencherDtoBase(Evento entity) {
        EventoDTO dto = new EventoDTO();
        dto.setId(entity.getId());
        if (entity.getIgreja() != null) {
            dto.setIgrejaId(entity.getIgreja().getId());
        }
        dto.setTitulo(entity.getTitulo());
        dto.setDescricao(entity.getDescricao());
        dto.setDataInicio(entity.getDataInicio());
        dto.setDataFim(entity.getDataFim());
        dto.setLocal(entity.getLocal());
        dto.setPublico(entity.getPublico());
        dto.setInscricoesAbertas(entity.getInscricoesAbertas());
        dto.setCapacidade(entity.getCapacidade());
        dto.setCategoria(entity.getCategoria());
        dto.setStatus(entity.getStatus());
        dto.setImagemUrl(entity.getImagemUrl());
        dto.setLinkExterno(entity.getLinkExterno());
        dto.setPrazoCancelamentoInscricao(entity.getPrazoCancelamentoInscricao());
        dto.setCriadoEm(entity.getCriadoEm());
        dto.setConfigNotificacao(notificacaoProgramadaService.lerConfig(entity.getConfigNotificacao()));
        return dto;
    }

    private EventoInscricaoDTO toInscricaoDto(EventoInscricao entity) {
        EventoInscricaoDTO dto = new EventoInscricaoDTO();
        dto.setId(entity.getId());
        if (entity.getEvento() != null) {
            dto.setEventoId(entity.getEvento().getId());
        }
        if (entity.getUser() != null) {
            dto.setUserId(entity.getUser().getId());
            dto.setUserNome(montarNome(entity.getUser()));
            dto.setUserEmail(entity.getUser().getEmail());
            dto.setUserTelefone(primeiroTelefone(entity.getUser()));
        }
        dto.setConfirmado(entity.getConfirmado());
        dto.setStatus(entity.getStatus());
        dto.setCriadoEm(entity.getCriadoEm());
        dto.setCanceladoEm(entity.getCanceladoEm());
        return dto;
    }

    private String primeiroTelefone(User user) {
        if (user.getPhone() != null && !user.getPhone().isBlank()) {
            return user.getPhone();
        }
        if (user.getPhoneSecondary() != null && !user.getPhoneSecondary().isBlank()) {
            return user.getPhoneSecondary();
        }
        return null;
    }

    private boolean filtrarInscricaoPorStatus(EventoInscricaoDTO inscricao, String filtroStatus) {
        if (filtroStatus == null || filtroStatus.isBlank() || "TODOS".equalsIgnoreCase(filtroStatus)) {
            return true;
        }
        return switch (filtroStatus.toUpperCase(Locale.ROOT)) {
            case "CONFIRMADOS" -> Boolean.TRUE.equals(inscricao.getConfirmado()) && inscricao.getStatus() == StatusInscricaoEvento.ATIVA;
            case "PENDENTES" -> !Boolean.TRUE.equals(inscricao.getConfirmado()) && inscricao.getStatus() == StatusInscricaoEvento.ATIVA;
            case "CANCELADOS" -> inscricao.getStatus() == StatusInscricaoEvento.CANCELADA;
            default -> true;
        };
    }

    private boolean filtrarInscricaoPorBusca(EventoInscricaoDTO inscricao, String busca) {
        if (busca == null || busca.isBlank()) {
            return true;
        }
        String termo = busca.trim().toLowerCase(Locale.ROOT);
        return (
            contem(inscricao.getUserNome(), termo) ||
            contem(inscricao.getUserEmail(), termo) ||
            contem(inscricao.getUserTelefone(), termo)
        );
    }

    private void validarLideranca() {
        User user = tenantService.getUsuarioAtual();
        if (!ehLideranca(user)) {
            throw new BadRequestAlertException("Acesso restrito à liderança", ENTITY, "acessonegado");
        }
    }

    private boolean ehLideranca(User user) {
        return user
            .getAuthorities()
            .stream()
            .anyMatch(a ->
                AuthoritiesConstants.ADMIN.equals(a.getName()) ||
                AuthoritiesConstants.ADMIN_IGREJA.equals(a.getName()) ||
                AuthoritiesConstants.PASTOR.equals(a.getName()) ||
                AuthoritiesConstants.COPASTOR.equals(a.getName()) ||
                AuthoritiesConstants.LIDER.equals(a.getName()) ||
                AuthoritiesConstants.SECRETARIA.equals(a.getName())
            );
    }

    private String montarNome(User user) {
        String nome = (Objects.toString(user.getFirstName(), "") + " " + Objects.toString(user.getLastName(), "")).trim();
        return nome.isBlank() ? user.getLogin() : nome;
    }

    private String csvValor(String valor) {
        if (valor == null) {
            return "";
        }
        String escapado = valor.replace("\"", "\"\"");
        if (escapado.contains(",") || escapado.contains("\"") || escapado.contains("\n")) {
            return "\"" + escapado + "\"";
        }
        return escapado;
    }

    private BadRequestAlertException naoEncontrado() {
        return new BadRequestAlertException("Evento não encontrado", ENTITY, "naoencontrado");
    }

    private Path diretorioBanner(Long eventoId) {
        return Paths.get(uploadDir, "eventos", eventoId.toString()).toAbsolutePath().normalize();
    }

    private void removerArquivoBanner(Long eventoId) {
        Path dir = diretorioBanner(eventoId);
        if (!Files.isDirectory(dir)) {
            return;
        }
        try {
            Files.list(dir)
                .filter(p -> p.getFileName().toString().startsWith("banner."))
                .forEach(path -> {
                    try {
                        Files.deleteIfExists(path);
                    } catch (IOException e) {
                        LOG.warn("Erro ao remover banner do evento {}", eventoId, e);
                    }
                });
        } catch (IOException e) {
            LOG.warn("Erro ao listar banner do evento {}", eventoId, e);
        }
    }

    private boolean ehBannerInterno(String imagemUrl) {
        return imagemUrl != null && imagemUrl.matches("/api/eventos/\\d+/banner");
    }

    private boolean isTipoImagemPermitido(String contentType) {
        return (
            "image/jpeg".equals(contentType) ||
            "image/png".equals(contentType) ||
            "image/gif".equals(contentType) ||
            "image/webp".equals(contentType)
        );
    }

    private String extensaoPorContentType(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> "jpg";
            case "image/png" -> "png";
            case "image/gif" -> "gif";
            case "image/webp" -> "webp";
            default -> "jpg";
        };
    }

    private String contentTypePorExtensao(String ext) {
        return switch (ext) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            default -> "application/octet-stream";
        };
    }

    public record BannerArquivo(byte[] bytes, String contentType) {}

    private record EventoSnapshot(String titulo, Instant dataInicio, Instant dataFim, String local, StatusEvento status) {
        static EventoSnapshot from(Evento evento) {
            return new EventoSnapshot(
                evento.getTitulo(),
                evento.getDataInicio(),
                evento.getDataFim(),
                evento.getLocal(),
                evento.getStatus()
            );
        }
    }
}
