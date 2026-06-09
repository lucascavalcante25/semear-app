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
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.security.RandomUtil;

@Service
@Transactional
public class SolicitacaoAcessoService {

    private static final String ENTITY = "solicitacaoAcesso";

    private final SolicitacaoAcessoRepository solicitacaoAcessoRepository;
    private final IgrejaRepository igrejaRepository;
    private final UserService userService;
    private final UserRepository userRepository;
    private final MailService mailService;

    public SolicitacaoAcessoService(
        SolicitacaoAcessoRepository solicitacaoAcessoRepository,
        IgrejaRepository igrejaRepository,
        UserService userService,
        UserRepository userRepository,
        MailService mailService
    ) {
        this.solicitacaoAcessoRepository = solicitacaoAcessoRepository;
        this.igrejaRepository = igrejaRepository;
        this.userService = userService;
        this.userRepository = userRepository;
        this.mailService = mailService;
    }

    public SolicitacaoAcessoDTO criarPublica(SolicitacaoAcessoDTO dto) {
        if (dto.getNomeSolicitante() == null || dto.getNomeSolicitante().isBlank()) {
            throw new BadRequestAlertException("Nome obrigatório", ENTITY, "nomeobrigatorio");
        }
        if (dto.getEmail() == null || dto.getEmail().isBlank()) {
            throw new BadRequestAlertException("E-mail obrigatório", ENTITY, "emailobrigatorio");
        }
        if (dto.getNomeIgreja() == null || dto.getNomeIgreja().isBlank()) {
            throw new BadRequestAlertException("Nome da igreja obrigatório", ENTITY, "igrejaobrigatoria");
        }
        SolicitacaoAcesso s = new SolicitacaoAcesso();
        s.setNomeSolicitante(dto.getNomeSolicitante().trim());
        s.setEmail(dto.getEmail().trim().toLowerCase());
        s.setTelefone(dto.getTelefone());
        s.setNomeIgreja(dto.getNomeIgreja().trim());
        s.setCnpjIgreja(dto.getCnpjIgreja());
        s.setCidade(dto.getCidade());
        s.setEstado(dto.getEstado());
        s.setMensagem(dto.getMensagem());
        s.setStatus(StatusSolicitacaoAcesso.PENDENTE);
        s.setDataSolicitacao(Instant.now());
        return toDto(solicitacaoAcessoRepository.save(s));
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
        igreja.setCidade(s.getCidade());
        igreja.setEstado(s.getEstado());
        igreja.setStatus(StatusIgreja.EM_TESTE);
        igreja.setTemaPreferido(Tema.SISTEMA);
        igreja.setCorPrimaria("#5a7a3a");
        igreja.setCorSecundaria("#1f4d7a");
        igreja.setDataCadastro(Instant.now());
        igreja = igrejaRepository.save(igreja);

        String senhaTemp = RandomUtil.generatePassword();
        String[] partes = s.getNomeSolicitante().trim().split(" ", 2);
        AdminUserDTO adminDto = new AdminUserDTO();
        adminDto.setLogin(s.getEmail());
        adminDto.setEmail(s.getEmail());
        adminDto.setFirstName(partes[0]);
        adminDto.setLastName(partes.length > 1 ? partes[1] : "");
        adminDto.setAuthorities(Set.of(AuthoritiesConstants.ADMIN_IGREJA, AuthoritiesConstants.USER));
        User admin = userService.createUserFromPreCadastro(adminDto, senhaTemp);
        admin.setIgreja(igreja);
        userRepository.save(admin);

        s.setStatus(StatusSolicitacaoAcesso.APROVADA);
        s.setDataAnalise(Instant.now());
        s.setObservacaoAdmin(observacaoAdmin != null ? observacaoAdmin : "Aprovada. Senha temporária enviada por e-mail.");
        s.setIgrejaCriada(igreja);
        SolicitacaoAcessoDTO resultado = toDto(solicitacaoAcessoRepository.save(s));
        mailService.sendAcessoPlataformaEmail(s.getEmail(), igreja.getNome(), senhaTemp);
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
        return toDto(solicitacaoAcessoRepository.save(s));
    }

    private SolicitacaoAcessoDTO toDto(SolicitacaoAcesso s) {
        SolicitacaoAcessoDTO dto = new SolicitacaoAcessoDTO();
        dto.setId(s.getId());
        dto.setNomeSolicitante(s.getNomeSolicitante());
        dto.setEmail(s.getEmail());
        dto.setTelefone(s.getTelefone());
        dto.setNomeIgreja(s.getNomeIgreja());
        dto.setCnpjIgreja(s.getCnpjIgreja());
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
}
