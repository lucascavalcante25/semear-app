package br.com.semear.service;

import br.com.semear.domain.Endereco;
import br.com.semear.domain.PreCadastro;
import br.com.semear.domain.User;
import br.com.semear.domain.enumeration.PerfilAcesso;
import br.com.semear.repository.EnderecoRepository;
import br.com.semear.repository.PreCadastroRepository;
import br.com.semear.repository.UserRepository;
import br.com.semear.service.dto.AdminUserDTO;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service para aprovar pré-cadastros e criar usuários.
 */
@Service
public class PreCadastroService {

    private static final Logger LOG = LoggerFactory.getLogger(PreCadastroService.class);

    private final PreCadastroRepository preCadastroRepository;
    private final UserService userService;
    private final EnderecoRepository enderecoRepository;
    private final UserRepository userRepository;

    public PreCadastroService(
        PreCadastroRepository preCadastroRepository,
        UserService userService,
        EnderecoRepository enderecoRepository,
        UserRepository userRepository
    ) {
        this.preCadastroRepository = preCadastroRepository;
        this.userService = userService;
        this.enderecoRepository = enderecoRepository;
        this.userRepository = userRepository;
    }

    /**
     * Aprova um pré-cadastro e cria o usuário com a senha informada no cadastro.
     */
    @Transactional
    public PreCadastro aprovar(Long id, PerfilAcesso perfilAprovado, List<String> modules) {
        PreCadastro preCadastro = preCadastroRepository
            .findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Pré-cadastro não encontrado: " + id));

        preCadastro.setStatus(br.com.semear.domain.enumeration.StatusCadastro.APROVADO);
        preCadastro.setPerfilAprovado(perfilAprovado);
        preCadastro = preCadastroRepository.save(preCadastro);

        AdminUserDTO userDTO = new AdminUserDTO();
        userDTO.setLogin(preCadastro.getLogin());
        userDTO.setEmail(preCadastro.getEmail());
        String[] nomes = preCadastro.getNomeCompleto().trim().split("\\s+", 2);
        userDTO.setFirstName(nomes.length > 0 ? nomes[0] : preCadastro.getNomeCompleto());
        userDTO.setLastName(nomes.length > 1 ? nomes[1] : "");
        userDTO.setPhone(preCadastro.getTelefone());
        userDTO.setPhoneSecondary(preCadastro.getTelefoneSecundario());
        userDTO.setPhoneEmergency(preCadastro.getTelefoneEmergencia());
        userDTO.setNomeContatoEmergencia(preCadastro.getNomeContatoEmergencia());
        if (preCadastro.getEndereco() != null) {
            Endereco end = preCadastro.getEndereco();
            userDTO.setLogradouro(end.getLogradouro());
            userDTO.setNumero(end.getNumero());
            userDTO.setComplemento(end.getComplemento());
            userDTO.setBairro(end.getBairro());
            userDTO.setCidade(end.getCidade());
            userDTO.setEstado(end.getEstado());
            userDTO.setCep(end.getCep());
        }
        userDTO.setActivated(true);
        userDTO.setBirthDate(preCadastro.getDataNascimento());
        userDTO.setSexo(preCadastro.getSexo());
        userDTO.setAuthorities(Set.of("ROLE_" + perfilAprovado.name()));
        if (modules != null && !modules.isEmpty()) {
            userDTO.setModules(new LinkedHashSet<>(modules));
        }

        User user = userService.createUserFromPreCadastro(userDTO, preCadastro.getSenha());
        if (user.getBirthDate() == null && preCadastro.getDataNascimento() != null) {
            user.setBirthDate(preCadastro.getDataNascimento());
            userRepository.save(user);
        }
        LOG.debug("Usuário criado a partir do pré-cadastro {}: {}", id, user.getLogin());

        // Após aprovação e criação do usuário, remove o registro do pré-cadastro
        // para não bloquear novos envios por unicidade e manter a tabela apenas como fila.
        Long enderecoId = preCadastro.getEndereco() != null ? preCadastro.getEndereco().getId() : null;
        preCadastroRepository.delete(preCadastro);
        if (enderecoId != null) {
            enderecoRepository.deleteById(enderecoId);
        }

        return preCadastro;
    }
}
