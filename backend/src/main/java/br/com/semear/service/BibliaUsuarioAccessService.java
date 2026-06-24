package br.com.semear.service;

import br.com.semear.domain.User;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import java.util.Optional;
import java.util.function.Function;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class BibliaUsuarioAccessService {

    private static final String ENTITY = "bibliaUsuario";

    private final TenantService tenantService;

    public BibliaUsuarioAccessService(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    public User getUsuarioAtual() {
        return tenantService.getUsuarioAtual();
    }

    public void validarPropriedade(User dono) {
        if (dono == null || !getUsuarioAtual().getId().equals(dono.getId())) {
            throw new BadRequestAlertException("Acesso negado ao recurso de outro usuário", ENTITY, "acessonegado");
        }
    }

    public <T> T validarPropriedadeOuFalhar(Optional<T> entidade, Function<T, User> extrairDono) {
        T valor = entidade.orElseThrow(() -> new BadRequestAlertException("Recurso não encontrado", ENTITY, "naoencontrado"));
        validarPropriedade(extrairDono.apply(valor));
        return valor;
    }

    public <T> Optional<T> filtrarPropriedade(Optional<T> entidade, Function<T, User> extrairDono) {
        return entidade.filter(item -> {
            User dono = extrairDono.apply(item);
            return dono != null && getUsuarioAtual().getId().equals(dono.getId());
        });
    }
}
