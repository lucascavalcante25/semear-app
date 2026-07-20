package br.com.semear.service;

import br.com.semear.domain.AssinaturaIgreja;
import br.com.semear.domain.Comunicado;
import br.com.semear.domain.DocumentoIgreja;
import br.com.semear.domain.Evento;
import br.com.semear.domain.Igreja;
import br.com.semear.domain.Escala;
import br.com.semear.domain.EscalaItem;
import br.com.semear.domain.PedidoOracao;
import br.com.semear.domain.SolicitacaoSuporte;
import br.com.semear.domain.NotificacaoUsuario;
import br.com.semear.domain.User;
import br.com.semear.domain.enumeration.StatusEvento;
import br.com.semear.domain.enumeration.StatusInscricaoEvento;
import br.com.semear.domain.enumeration.StatusAssinatura;
import br.com.semear.domain.enumeration.StatusEscalaPublicacao;
import br.com.semear.domain.enumeration.StatusCadastro;
import br.com.semear.domain.enumeration.StatusPedidoOracao;
import br.com.semear.domain.enumeration.TipoPagamentoPlataforma;
import br.com.semear.domain.enumeration.VisibilidadePedidoOracao;
import br.com.semear.domain.UsuarioNotificacaoVista;
import br.com.semear.config.Constants;
import br.com.semear.domain.enumeration.StatusSolicitacaoSuporte;
import br.com.semear.repository.AssinaturaIgrejaRepository;
import br.com.semear.repository.ComunicadoRepository;
import br.com.semear.repository.DocumentoIgrejaRepository;
import br.com.semear.repository.EscalaItemRepository;
import br.com.semear.repository.EventoInscricaoRepository;
import br.com.semear.repository.EventoRepository;
import br.com.semear.repository.NotificacaoUsuarioRepository;
import br.com.semear.repository.PedidoOracaoRepository;
import br.com.semear.repository.PreCadastroRepository;
import br.com.semear.repository.SolicitacaoSuporteRepository;
import br.com.semear.repository.UserRepository;
import br.com.semear.repository.UsuarioNotificacaoVistaRepository;
import br.com.semear.repository.projection.AniversarianteProjection;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.security.SecurityUtils;
import br.com.semear.service.dto.NotificacaoPayloadDTO;
import br.com.semear.service.dto.NotificacaoContagemDTO;
import br.com.semear.service.dto.NotificacaoResumoDTO;
import br.com.semear.service.util.EscalaNotificacaoUtils;
import br.com.semear.service.util.EventoLembreteMensagens;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificacaoService {

    private static final Logger LOG = LoggerFactory.getLogger(NotificacaoService.class);
    private static final String TIPO_COMUNICADO = "COMUNICADO";
    private static final String TIPO_ANIVERSARIANTE = "ANIVERSARIANTE";
    public static final String TIPO_SUPORTE = "SUPORTE";
    public static final String TIPO_ASSINATURA = "ASSINATURA";
    public static final String TIPO_SAAS = "SAAS";
    public static final String TIPO_PEDIDO_ORACAO = "PEDIDO_ORACAO";
    public static final String TIPO_DOCUMENTO_VENCENDO = "DOCUMENTO_VENCENDO";
    public static final String TIPO_ESCALA = "ESCALA";
    public static final String TIPO_ESCALA_ALTERACAO = "ESCALA_ALTERACAO";
    public static final String TIPO_ESCALA_CANCELAMENTO = "ESCALA_CANCELAMENTO";
    public static final String TIPO_EVENTO = "EVENTO";

    private final ComunicadoRepository comunicadoRepository;
    private final UserRepository userRepository;
    private final UsuarioNotificacaoVistaRepository vistaRepository;
    private final TenantService tenantService;
    private final SolicitacaoSuporteRepository solicitacaoSuporteRepository;
    private final AssinaturaIgrejaRepository assinaturaIgrejaRepository;
    private final PedidoOracaoRepository pedidoOracaoRepository;
    private final DocumentoIgrejaRepository documentoIgrejaRepository;
    private final EscalaItemRepository escalaItemRepository;
    private final EventoRepository eventoRepository;
    private final EventoInscricaoRepository eventoInscricaoRepository;
    private final NotificacaoUsuarioRepository notificacaoUsuarioRepository;
    private final NotificacaoEnvioService notificacaoEnvioService;
    private final PreCadastroRepository preCadastroRepository;

    public NotificacaoService(
        ComunicadoRepository comunicadoRepository,
        UserRepository userRepository,
        UsuarioNotificacaoVistaRepository vistaRepository,
        TenantService tenantService,
        SolicitacaoSuporteRepository solicitacaoSuporteRepository,
        AssinaturaIgrejaRepository assinaturaIgrejaRepository,
        PedidoOracaoRepository pedidoOracaoRepository,
        DocumentoIgrejaRepository documentoIgrejaRepository,
        EscalaItemRepository escalaItemRepository,
        EventoRepository eventoRepository,
        EventoInscricaoRepository eventoInscricaoRepository,
        NotificacaoUsuarioRepository notificacaoUsuarioRepository,
        NotificacaoEnvioService notificacaoEnvioService,
        PreCadastroRepository preCadastroRepository
    ) {
        this.comunicadoRepository = comunicadoRepository;
        this.userRepository = userRepository;
        this.vistaRepository = vistaRepository;
        this.tenantService = tenantService;
        this.solicitacaoSuporteRepository = solicitacaoSuporteRepository;
        this.assinaturaIgrejaRepository = assinaturaIgrejaRepository;
        this.pedidoOracaoRepository = pedidoOracaoRepository;
        this.documentoIgrejaRepository = documentoIgrejaRepository;
        this.escalaItemRepository = escalaItemRepository;
        this.eventoRepository = eventoRepository;
        this.eventoInscricaoRepository = eventoInscricaoRepository;
        this.notificacaoUsuarioRepository = notificacaoUsuarioRepository;
        this.notificacaoEnvioService = notificacaoEnvioService;
        this.preCadastroRepository = preCadastroRepository;
    }

    private static final ZoneId ZONE_BR = ZoneId.of("America/Sao_Paulo");
    private static final long CACHE_RESUMO_TTL_MS = 90_000;

    private final ConcurrentHashMap<String, CacheResumoNotificacao> cacheResumoPorLogin = new ConcurrentHashMap<>();

    private record CacheResumoNotificacao(NotificacaoResumoDTO resumo, String fingerprint, long expiraEm) {}

    public record NotificacaoItem(String tipo, Long referenciaId, String titulo, String descricao, String link) {}

    @Transactional(readOnly = true)
    public List<NotificacaoItem> listarNaoVistas() {
        Optional<User> userOpt = SecurityUtils.getCurrentUserLogin().flatMap(userRepository::findOneWithAuthoritiesByLogin);
        if (userOpt.isEmpty()) {
            return List.of();
        }
        User user = userOpt.get();

        Set<Long> comunicadosVistos = vistaRepository.findReferenciaIdsByUserAndTipo(user, TIPO_COMUNICADO);
        Set<Long> avisosLegadoVistos = vistaRepository.findReferenciaIdsByUserAndTipo(user, "AVISO");
        Set<Long> aniversariantesVistos = vistaRepository.findReferenciaIdsByUserAndTipo(user, TIPO_ANIVERSARIANTE);

        List<NotificacaoItem> itens = new ArrayList<>();
        LocalDate hoje = LocalDate.now(ZONE_BR);

        Long igrejaId = tenantService.getIgrejaIdAtual();
        List<Comunicado> comunicados = comunicadoRepository
            .findAllByIgrejaIdAndAtivoIsTrue(PageRequest.of(0, 20), igrejaId)
            .getContent();
        for (Comunicado c : comunicados) {
            if (!comunicadoEstaVigente(c, hoje)) {
                continue;
            }
            if (!comunicadosVistos.contains(c.getId()) && !avisosLegadoVistos.contains(c.getId())) {
                String desc = c.getConteudo() != null && c.getConteudo().length() > 80
                    ? c.getConteudo().substring(0, 80) + "..."
                    : c.getConteudo();
                itens.add(new NotificacaoItem(
                    TIPO_COMUNICADO,
                    c.getId(),
                    c.getTitulo(),
                    desc,
                    "/comunicados"
                ));
            }
        }

        List<AniversarianteProjection> aniversariantes = userRepository.findAniversariantesDoDiaPorIgreja(
            igrejaId,
            hoje.getMonthValue(),
            hoje.getDayOfMonth()
        );

        for (AniversarianteProjection u : aniversariantes) {
            if (!aniversariantesVistos.contains(u.getId())) {
                String name = (Objects.toString(u.getFirstName(), "") + " " + Objects.toString(u.getLastName(), "")).trim();
                if (name.isBlank()) name = u.getLogin();
                itens.add(new NotificacaoItem(
                    TIPO_ANIVERSARIANTE,
                    u.getId(),
                    "Aniversariante do dia",
                    name + " faz aniversário hoje!",
                    "/"
                ));
            }
        }

        if (usuarioPodeAcessarSuporte(user)) {
            List<SolicitacaoSuporte> suportePendentes = solicitacaoSuporteRepository.findNaoLidasPeloClienteDaIgreja(igrejaId);
            for (SolicitacaoSuporte s : suportePendentes) {
                itens.add(new NotificacaoItem(
                    TIPO_SUPORTE,
                    s.getId(),
                    "Solicitação de suporte atualizada",
                    mensagemSuporte(s),
                    "/suporte/" + s.getId()
                ));
            }
        }

        if (usuarioEhLideranca(user)) {
            Set<Long> pedidosVistos = vistaRepository.findReferenciaIdsByUserAndTipo(user, TIPO_PEDIDO_ORACAO);
            List<PedidoOracao> pedidosLideranca = pedidoOracaoRepository.findPendentesNotificacaoLideranca(igrejaId);
            for (PedidoOracao p : pedidosLideranca) {
                if (pedidosVistos.contains(p.getId())) {
                    continue;
                }
                boolean privado = p.getVisibilidade() == VisibilidadePedidoOracao.PRIVADA;
                boolean aguardando = p.getStatus() == StatusPedidoOracao.AGUARDANDO_APROVACAO;
                if (!privado && !aguardando) {
                    continue;
                }
                String titulo = privado ? "Novo pedido de oração privado" : "Pedido público aguardando aprovação";
                itens.add(new NotificacaoItem(
                    TIPO_PEDIDO_ORACAO,
                    p.getId(),
                    titulo,
                    p.getTitulo(),
                    "/oracao"
                ));
            }
        }

        Set<Long> assinaturaVistos = vistaRepository.findReferenciaIdsByUserAndTipo(user, TIPO_ASSINATURA);
        Set<Long> saasVistos = vistaRepository.findReferenciaIdsByUserAndTipo(user, TIPO_SAAS);

        boolean superAdmin = user
            .getAuthorities()
            .stream()
            .anyMatch(a -> AuthoritiesConstants.SUPER_ADMIN.equals(a.getName()));

        if (superAdmin) {
            LocalDate hojeSaas = LocalDate.now();
            List<AssinaturaIgreja> assinaturas = assinaturaIgrejaRepository.findAllByOrderByDataCadastroDesc();
            for (AssinaturaIgreja a : assinaturas) {
                if (a.getStatusAssinatura() != StatusAssinatura.EM_TESTE || a.getDataFimTeste() == null) {
                    continue;
                }
                long dias = java.time.temporal.ChronoUnit.DAYS.between(hojeSaas, a.getDataFimTeste());
                if (dias <= 3 && !saasVistos.contains(a.getId())) {
                    String igrejaNome = a.getIgreja() != null ? a.getIgreja().getNome() : "Igreja";
                    String titulo = dias < 0 ? "Teste vencido" : dias == 0 ? "Teste vence hoje" : "Teste vencendo";
                    itens.add(new NotificacaoItem(
                        TIPO_SAAS,
                        a.getId(),
                        titulo,
                        igrejaNome + " — " + (dias < 0 ? "teste expirado" : dias + " dia(s) restante(s)"),
                        "/super-admin/dashboard"
                    ));
                }
            }
        } else {
            assinaturaIgrejaRepository.findFirstByIgrejaIdOrderByDataCadastroDesc(igrejaId).ifPresent(a -> {
                if (assinaturaVistos.contains(a.getId())) {
                    return;
                }
                if (a.getStatusAssinatura() == StatusAssinatura.EM_TESTE && a.getDataFimTeste() != null) {
                    long dias = java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), a.getDataFimTeste());
                    if (dias <= 3) {
                        itens.add(new NotificacaoItem(
                            TIPO_ASSINATURA,
                            a.getId(),
                            "Teste grátis terminando",
                            "Seu teste grátis termina em " + Math.max(dias, 0) + " dia(s).",
                            "/suporte"
                        ));
                    }
                } else if (
                    a.getStatusAssinatura() == StatusAssinatura.PENDENTE_PAGAMENTO ||
                    a.getStatusAssinatura() == StatusAssinatura.SUSPENSA
                ) {
                    itens.add(new NotificacaoItem(
                        TIPO_ASSINATURA,
                        a.getId(),
                        "Acesso bloqueado",
                        "Entre em contato com o suporte para ativar sua assinatura.",
                        "/suporte"
                    ));
                }
            });
        }

        if (usuarioEhLideranca(user)) {
            Set<Long> docsVistos = vistaRepository.findReferenciaIdsByUserAndTipo(user, TIPO_DOCUMENTO_VENCENDO);
            List<DocumentoIgreja> docsVencendo = documentoIgrejaRepository.findByIgrejaIdAndAtivoTrueAndDataValidadeBetweenOrderByDataValidadeAsc(
                igrejaId,
                hoje,
                hoje.plusDays(30)
            );
            for (DocumentoIgreja doc : docsVencendo) {
                if (!docsVistos.contains(doc.getId())) {
                    itens.add(new NotificacaoItem(
                        TIPO_DOCUMENTO_VENCENDO,
                        doc.getId(),
                        "Documento vencendo",
                        doc.getNome() + " vence em " + doc.getDataValidade(),
                        "/configuracoes-igreja"
                    ));
                }
            }
        }

        Instant inicioHoje = hoje.atStartOfDay(ZONE_BR).toInstant();
        for (EscalaItem item : escalaItemRepository.findItensUsuarioAguardandoConfirmacao(
            user.getId(),
            StatusEscalaPublicacao.PUBLICADA,
            inicioHoje
        )) {
            Escala escala = item.getEscala();
            if (escala == null || !EscalaNotificacaoUtils.escalaElegivelParaNotificacao(escala)) {
                continue;
            }
            String tituloEscala = escala.getTitulo() != null ? escala.getTitulo() : "Escala";
            String departamento = escala.getDepartamento() != null ? escala.getDepartamento().getNome() : null;
            String descricao = departamento != null ? departamento + " — " + tituloEscala : tituloEscala;
            itens.add(new NotificacaoItem(
                TIPO_ESCALA,
                item.getId(),
                "Você está escalado para servir",
                descricao,
                "/escalas?escalaId=" + escala.getId() + "&itemId=" + item.getId()
            ));
        }

        for (NotificacaoUsuario notificacao : notificacaoUsuarioRepository.findByUserAndLidaFalseOrderByCriadoEmDesc(user)) {
            if (TIPO_ESCALA.equals(notificacao.getTipo())) {
                continue;
            }
            String titulo = notificacao.getTitulo();
            String mensagem = notificacao.getMensagem();
            if (
                EventoLembreteMensagens.ehTipoLembreteEvento(notificacao.getTipo()) &&
                "EVENTO".equals(notificacao.getEntidadeTipo()) &&
                notificacao.getEntidadeId() != null
            ) {
                var eventoOpt = eventoRepository.findById(notificacao.getEntidadeId());
                if (eventoOpt.isPresent()) {
                    EventoLembreteMensagens.TextoLembrete texto = EventoLembreteMensagens.montar(eventoOpt.get());
                    titulo = texto.titulo();
                    mensagem = texto.mensagem();
                }
            }
            itens.add(new NotificacaoItem(
                notificacao.getTipo(),
                notificacao.getId(),
                titulo,
                mensagem,
                notificacao.getLink() != null ? notificacao.getLink() : "/eventos"
            ));
        }

        Set<Long> eventosVistos = vistaRepository.findReferenciaIdsByUserAndTipo(user, TIPO_EVENTO);
        Instant agora = Instant.now();
        Instant limite = agora.plusSeconds(7L * 24 * 3600);
        for (Evento evento : eventoRepository.findPublicadosProximosParaNotificacao(
            igrejaId,
            StatusEvento.PUBLICADO,
            agora,
            limite
        )) {
            if (eventosVistos.contains(evento.getId())) {
                continue;
            }
            if (evento.getDataInicio() == null) {
                continue;
            }
            boolean inscrito = eventoInscricaoRepository
                .findByEventoIdAndUserId(evento.getId(), user.getId())
                .filter(i -> i.getStatus() == StatusInscricaoEvento.ATIVA)
                .isPresent();
            if (inscrito) {
                continue;
            }
            itens.add(new NotificacaoItem(
                TIPO_EVENTO,
                evento.getId(),
                "Evento próximo",
                evento.getTitulo(),
                "/eventos"
            ));
        }

        return itens;
    }

    @Transactional(readOnly = true)
    public NotificacaoResumoDTO obterResumo() {
        Optional<User> userOpt = SecurityUtils.getCurrentUserLogin().flatMap(userRepository::findOneWithAuthoritiesByLogin);
        NotificacaoResumoDTO resumo = new NotificacaoResumoDTO();
        if (userOpt.isEmpty()) {
            return resumo;
        }
        User user = userOpt.get();
        String login = user.getLogin();
        if (login != null) {
            CacheResumoNotificacao cache = cacheResumoPorLogin.get(login);
            if (cache != null && System.currentTimeMillis() < cache.expiraEm()) {
                return cache.resumo();
            }
        }

        resumo = construirResumo(user);
        if (login != null) {
            String fingerprint = calcularFingerprint(resumo);
            cacheResumoPorLogin.put(
                login,
                new CacheResumoNotificacao(resumo, fingerprint, System.currentTimeMillis() + CACHE_RESUMO_TTL_MS)
            );
        }
        return resumo;
    }

    @Transactional(readOnly = true)
    public NotificacaoContagemDTO obterContagem() {
        NotificacaoResumoDTO resumo = obterResumo();
        NotificacaoContagemDTO contagem = new NotificacaoContagemDTO();
        contagem.setTotalNotificacoes(resumo.getNotificacoes().size());
        contagem.setPreCadastrosPendentes(resumo.getPreCadastrosPendentes());
        contagem.setPedidosOracaoPendentes(resumo.getPedidosOracaoPendentes());
        contagem.setFingerprint(calcularFingerprint(resumo));
        return contagem;
    }

    @Transactional(readOnly = true)
    public Optional<String> obterFingerprintAtual() {
        Optional<User> userOpt = SecurityUtils.getCurrentUserLogin().flatMap(userRepository::findOneByLogin);
        if (userOpt.isEmpty()) {
            return Optional.empty();
        }
        String login = userOpt.get().getLogin();
        if (login == null) {
            return Optional.empty();
        }
        CacheResumoNotificacao cache = cacheResumoPorLogin.get(login);
        if (cache != null && System.currentTimeMillis() < cache.expiraEm()) {
            return Optional.of(cache.fingerprint());
        }
        return Optional.of(calcularFingerprint(obterResumo()));
    }

    private NotificacaoResumoDTO construirResumo(User user) {
        NotificacaoResumoDTO resumo = new NotificacaoResumoDTO();
        resumo.setNotificacoes(listarNaoVistas());

        if (usuarioPodeAprovarPreCadastro(user)) {
            Long igrejaId = tenantService.getIgrejaIdAtual();
            long pendentes = preCadastroRepository.countByIgrejaIdAndStatusIn(
                igrejaId,
                List.of(StatusCadastro.PRIMEIROACESSO, StatusCadastro.PENDENTE)
            );
            resumo.setPreCadastrosPendentes((int) pendentes);
        }

        if (usuarioEhLideranca(user)) {
            Long igrejaId = tenantService.getIgrejaIdAtual();
            long oracaoPendentes = pedidoOracaoRepository.countByIgrejaIdAndDeletedAtIsNullAndStatusIn(
                igrejaId,
                List.of(StatusPedidoOracao.AGUARDANDO_APROVACAO)
            );
            resumo.setPedidosOracaoPendentes((int) oracaoPendentes);
        }

        return resumo;
    }

    private String calcularFingerprint(NotificacaoResumoDTO resumo) {
        StringBuilder sb = new StringBuilder();
        sb.append("p=").append(resumo.getPreCadastrosPendentes());
        sb.append(";o=").append(resumo.getPedidosOracaoPendentes());
        sb.append(";n=").append(resumo.getNotificacoes().size());
        sb.append(';');
        resumo
            .getNotificacoes()
            .stream()
            .sorted(
                Comparator.comparing(NotificacaoItem::tipo, Comparator.nullsLast(String::compareTo)).thenComparing(
                    NotificacaoItem::referenciaId,
                    Comparator.nullsLast(Comparator.naturalOrder())
                )
            )
            .forEach(item -> sb.append(item.tipo()).append(':').append(item.referenciaId()).append(','));
        return Integer.toHexString(sb.toString().hashCode());
    }

    private void invalidarCacheUsuario(User user) {
        if (user != null && user.getLogin() != null) {
            cacheResumoPorLogin.remove(user.getLogin());
        }
    }

    public void notificarTesteIniciado(Igreja igreja, AssinaturaIgreja assinatura) {
        LOG.info("Teste grátis iniciado para igreja {} (assinatura {})", igreja != null ? igreja.getNome() : "?", assinatura.getId());
    }

    public void notificarTesteVencendo(Igreja igreja, int dias) {
        LOG.info("Teste vencendo em {} dia(s) para igreja {}", dias, igreja != null ? igreja.getNome() : "?");
    }

    public void notificarTesteVencido(Igreja igreja) {
        LOG.info("Teste vencido para igreja {}", igreja != null ? igreja.getNome() : "?");
    }

    public void notificarAssinaturaAtivada(Igreja igreja) {
        LOG.info("Assinatura ativada para igreja {}", igreja != null ? igreja.getNome() : "?");
    }

    public void notificarPedidoOracaoPrivado(PedidoOracao pedido) {
        LOG.info("Novo pedido de oração privado {} na igreja {}", pedido.getId(), pedido.getIgreja() != null ? pedido.getIgreja().getId() : "?");
    }

    public void notificarPedidoOracaoAguardandoAprovacao(PedidoOracao pedido) {
        LOG.info(
            "Pedido de oração {} aguardando aprovação na igreja {}",
            pedido.getId(),
            pedido.getIgreja() != null ? pedido.getIgreja().getId() : "?"
        );
    }

    public void notificarEscalaItemAtribuido(Escala escala, EscalaItem item) {
        if (!EscalaNotificacaoUtils.escalaElegivelParaNotificacao(escala)) {
            return;
        }
        if (item == null || item.getUser() == null || !item.getUser().isActivated()) {
            return;
        }
        if (escala.getIgreja() == null || escala.getIgreja().getId() == null) {
            return;
        }

        User user = item.getUser();
        NotificacaoPayloadDTO payload = new NotificacaoPayloadDTO();
        payload.setIgrejaId(escala.getIgreja().getId());
        payload.setTipo(TIPO_ESCALA);
        payload.setEntidadeTipo("ESCALA");
        payload.setEntidadeId(escala.getId());
        payload.setTitulo("Nova escala atribuída");
        payload.setMensagem("Você foi escalado para " + EscalaNotificacaoUtils.montarDescricao(escala));
        payload.setRotaDestino(EscalaNotificacaoUtils.montarRota(escala, item));
        payload.setRegistrarDeduplicacao(true);
        payload.setChaveDeduplicacao(EscalaNotificacaoUtils.montarChavePrimeiraNotificacao(item.getId(), user.getId()));
        notificacaoEnvioService.enviarParaUsuario(user.getId(), payload);
        LOG.info(
            "Notificação de escala enviada — item {} escala {} usuário {}",
            item.getId(),
            escala.getId(),
            user.getId()
        );
    }

    /** Compara estado anterior/depois da edição e notifica escalados pertinentes. */
    public void processarAlteracoesEscala(
        Escala escala,
        String tituloAntes,
        Instant dataAntes,
        List<EscalaItem> itensAntes,
        List<EscalaItem> itensDepois
    ) {
        if (!EscalaNotificacaoUtils.escalaElegivelParaNotificacao(escala)) {
            return;
        }
        String detalhe = montarDetalheAlteracaoEscala(tituloAntes, dataAntes, escala);
        Set<Long> usersAntes = extrairUserIds(itensAntes);
        Set<Long> usersDepois = extrairUserIds(itensDepois);

        for (EscalaItem item : itensAntes) {
            if (item.getUser() == null || item.getUser().getId() == null) {
                continue;
            }
            if (!usersDepois.contains(item.getUser().getId())) {
                notificarEscalaRemovida(escala, item.getUser());
            }
        }

        for (EscalaItem item : itensDepois) {
            if (item.getUser() == null || item.getUser().getId() == null) {
                continue;
            }
            if (!usersAntes.contains(item.getUser().getId())) {
                notificarEscalaItemAtribuido(escala, item);
            } else if (detalhe != null) {
                notificarEscalaAlterada(escala, item, detalhe);
            }
        }
    }

    public void notificarEscalaAlterada(Escala escala, EscalaItem item, String detalhe) {
        if (!EscalaNotificacaoUtils.escalaElegivelParaNotificacao(escala) || item == null || item.getUser() == null) {
            return;
        }
        User user = item.getUser();
        if (!user.isActivated() || escala.getIgreja() == null) {
            return;
        }
        NotificacaoPayloadDTO payload = new NotificacaoPayloadDTO();
        payload.setIgrejaId(escala.getIgreja().getId());
        payload.setTipo(TIPO_ESCALA_ALTERACAO);
        payload.setEntidadeTipo("ESCALA");
        payload.setEntidadeId(escala.getId());
        payload.setTitulo("Escala atualizada");
        payload.setMensagem("Sua escala foi alterada (" + detalhe + "): " + EscalaNotificacaoUtils.montarDescricao(escala));
        payload.setRotaDestino(EscalaNotificacaoUtils.montarRota(escala, item));
        payload.setRegistrarDeduplicacao(true);
        payload.setChaveDeduplicacao(
            String.format("ESCALA_ALTERACAO:%s:%s:%s", escala.getId(), user.getId(), detalhe.replace(" ", "_"))
        );
        notificacaoEnvioService.enviarParaUsuario(user.getId(), payload);
    }

    public void notificarEscalaRemovida(Escala escala, User user) {
        if (!EscalaNotificacaoUtils.escalaElegivelParaNotificacao(escala) || user == null || !user.isActivated()) {
            return;
        }
        if (escala.getIgreja() == null || escala.getIgreja().getId() == null) {
            return;
        }
        NotificacaoPayloadDTO payload = new NotificacaoPayloadDTO();
        payload.setIgrejaId(escala.getIgreja().getId());
        payload.setTipo(TIPO_ESCALA_CANCELAMENTO);
        payload.setEntidadeTipo("ESCALA");
        payload.setEntidadeId(escala.getId());
        payload.setTitulo("Escala cancelada");
        payload.setMensagem("Sua escala em " + EscalaNotificacaoUtils.montarDescricao(escala) + " foi removida.");
        payload.setRotaDestino("/escalas");
        payload.setRegistrarDeduplicacao(true);
        payload.setChaveDeduplicacao(String.format("ESCALA_CANCELAMENTO:%s:%s", escala.getId(), user.getId()));
        notificacaoEnvioService.enviarParaUsuario(user.getId(), payload);
    }

    public void notificarEscalasExcluidas(Escala escala) {
        if (escala == null || escala.getId() == null) {
            return;
        }
        for (EscalaItem item : escalaItemRepository.findByEscalaId(escala.getId())) {
            if (item.getUser() != null) {
                notificarEscalaRemovida(escala, item.getUser());
            }
        }
    }

    private static Set<Long> extrairUserIds(List<EscalaItem> itens) {
        Set<Long> ids = new HashSet<>();
        if (itens == null) {
            return ids;
        }
        for (EscalaItem item : itens) {
            if (item.getUser() != null && item.getUser().getId() != null) {
                ids.add(item.getUser().getId());
            }
        }
        return ids;
    }

    private static String montarDetalheAlteracaoEscala(String tituloAntes, Instant dataAntes, Escala escala) {
        List<String> partes = new ArrayList<>();
        if (!Objects.equals(tituloAntes, escala.getTitulo())) {
            partes.add("título");
        }
        if (!Objects.equals(dataAntes, escala.getDataEvento())) {
            partes.add("data/horário");
        }
        if (partes.isEmpty()) {
            return null;
        }
        return String.join(", ", partes);
    }

    public void notificarPagamentoRecebido(Igreja igreja, TipoPagamentoPlataforma tipo) {
        LOG.info("Pagamento {} recebido para igreja {}", tipo, igreja != null ? igreja.getNome() : "?");
    }

    public void notificarAcessoSuspenso(Igreja igreja) {
        LOG.info("Acesso suspenso para igreja {}", igreja != null ? igreja.getNome() : "?");
    }

    public void notificarAcessoReativado(Igreja igreja) {
        LOG.info("Acesso reativado para igreja {}", igreja != null ? igreja.getNome() : "?");
    }

    public void notificarMensalidadeAtrasada(Igreja igreja) {
        LOG.info("Mensalidade atrasada para igreja {}", igreja != null ? igreja.getNome() : "?");
    }

    public void notificarPagamentoAtrasado(Igreja igreja) {
        LOG.info("Pagamento atrasado para igreja {}", igreja != null ? igreja.getNome() : "?");
    }

    @Transactional
    public void resetarNotificacaoSuporte(User usuario, Long solicitacaoId) {
        if (solicitacaoId == null) {
            return;
        }
        vistaRepository.deleteAllByTipoAndReferenciaId(TIPO_SUPORTE, solicitacaoId);
    }

    private boolean usuarioPodeAcessarSuporte(User user) {
        return user
            .getAuthorities()
            .stream()
            .anyMatch(a -> AuthoritiesConstants.ADMIN_IGREJA.equals(a.getName()));
    }

    private boolean usuarioPodeAprovarPreCadastro(User user) {
        return user
            .getAuthorities()
            .stream()
            .anyMatch(a ->
                Set.of(
                    AuthoritiesConstants.ADMIN,
                    AuthoritiesConstants.ADMIN_IGREJA,
                    AuthoritiesConstants.PASTOR,
                    AuthoritiesConstants.COPASTOR,
                    AuthoritiesConstants.SECRETARIA
                ).contains(a.getName())
            );
    }

    private boolean usuarioEhLideranca(User user) {
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

    @Transactional
    public void marcarComoVista(String tipo, Long referenciaId) {
        if (TIPO_ESCALA.equals(tipo)) {
            return;
        }
        Optional<User> userOpt = SecurityUtils.getCurrentUserLogin().flatMap(userRepository::findOneByLogin);
        if (userOpt.isEmpty()) return;
        User user = userOpt.get();

        Optional<NotificacaoUsuario> notificacaoInterna = notificacaoUsuarioRepository.findByIdAndUserId(referenciaId, user.getId());
        if (notificacaoInterna.isPresent()) {
            NotificacaoUsuario notificacao = notificacaoInterna.get();
            if (tipo == null || tipo.equals(notificacao.getTipo())) {
                if (!Boolean.TRUE.equals(notificacao.getLida())) {
                    notificacao.setLida(true);
                    notificacaoUsuarioRepository.save(notificacao);
                    invalidarCacheUsuario(user);
                    LOG.debug(
                        "Notificação interna marcada como lida: {} {} para user {}",
                        notificacao.getTipo(),
                        referenciaId,
                        user.getLogin()
                    );
                }
                return;
            }
        }

        if (vistaRepository.findByUserAndTipoAndReferenciaId(user, tipo, referenciaId).isPresent()) {
            return;
        }

        UsuarioNotificacaoVista vista = new UsuarioNotificacaoVista();
        vista.setUser(user);
        vista.setTipo(tipo);
        vista.setReferenciaId(referenciaId);
        vista.setVistoEm(Instant.now());
        vistaRepository.save(vista);
        invalidarCacheUsuario(user);
        LOG.debug("Notificação marcada como vista: {} {} para user {}", tipo, referenciaId, user.getLogin());
    }

    private static boolean comunicadoEstaVigente(Comunicado comunicado, LocalDate referencia) {
        if (comunicado.getDataInicio() == null) {
            return false;
        }
        if (referencia.isBefore(comunicado.getDataInicio())) {
            return false;
        }
        if (comunicado.getDataFim() != null && referencia.isAfter(comunicado.getDataFim())) {
            return false;
        }
        return true;
    }

    private String mensagemSuporte(SolicitacaoSuporte s) {
        String titulo = s.getTitulo() != null ? s.getTitulo() : "sua solicitação";
        if (s.getStatus() == StatusSolicitacaoSuporte.EM_ANALISE) {
            return "Seu chamado '" + titulo + "' está em análise pela equipe " + Constants.EMPRESA_PLATAFORMA + ".";
        }
        if (s.getStatus() == StatusSolicitacaoSuporte.RESOLVIDA) {
            return "Seu chamado '" + titulo + "' foi marcado como resolvido.";
        }
        if (s.getStatus() == StatusSolicitacaoSuporte.FINALIZADA) {
            return "Seu chamado '" + titulo + "' foi finalizado.";
        }
        return "Seu chamado '" + titulo + "' recebeu uma resposta da equipe " + Constants.EMPRESA_PLATAFORMA + ".";
    }
}
