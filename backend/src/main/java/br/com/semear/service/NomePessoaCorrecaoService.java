package br.com.semear.service;

import br.com.semear.domain.PreCadastro;
import br.com.semear.domain.User;
import br.com.semear.repository.PreCadastroRepository;
import br.com.semear.repository.UserRepository;
import br.com.semear.service.util.NomePessoaUtils;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NomePessoaCorrecaoService {

    private static final Logger LOG = LoggerFactory.getLogger(NomePessoaCorrecaoService.class);

    private final UserRepository userRepository;
    private final PreCadastroRepository preCadastroRepository;
    private final CacheManager cacheManager;

    public NomePessoaCorrecaoService(
        UserRepository userRepository,
        PreCadastroRepository preCadastroRepository,
        CacheManager cacheManager
    ) {
        this.userRepository = userRepository;
        this.preCadastroRepository = preCadastroRepository;
        this.cacheManager = cacheManager;
    }

    @Transactional
    public int corrigirUsuariosExistentes() {
        int alterados = 0;
        for (User user : userRepository.findAll()) {
            if (aplicarNormalizacao(user)) {
                userRepository.save(user);
                alterados++;
            }
        }
        return alterados;
    }

    @Transactional
    public int corrigirPreCadastrosExistentes() {
        int alterados = 0;
        for (PreCadastro preCadastro : preCadastroRepository.findAll()) {
            if (aplicarNormalizacao(preCadastro)) {
                preCadastroRepository.save(preCadastro);
                alterados++;
            }
        }
        return alterados;
    }

    private boolean aplicarNormalizacao(User user) {
        String firstName = NomePessoaUtils.formatarNome(user.getFirstName());
        String lastName = NomePessoaUtils.formatarNome(user.getLastName());
        String contato = NomePessoaUtils.formatarNome(user.getNomeContatoEmergencia());
        boolean mudou =
            !Objects.equals(firstName, user.getFirstName()) ||
            !Objects.equals(lastName, user.getLastName()) ||
            !Objects.equals(contato, user.getNomeContatoEmergencia());
        if (mudou) {
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setNomeContatoEmergencia(contato);
            limparCacheUsuario(user);
        }
        return mudou;
    }

    private void limparCacheUsuario(User user) {
        Objects.requireNonNull(cacheManager.getCache(UserRepository.USERS_BY_LOGIN_CACHE)).evictIfPresent(user.getLogin());
        if (user.getEmail() != null) {
            Objects.requireNonNull(cacheManager.getCache(UserRepository.USERS_BY_EMAIL_CACHE)).evictIfPresent(user.getEmail());
        }
    }

    private boolean aplicarNormalizacao(PreCadastro preCadastro) {
        String nome = NomePessoaUtils.formatarNome(preCadastro.getNomeCompleto());
        String contato = NomePessoaUtils.formatarNome(preCadastro.getNomeContatoEmergencia());
        boolean mudou =
            !Objects.equals(nome, preCadastro.getNomeCompleto()) ||
            !Objects.equals(contato, preCadastro.getNomeContatoEmergencia());
        if (mudou) {
            preCadastro.setNomeCompleto(nome);
            preCadastro.setNomeContatoEmergencia(contato);
        }
        return mudou;
    }
}
