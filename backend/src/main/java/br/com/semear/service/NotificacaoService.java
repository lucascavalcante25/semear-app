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
import br.com.semear.repository.SolicitacaoSuporteRepository;
import br.com.semear.repository.UserRepository;
import br.com.semear.repository.UsuarioNotificacaoVistaRepository;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.security.SecurityUtils;
import br.com.semear.service.dto.NotificacaoPayloadDTO;
import br.com.semear.service.util.EscalaNotificacaoUtils;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;
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
        NotificacaoEnvioService notificacaoEnvioService
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
    }

    private static final ZoneId ZONE_BR = ZoneId.of("America/Sao_Paulo");

    public record NotificacaoItem(String tipo, Long referenciaId, String titulo, String descricao, String link) {}

    @Transactional(readOnly = true)
    public List<NotificacaoItem> listarNaoVistas() {
        Optional<User> userOpt = SecurityUtils.getCurrentUserLogin().flatMap(userRepository::findOneByLogin);
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

        List<User> aniversariantes = userRepository.findAllByIgrejaIdAndBirthDateIsNotNullAndActivatedIsTrue(igrejaId).stream()
            .filter(u -> {
                LocalDate bd = u.getBirthDate();
                if (bd == null) return false;
                LocalDate thisYear = LocalDate.of(hoje.getYear(), bd.getMonth(), bd.getDayOfMonth());
                return thisYear.equals(hoje);
            })
            .limit(10)
            .collect(Collectors.toList());

        for (User u : aniversariantes) {
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
            List<PedidoOracao> pedidosLideranca = pedidoOracaoRepository.findByIgrejaIdAndDeletedAtIsNullOrderByCriadoEmDesc(igrejaId);
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
            if (!EscalaNotificacaoUtils.escalaDentroDaJanelaPrimeiraNotificacao(escala, hoje)) {
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
            itens.add(new NotificacaoItem(
                notificacao.getTipo(),
                notificacao.getId(),
                notificacao.getTitulo(),
                notificacao.getMensagem(),
                notificacao.getLink() != null ? notificacao.getLink() : "/eventos"
            ));
        }

        Set<Long> eventosVistos = vistaRepository.findReferenciaIdsByUserAndTipo(user, TIPO_EVENTO);
        Instant agora = Instant.now();
        Instant limite = agora.plusSeconds(7L * 24 * 3600);
        for (Evento evento : eventoRepository.findByIgrejaIdOrderByDataInicioDesc(igrejaId)) {
            if (eventosVistos.contains(evento.getId())) {
                continue;
            }
            if (evento.getStatus() != StatusEvento.PUBLICADO) {
                continue;
            }
            if (evento.getDataInicio() == null || evento.getDataInicio().isBefore(agora) || evento.getDataInicio().isAfter(limite)) {
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
        LocalDate hoje = LocalDate.now(ZONE_BR);
        if (!EscalaNotificacaoUtils.escalaDentroDaJanelaPrimeiraNotificacao(escala, hoje)) {
            LOG.debug(
                "Escala {} fora da janela de aviso ({} dias) — notificação adiada",
                escala.getId(),
                EscalaNotificacaoUtils.DIAS_JANELA_PRIMEIRA_NOTIFICACAO
            );
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
        payload.setTitulo("Você está escalado para servir");
        payload.setMensagem(EscalaNotificacaoUtils.montarDescricao(escala));
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

        if (tipo != null && tipo.startsWith("EVENTO_")) {
            notificacaoUsuarioRepository.findByIdAndUserId(referenciaId, user.getId()).ifPresent(notificacao -> {
                notificacao.setLida(true);
                notificacaoUsuarioRepository.save(notificacao);
            });
            return;
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
