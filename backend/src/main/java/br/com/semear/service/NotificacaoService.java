package br.com.semear.service;

import br.com.semear.domain.Aviso;
import br.com.semear.domain.User;
import br.com.semear.domain.UsuarioNotificacaoVista;
import br.com.semear.repository.AvisoRepository;
import br.com.semear.repository.UserRepository;
import br.com.semear.repository.UsuarioNotificacaoVistaRepository;
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

    private final AvisoRepository avisoRepository;
    private final UserRepository userRepository;
    private final UsuarioNotificacaoVistaRepository vistaRepository;

    public NotificacaoService(
        AvisoRepository avisoRepository,
        UserRepository userRepository,
        UsuarioNotificacaoVistaRepository vistaRepository
    ) {
        this.avisoRepository = avisoRepository;
        this.userRepository = userRepository;
        this.vistaRepository = vistaRepository;
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

        List<NotificacaoItem> itens = new ArrayList<>();

        List<Aviso> avisos = avisoRepository.findAllByAtivoIsTrue(PageRequest.of(0, 20)).getContent();
        for (Aviso a : avisos) {
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

        LocalDate hoje = LocalDate.now();
        List<User> aniversariantes = userRepository.findAllByBirthDateIsNotNullAndActivatedIsTrue().stream()
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

        return itens;
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
}
