package br.com.semear.service;

import br.com.semear.domain.AcompanhamentoPastoral;
import br.com.semear.domain.User;
import br.com.semear.repository.AcompanhamentoPastoralRepository;
import br.com.semear.repository.UserRepository;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.service.dto.AcompanhamentoPastoralDTO;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AcompanhamentoPastoralService {

    private static final String ENTITY = "acompanhamentoPastoral";

    private final AcompanhamentoPastoralRepository repository;
    private final UserRepository userRepository;
    private final TenantService tenantService;

    public AcompanhamentoPastoralService(
        AcompanhamentoPastoralRepository repository,
        UserRepository userRepository,
        TenantService tenantService
    ) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.tenantService = tenantService;
    }

    @Transactional(readOnly = true)
    public List<AcompanhamentoPastoralDTO> listar() {
        User usuario = tenantService.getUsuarioAtual();
        Long igrejaId = tenantService.getIgrejaIdAtual();
        if (ehLideranca(usuario)) {
            return repository.findByIgrejaIdOrderByDataContatoDesc(igrejaId).stream().map(this::toDto).toList();
        }
        return repository
            .findByIgrejaIdAndMembroIdOrderByDataContatoDesc(igrejaId, usuario.getId())
            .stream()
            .filter(a -> Objects.equals(a.getResponsavel().getId(), usuario.getId()) || Objects.equals(a.getMembro().getId(), usuario.getId()))
            .map(this::toDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public Optional<AcompanhamentoPastoralDTO> obter(Long id) {
        return obterEntidade(id).map(this::toDto);
    }

    public AcompanhamentoPastoralDTO criar(AcompanhamentoPastoralDTO dto) {
        validarDados(dto);
        User usuario = tenantService.getUsuarioAtual();
        User membro = userRepository.findById(dto.getMembroId()).orElseThrow(() -> naoEncontrado());
        tenantService.validarMesmaIgreja(membro.getIgreja());
        User responsavel = dto.getResponsavelId() != null
            ? userRepository.findById(dto.getResponsavelId()).orElseThrow(() -> naoEncontrado())
            : usuario;
        tenantService.validarMesmaIgreja(responsavel.getIgreja());
        if (!ehLideranca(usuario) && !Objects.equals(responsavel.getId(), usuario.getId())) {
            throw acessoNegado();
        }

        AcompanhamentoPastoral entity = new AcompanhamentoPastoral();
        entity.setIgreja(tenantService.resolverIgrejaParaCriacao());
        entity.setMembro(membro);
        entity.setResponsavel(responsavel);
        entity.setTipo(dto.getTipo());
        entity.setObservacao(dto.getObservacao());
        entity.setDataContato(dto.getDataContato());
        entity.setDataRetorno(dto.getDataRetorno());
        entity.setCriadoEm(Instant.now());
        entity.setCriadoPor(usuario);
        return toDto(repository.save(entity));
    }

    public AcompanhamentoPastoralDTO atualizar(Long id, AcompanhamentoPastoralDTO dto) {
        validarDados(dto);
        AcompanhamentoPastoral entity = obterEntidade(id).orElseThrow(() -> naoEncontrado());
        validarAcessoRegistro(entity);
        if (dto.getResponsavelId() != null && ehLideranca(tenantService.getUsuarioAtual())) {
            User responsavel = userRepository.findById(dto.getResponsavelId()).orElseThrow(() -> naoEncontrado());
            tenantService.validarMesmaIgreja(responsavel.getIgreja());
            entity.setResponsavel(responsavel);
        }
        entity.setTipo(dto.getTipo());
        entity.setObservacao(dto.getObservacao());
        entity.setDataContato(dto.getDataContato());
        entity.setDataRetorno(dto.getDataRetorno());
        return toDto(repository.save(entity));
    }

    public void excluir(Long id) {
        AcompanhamentoPastoral entity = obterEntidade(id).orElseThrow(() -> naoEncontrado());
        validarAcessoRegistro(entity);
        repository.delete(entity);
    }

    private Optional<AcompanhamentoPastoral> obterEntidade(Long id) {
        return repository.findByIdAndIgrejaId(id, tenantService.getIgrejaIdAtual());
    }

    private void validarAcessoRegistro(AcompanhamentoPastoral entity) {
        User usuario = tenantService.getUsuarioAtual();
        if (ehLideranca(usuario)) {
            return;
        }
        if (
            Objects.equals(entity.getResponsavel().getId(), usuario.getId()) ||
            Objects.equals(entity.getMembro().getId(), usuario.getId())
        ) {
            return;
        }
        throw acessoNegado();
    }

    private void validarDados(AcompanhamentoPastoralDTO dto) {
        if (dto.getMembroId() == null || dto.getTipo() == null || dto.getDataContato() == null) {
            throw new BadRequestAlertException("Membro, tipo e data de contato são obrigatórios", ENTITY, "dadosobrigatorios");
        }
    }

    private boolean ehLideranca(User user) {
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

    private AcompanhamentoPastoralDTO toDto(AcompanhamentoPastoral e) {
        AcompanhamentoPastoralDTO dto = new AcompanhamentoPastoralDTO();
        dto.setId(e.getId());
        if (e.getIgreja() != null) dto.setIgrejaId(e.getIgreja().getId());
        if (e.getMembro() != null) {
            dto.setMembroId(e.getMembro().getId());
            dto.setMembroNome(montarNome(e.getMembro()));
        }
        if (e.getResponsavel() != null) {
            dto.setResponsavelId(e.getResponsavel().getId());
            dto.setResponsavelNome(montarNome(e.getResponsavel()));
        }
        dto.setTipo(e.getTipo());
        dto.setObservacao(e.getObservacao());
        dto.setDataContato(e.getDataContato());
        dto.setDataRetorno(e.getDataRetorno());
        dto.setCriadoEm(e.getCriadoEm());
        if (e.getCriadoPor() != null) dto.setCriadoPorId(e.getCriadoPor().getId());
        return dto;
    }

    private String montarNome(User u) {
        String nome = (Objects.toString(u.getFirstName(), "") + " " + Objects.toString(u.getLastName(), "")).trim();
        return nome.isBlank() ? u.getLogin() : nome;
    }

    private BadRequestAlertException naoEncontrado() {
        return new BadRequestAlertException("Registro não encontrado", ENTITY, "naoencontrado");
    }

    private BadRequestAlertException acessoNegado() {
        return new BadRequestAlertException("Acesso negado", ENTITY, "acessonegado");
    }
}
