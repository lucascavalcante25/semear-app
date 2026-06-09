package br.com.semear.service;

import br.com.semear.domain.Igreja;
import br.com.semear.domain.User;
import br.com.semear.repository.IgrejaRepository;
import br.com.semear.repository.UserRepository;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.security.SecurityUtils;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class TenantService {

    private final UserRepository userRepository;
    private final IgrejaRepository igrejaRepository;

    public TenantService(UserRepository userRepository, IgrejaRepository igrejaRepository) {
        this.userRepository = userRepository;
        this.igrejaRepository = igrejaRepository;
    }

    public boolean isSuperAdmin() {
        return SecurityUtils.hasCurrentUserAnyOfAuthorities(AuthoritiesConstants.SUPER_ADMIN);
    }

    public Igreja getIgrejaAtual() {
        if (isSuperAdmin()) {
            return igrejaRepository.findById(1L).orElseThrow(() -> new BadRequestAlertException("Igreja padrão não encontrada", "igreja", "naoencontrada"));
        }
        User user = getUsuarioAtual();
        if (user.getIgreja() != null) {
            return user.getIgreja();
        }
        return igrejaRepository.findById(1L).orElseThrow(() -> new BadRequestAlertException("Usuário sem igreja", "igreja", "semigreja"));
    }

    public Long getIgrejaIdAtual() {
        return getIgrejaAtual().getId();
    }

    public User getUsuarioAtual() {
        String login = SecurityUtils
            .getCurrentUserLogin()
            .orElseThrow(() -> new BadRequestAlertException("Não autenticado", "tenant", "naoautenticado"));
        return userRepository
            .findOneWithAuthoritiesByLogin(login)
            .orElseThrow(() -> new BadRequestAlertException("Usuário não encontrado", "tenant", "usuarionaoencontrado"));
    }

    public void validarMesmaIgreja(Igreja igreja) {
        if (isSuperAdmin() || igreja == null) {
            return;
        }
        if (!getIgrejaIdAtual().equals(igreja.getId())) {
            throw new BadRequestAlertException("Acesso negado ao recurso de outra igreja", "tenant", "acessonegado");
        }
    }

    public void validarMesmaIgreja(Long igrejaId) {
        if (isSuperAdmin() || igrejaId == null) {
            return;
        }
        if (!getIgrejaIdAtual().equals(igrejaId)) {
            throw new BadRequestAlertException("Acesso negado ao recurso de outra igreja", "tenant", "acessonegado");
        }
    }

    public Igreja resolverIgrejaParaCriacao() {
        return getIgrejaAtual();
    }
}
