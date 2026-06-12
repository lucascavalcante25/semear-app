package br.com.semear.service;

import br.com.semear.domain.AssinaturaIgreja;
import br.com.semear.domain.Aviso;
import br.com.semear.domain.Igreja;
import br.com.semear.domain.SolicitacaoSuporte;
import br.com.semear.domain.User;
import br.com.semear.domain.enumeration.StatusAssinatura;
import br.com.semear.domain.enumeration.TipoPagamentoPlataforma;
import br.com.semear.domain.UsuarioNotificacaoVista;
import br.com.semear.config.Constants;
import br.com.semear.domain.enumeration.StatusSolicitacaoSuporte;
import br.com.semear.repository.AssinaturaIgrejaRepository;
import br.com.semear.repository.AvisoRepository;
import br.com.semear.repository.SolicitacaoSuporteRepository;
import br.com.semear.repository.UserRepository;
import br.com.semear.repository.UsuarioNotificacaoVistaRepository;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.security.SecurityUtils;
import java.time.Instant;
import java.time.LocalDate;
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
    private static final String TIPO_AVISO = "AVISO";
    private static final String TIPO_ANIVERSARIANTE = "ANIVERSARIANTE";
    public static final String TIPO_SUPORTE = "SUPORTE";
    public static final String TIPO_ASSINATURA = "ASSINATURA";
    public static final String TIPO_SAAS = "SAAS";

    private final AvisoRepository avisoRepository;
    private final UserRepository userRepository;
    private final UsuarioNotificacaoVistaRepository vistaRepository;
    private final TenantService tenantService;
    private final SolicitacaoSuporteRepository solicitacaoSuporteRepository;
    private final AssinaturaIgrejaRepository assinaturaIgrejaRepository;

    public NotificacaoService(
        AvisoRepository avisoRepository,
        UserRepository userRepository,
        UsuarioNotificacaoVistaRepository vistaRepository,
        TenantService tenantService,
        SolicitacaoSuporteRepository solicitacaoSuporteRepository,
        AssinaturaIgrejaRepository assinaturaIgrejaRepository
    ) {
        this.avisoRepository = avisoRepository;
        this.userRepository = userRepository;
        this.vistaRepository = vistaRepository;
        this.tenantService = tenantService;
        this.solicitacaoSuporteRepository = solicitacaoSuporteRepository;
        this.assinaturaIgrejaRepository = assinaturaIgrejaRepository;
    }

    public record NotificacaoItem(String tipo, Long referenciaId, String titulo, String descricao, String link) {}

    @Transactional(readOnly = true)
    public List<NotificacaoItem> listarNaoVistas() {
        Optional<User> userOpt = SecurityUtils.getCurrentUserLogin().flatMap(userRepository::findOneByLogin);
        if (userOpt.isEmpty()) {
            return List.of();
        }
        User user = userOpt.get();

        Set<Long> avisosVistos = vistaRepository.findReferenciaIdsByUserAndTipo(user, TIPO_AVISO);
        Set<Long> aniversariantesVistos = vistaRepository.findReferenciaIdsByUserAndTipo(user, TIPO_ANIVERSARIANTE);
        Set<Long> suporteVistos = vistaRepository.findReferenciaIdsByUserAndTipo(user, TIPO_SUPORTE);

        List<NotificacaoItem> itens = new ArrayList<>();
        LocalDate hoje = LocalDate.now();

        Long igrejaId = tenantService.getIgrejaIdAtual();
        List<Aviso> avisos = avisoRepository
            .findAllByIgrejaIdAndAtivoIsTrue(PageRequest.of(0, 20), igrejaId)
            .getContent();
        for (Aviso a : avisos) {
            if (!avisoEstaVigente(a, hoje)) {
                continue;
            }
            if (!avisosVistos.contains(a.getId())) {
                String desc = a.getConteudo() != null && a.getConteudo().length() > 80
                    ? a.getConteudo().substring(0, 80) + "..."
                    : a.getConteudo();
                itens.add(new NotificacaoItem(
                    TIPO_AVISO,
                    a.getId(),
                    a.getTitulo(),
                    desc,
                    "/avisos"
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

        List<SolicitacaoSuporte> suportePendentes = solicitacaoSuporteRepository.findByUsuarioSolicitanteAndLidaPeloClienteFalse(user);
        for (SolicitacaoSuporte s : suportePendentes) {
            if (!suporteVistos.contains(s.getId())) {
                itens.add(new NotificacaoItem(
                    TIPO_SUPORTE,
                    s.getId(),
                    "Solicitação de suporte atualizada",
                    mensagemSuporte(s),
                    "/suporte/" + s.getId()
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
        if (usuario == null || solicitacaoId == null) {
            return;
        }
        vistaRepository
            .findByUserAndTipoAndReferenciaId(usuario, TIPO_SUPORTE, solicitacaoId)
            .ifPresent(vistaRepository::delete);
    }

    @Transactional
    public void marcarComoVista(String tipo, Long referenciaId) {
        Optional<User> userOpt = SecurityUtils.getCurrentUserLogin().flatMap(userRepository::findOneByLogin);
        if (userOpt.isEmpty()) return;

        if (vistaRepository.findByUserAndTipoAndReferenciaId(userOpt.get(), tipo, referenciaId).isPresent()) {
            return;
        }

        UsuarioNotificacaoVista vista = new UsuarioNotificacaoVista();
        vista.setUser(userOpt.get());
        vista.setTipo(tipo);
        vista.setReferenciaId(referenciaId);
        vista.setVistoEm(Instant.now());
        vistaRepository.save(vista);
        LOG.debug("Notificação marcada como vista: {} {} para user {}", tipo, referenciaId, userOpt.get().getLogin());
    }

    private static boolean avisoEstaVigente(Aviso aviso, LocalDate referencia) {
        if (aviso.getDataInicio() == null) {
            return false;
        }
        if (referencia.isBefore(aviso.getDataInicio())) {
            return false;
        }
        if (aviso.getDataFim() != null && referencia.isAfter(aviso.getDataFim())) {
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
