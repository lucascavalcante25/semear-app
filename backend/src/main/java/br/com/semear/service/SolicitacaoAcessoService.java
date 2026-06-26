package br.com.semear.service;

import br.com.semear.domain.Igreja;
import br.com.semear.domain.SolicitacaoAcesso;
import br.com.semear.domain.User;
import br.com.semear.domain.enumeration.StatusIgreja;
import br.com.semear.domain.enumeration.StatusSolicitacaoAcesso;
import br.com.semear.domain.enumeration.Tema;
import br.com.semear.repository.IgrejaRepository;
import br.com.semear.repository.SolicitacaoAcessoRepository;
import br.com.semear.repository.UserRepository;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.service.dto.AdminUserDTO;
import br.com.semear.service.dto.SolicitacaoAcessoDTO;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class SolicitacaoAcessoService {

    private static final String ENTITY = "solicitacaoAcesso";

    private final SolicitacaoAcessoRepository solicitacaoAcessoRepository;
    private final IgrejaRepository igrejaRepository;
    private final UserService userService;
    private final UserRepository userRepository;
    private final MailService mailService;
    private final AssinaturaIgrejaService assinaturaIgrejaService;

    public SolicitacaoAcessoService(
        SolicitacaoAcessoRepository solicitacaoAcessoRepository,
        IgrejaRepository igrejaRepository,
        UserService userService,
        UserRepository userRepository,
        MailService mailService,
        AssinaturaIgrejaService assinaturaIgrejaService
    ) {
        this.solicitacaoAcessoRepository = solicitacaoAcessoRepository;
        this.igrejaRepository = igrejaRepository;
        this.userService = userService;
        this.userRepository = userRepository;
        this.mailService = mailService;
        this.assinaturaIgrejaService = assinaturaIgrejaService;
    }

    public SolicitacaoAcessoDTO criarPublica(SolicitacaoAcessoDTO dto) {
        if (dto.getNomeSolicitante() == null || dto.getNomeSolicitante().isBlank()) {
            throw new BadRequestAlertException("Nome obrigatório", ENTITY, "nomeobrigatorio");
        }
        if (dto.getCpf() == null || dto.getCpf().isBlank()) {
            throw new BadRequestAlertException("CPF obrigatório", ENTITY, "cpfobrigatorio");
        }
        if (dto.getEmail() == null || dto.getEmail().isBlank()) {
            throw new BadRequestAlertException("E-mail obrigatório", ENTITY, "emailobrigatorio");
        }
        if (dto.getTelefone() == null || dto.getTelefone().isBlank()) {
            throw new BadRequestAlertException("Telefone obrigatório", ENTITY, "telefoneobrigatorio");
        }
        if (dto.getNomeContatoEmergencia() == null || dto.getNomeContatoEmergencia().isBlank()) {
            throw new BadRequestAlertException("Contato de emergência obrigatório", ENTITY, "emergenciaobrigatoria");
        }
        if (dto.getDataNascimento() == null) {
            throw new BadRequestAlertException("Data de nascimento obrigatória", ENTITY, "nascimentoobrigatorio");
        }
        if (dto.getSexo() == null) {
            throw new BadRequestAlertException("Sexo obrigatório", ENTITY, "sexoobrigatorio");
        }
        if (dto.getSenha() == null || dto.getSenha().length() < 6) {
            throw new BadRequestAlertException("Senha deve ter ao menos 6 caracteres", ENTITY, "senhainvalida");
        }
        if (dto.getNomeIgreja() == null || dto.getNomeIgreja().isBlank()) {
            throw new BadRequestAlertException("Nome da igreja obrigatório", ENTITY, "igrejaobrigatoria");
        }
        if (dto.getCidade() == null || dto.getCidade().isBlank()) {
            throw new BadRequestAlertException("Cidade da igreja obrigatória", ENTITY, "cidadeobrigatoria");
        }
        if (dto.getEstado() == null || dto.getEstado().isBlank()) {
            throw new BadRequestAlertException("Estado da igreja obrigatório", ENTITY, "estadoobrigatorio");
        }

        String cpf = apenasDigitos(dto.getCpf());
        if (cpf.length() != 11) {
            throw new BadRequestAlertException("CPF inválido", ENTITY, "cpfinvalido");
        }
        String email = dto.getEmail().trim().toLowerCase();
        String telefone = apenasDigitos(dto.getTelefone());
        if (telefone.length() < 10 || telefone.length() > 11) {
            throw new BadRequestAlertException("Telefone inválido", ENTITY, "telefoneinvalido");
        }

        String cnpj = dto.getCnpjIgreja() != null ? apenasDigitos(dto.getCnpjIgreja()) : null;
        if (cnpj != null && cnpj.isBlank()) {
            cnpj = null;
        }
        if (cnpj != null && cnpj.length() != 14) {
            throw new BadRequestAlertException("CNPJ inválido", ENTITY, "cnpjinvalido");
        }

        if (userRepository.findOneByLogin(cpf).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe um usuário com este CPF.");
        }
        if (solicitacaoAcessoRepository.existsByEmailIgnoreCaseAndStatus(email, StatusSolicitacaoAcesso.PENDENTE)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe uma solicitação para este e-mail.");
        }
        if (solicitacaoAcessoRepository.existsByCpfAndStatus(cpf, StatusSolicitacaoAcesso.PENDENTE)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe uma solicitação para este CPF.");
        }
        if (cnpj != null && solicitacaoAcessoRepository.existsByCnpjIgrejaAndStatus(cnpj, StatusSolicitacaoAcesso.PENDENTE)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe uma solicitação para este CNPJ.");
        }

        SolicitacaoAcesso s = new SolicitacaoAcesso();
        s.setNomeSolicitante(dto.getNomeSolicitante().trim());
        s.setCpf(cpf);
        s.setEmail(email);
        s.setTelefone(telefone);
        s.setTelefoneSecundario(trimDigitosOrNull(dto.getTelefoneSecundario()));
        s.setTelefoneEmergencia(trimDigitosOrNull(dto.getTelefoneEmergencia()));
        s.setNomeContatoEmergencia(dto.getNomeContatoEmergencia().trim());
        s.setDataNascimento(dto.getDataNascimento());
        s.setSexo(dto.getSexo());
        s.setSenha(dto.getSenha());
        s.setCepPessoal(limparCep(dto.getCepPessoal()));
        s.setEnderecoPessoal(trimOrNull(dto.getEnderecoPessoal()));
        s.setNumeroPessoal(trimOrNull(dto.getNumeroPessoal()));
        s.setComplementoPessoal(trimOrNull(dto.getComplementoPessoal()));
        s.setBairroPessoal(trimOrNull(dto.getBairroPessoal()));
        s.setCidadePessoal(trimOrNull(dto.getCidadePessoal()));
        s.setEstadoPessoal(trimOrNull(dto.getEstadoPessoal()) != null ? dto.getEstadoPessoal().trim().toUpperCase() : null);
        s.setNomeIgreja(dto.getNomeIgreja().trim());
        s.setCnpjIgreja(cnpj);
        s.setCep(limparCep(dto.getCep()));
        s.setEndereco(trimOrNull(dto.getEndereco()));
        s.setNumero(trimOrNull(dto.getNumero()));
        s.setComplemento(trimOrNull(dto.getComplemento()));
        s.setBairro(trimOrNull(dto.getBairro()));
        s.setQuantidadeMembros(dto.getQuantidadeMembros());
        s.setCidade(dto.getCidade().trim());
        s.setEstado(dto.getEstado().trim().toUpperCase());
        s.setMensagem(trimOrNull(dto.getMensagem()));
        s.setStatus(StatusSolicitacaoAcesso.PENDENTE);
        s.setDataSolicitacao(Instant.now());
        SolicitacaoAcesso salva = solicitacaoAcessoRepository.save(s);
        mailService.sendSolicitacaoRecebidaEmail(email, s.getNomeSolicitante(), s.getNomeIgreja());
        return toDto(salva);
    }

    @Transactional(readOnly = true)
    public List<SolicitacaoAcessoDTO> listar(StatusSolicitacaoAcesso status) {
        if (status == null) {
            return solicitacaoAcessoRepository.findAll().stream().map(this::toDto).toList();
        }
        return solicitacaoAcessoRepository.findAllByStatusOrderByDataSolicitacaoDesc(status).stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public Optional<SolicitacaoAcessoDTO> findOne(Long id) {
        return solicitacaoAcessoRepository.findById(id).map(this::toDto);
    }

    public SolicitacaoAcessoDTO aprovar(Long id, String observacaoAdmin) {
        SolicitacaoAcesso s = solicitacaoAcessoRepository
            .findById(id)
            .orElseThrow(() -> new BadRequestAlertException("Solicitação não encontrada", ENTITY, "idnotfound"));
        if (s.getStatus() != StatusSolicitacaoAcesso.PENDENTE) {
            throw new BadRequestAlertException("Solicitação já analisada", ENTITY, "jaanalisada");
        }

        Igreja igreja = new Igreja();
        igreja.setNome(s.getNomeIgreja());
        igreja.setNomeFantasia(s.getNomeIgreja());
        igreja.setCnpj(s.getCnpjIgreja());
        igreja.setEmail(s.getEmail());
        igreja.setTelefone(s.getTelefone());
        igreja.setCep(s.getCep());
        igreja.setEndereco(s.getEndereco());
        igreja.setNumero(s.getNumero());
        igreja.setComplemento(s.getComplemento());
        igreja.setBairro(s.getBairro());
        igreja.setCidade(s.getCidade());
        igreja.setEstado(s.getEstado());
        igreja.setStatus(StatusIgreja.EM_TESTE);
        igreja.setTemaPreferido(Tema.SISTEMA);
        igreja.setCorPrimaria("#5a7a3a");
        igreja.setCorSecundaria("#1f4d7a");
        igreja.setDataCadastro(Instant.now());
        igreja = igrejaRepository.save(igreja);

        if (s.getCpf() == null || s.getCpf().isBlank()) {
            throw new BadRequestAlertException("Solicitação sem CPF do administrador", ENTITY, "cpfobrigatorio");
        }
        if (s.getSenha() == null || s.getSenha().isBlank()) {
            throw new BadRequestAlertException("Solicitação sem senha do administrador", ENTITY, "senhaobrigatoria");
        }

        String[] partes = s.getNomeSolicitante().trim().split(" ", 2);
        AdminUserDTO adminDto = new AdminUserDTO();
        adminDto.setLogin(s.getCpf());
        adminDto.setEmail(s.getEmail());
        adminDto.setFirstName(partes[0]);
        adminDto.setLastName(partes.length > 1 ? partes[1] : "");
        adminDto.setPhone(s.getTelefone());
        adminDto.setPhoneSecondary(s.getTelefoneSecundario());
        adminDto.setPhoneEmergency(s.getTelefoneEmergencia());
        adminDto.setNomeContatoEmergencia(s.getNomeContatoEmergencia());
        adminDto.setLogradouro(s.getEnderecoPessoal());
        adminDto.setNumero(s.getNumeroPessoal());
        adminDto.setComplemento(s.getComplementoPessoal());
        adminDto.setBairro(s.getBairroPessoal());
        adminDto.setCidade(s.getCidadePessoal());
        adminDto.setEstado(s.getEstadoPessoal());
        adminDto.setCep(s.getCepPessoal());
        adminDto.setBirthDate(s.getDataNascimento());
        adminDto.setSexo(s.getSexo());
        adminDto.setAuthorities(Set.of(AuthoritiesConstants.ADMIN_IGREJA, AuthoritiesConstants.USER));
        adminDto.setModules(
            new LinkedHashSet<>(
                List.of(
                    "dashboard:WRITE",
                    "biblia:WRITE",
                    "devocionais:WRITE",
                    "louvores:WRITE",
                    "membros:WRITE",
                    "visitantes:WRITE",
                    "comunicados:WRITE",
                    "financeiro:WRITE",
                    "oracao:WRITE",
                    "aprovar-pre-cadastros:WRITE",
                    "configuracoes:WRITE"
                )
            )
        );
        User admin = userService.createUserFromPreCadastro(adminDto, s.getSenha());
        admin.setIgreja(igreja);
        userRepository.save(admin);

        s.setStatus(StatusSolicitacaoAcesso.APROVADA);
        s.setDataAnalise(Instant.now());
        s.setObservacaoAdmin(observacaoAdmin != null ? observacaoAdmin : "Aprovada. Acesso liberado com a senha escolhida no cadastro.");
        s.setIgrejaCriada(igreja);
        assinaturaIgrejaService.iniciarTesteGratis(igreja, s.getNomeSolicitante());
        SolicitacaoAcessoDTO resultado = toDto(solicitacaoAcessoRepository.save(s));
        mailService.sendAcessoPlataformaAprovadoEmail(s.getEmail(), igreja.getNome(), s.getCpf());
        return resultado;
    }

    public SolicitacaoAcessoDTO rejeitar(Long id, String observacaoAdmin) {
        SolicitacaoAcesso s = solicitacaoAcessoRepository
            .findById(id)
            .orElseThrow(() -> new BadRequestAlertException("Solicitação não encontrada", ENTITY, "idnotfound"));
        if (s.getStatus() != StatusSolicitacaoAcesso.PENDENTE) {
            throw new BadRequestAlertException("Solicitação já analisada", ENTITY, "jaanalisada");
        }
        s.setStatus(StatusSolicitacaoAcesso.REJEITADA);
        s.setDataAnalise(Instant.now());
        s.setObservacaoAdmin(observacaoAdmin);
        SolicitacaoAcessoDTO resultado = toDto(solicitacaoAcessoRepository.save(s));
        mailService.sendSolicitacaoRejeitadaEmail(s.getEmail(), s.getNomeIgreja(), observacaoAdmin);
        return resultado;
    }

    private SolicitacaoAcessoDTO toDto(SolicitacaoAcesso s) {
        SolicitacaoAcessoDTO dto = new SolicitacaoAcessoDTO();
        dto.setId(s.getId());
        dto.setNomeSolicitante(s.getNomeSolicitante());
        dto.setCpf(s.getCpf());
        dto.setEmail(s.getEmail());
        dto.setTelefone(s.getTelefone());
        dto.setTelefoneSecundario(s.getTelefoneSecundario());
        dto.setTelefoneEmergencia(s.getTelefoneEmergencia());
        dto.setNomeContatoEmergencia(s.getNomeContatoEmergencia());
        dto.setDataNascimento(s.getDataNascimento());
        dto.setSexo(s.getSexo());
        dto.setCepPessoal(s.getCepPessoal());
        dto.setEnderecoPessoal(s.getEnderecoPessoal());
        dto.setNumeroPessoal(s.getNumeroPessoal());
        dto.setComplementoPessoal(s.getComplementoPessoal());
        dto.setBairroPessoal(s.getBairroPessoal());
        dto.setCidadePessoal(s.getCidadePessoal());
        dto.setEstadoPessoal(s.getEstadoPessoal());
        dto.setNomeIgreja(s.getNomeIgreja());
        dto.setCnpjIgreja(s.getCnpjIgreja());
        dto.setCep(s.getCep());
        dto.setEndereco(s.getEndereco());
        dto.setNumero(s.getNumero());
        dto.setComplemento(s.getComplemento());
        dto.setBairro(s.getBairro());
        dto.setQuantidadeMembros(s.getQuantidadeMembros());
        dto.setCidade(s.getCidade());
        dto.setEstado(s.getEstado());
        dto.setMensagem(s.getMensagem());
        dto.setStatus(s.getStatus());
        dto.setDataSolicitacao(s.getDataSolicitacao());
        dto.setDataAnalise(s.getDataAnalise());
        dto.setObservacaoAdmin(s.getObservacaoAdmin());
        dto.setIgrejaCriadaId(s.getIgrejaCriada() != null ? s.getIgrejaCriada().getId() : null);
        return dto;
    }

    private static String apenasDigitos(String value) {
        if (value == null) return "";
        return value.replaceAll("\\D", "");
    }

    private static String limparCep(String cep) {
        String digits = apenasDigitos(cep);
        return digits.isBlank() ? null : digits;
    }

    private static String trimOrNull(String value) {
        if (value == null) return null;
        String t = value.trim();
        return t.isBlank() ? null : t;
    }

    private static String trimDigitosOrNull(String value) {
        String digits = apenasDigitos(value);
        return digits.isBlank() ? null : digits;
    }
}
