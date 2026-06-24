package br.com.semear.service;

import br.com.semear.domain.Departamento;
import br.com.semear.domain.DepartamentoMembro;
import br.com.semear.domain.User;
import br.com.semear.repository.DepartamentoMembroRepository;
import br.com.semear.repository.DepartamentoRepository;
import br.com.semear.repository.UserRepository;
import br.com.semear.service.dto.DepartamentoDTO;
import br.com.semear.service.dto.DepartamentoMembroDTO;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DepartamentoService {

    private static final String ENTITY = "departamento";

    private final DepartamentoRepository departamentoRepository;
    private final DepartamentoMembroRepository departamentoMembroRepository;
    private final UserRepository userRepository;
    private final TenantService tenantService;

    public DepartamentoService(
        DepartamentoRepository departamentoRepository,
        DepartamentoMembroRepository departamentoMembroRepository,
        UserRepository userRepository,
        TenantService tenantService
    ) {
        this.departamentoRepository = departamentoRepository;
        this.departamentoMembroRepository = departamentoMembroRepository;
        this.userRepository = userRepository;
        this.tenantService = tenantService;
    }

    @Transactional(readOnly = true)
    public List<DepartamentoDTO> listar() {
        return departamentoRepository
            .findByIgrejaIdOrderByNomeAsc(tenantService.getIgrejaIdAtual())
            .stream()
            .map(this::toDtoComMembros)
            .toList();
    }

    @Transactional(readOnly = true)
    public Optional<DepartamentoDTO> obter(Long id) {
        return obterEntidade(id).map(this::toDtoComMembros);
    }

    public DepartamentoDTO criar(DepartamentoDTO dto) {
        validarDados(dto);
        Departamento departamento = new Departamento();
        departamento.setIgreja(tenantService.resolverIgrejaParaCriacao());
        departamento.setNome(dto.getNome().trim());
        departamento.setDescricao(dto.getDescricao());
        if (dto.getCodigo() != null) {
            departamento.setCodigo(dto.getCodigo());
        } else if (departamento.getCodigo() == null) {
            departamento.setCodigo(DepartamentoOrientacoesPadrao.inferirCodigoPorNome(dto.getNome()));
        }
        if (dto.getOrientacoesServico() != null) {
            departamento.setOrientacoesServico(dto.getOrientacoesServico());
        } else if (
            departamento.getOrientacoesServico() == null &&
            departamento.getCodigo() != null &&
            DepartamentoOrientacoesPadrao.sugerirPorCodigo(departamento.getCodigo()) != null
        ) {
            departamento.setOrientacoesServico(DepartamentoOrientacoesPadrao.sugerirPorCodigo(departamento.getCodigo()));
        }
        departamento.setAtivo(dto.getAtivo() == null ? true : dto.getAtivo());
        aplicarLider(departamento, dto);
        departamento.setCriadoEm(Instant.now());
        return toDtoComMembros(departamentoRepository.save(departamento));
    }

    public DepartamentoDTO atualizar(Long id, DepartamentoDTO dto) {
        validarDados(dto);
        Departamento departamento = obterEntidade(id).orElseThrow(this::naoEncontrado);
        departamento.setNome(dto.getNome().trim());
        departamento.setDescricao(dto.getDescricao());
        if (dto.getCodigo() != null) {
            departamento.setCodigo(dto.getCodigo());
        }
        if (dto.getOrientacoesServico() != null) {
            departamento.setOrientacoesServico(dto.getOrientacoesServico());
        }
        if (dto.getAtivo() != null) {
            departamento.setAtivo(dto.getAtivo());
        }
        aplicarLider(departamento, dto);
        return toDtoComMembros(departamentoRepository.save(departamento));
    }

    public void excluir(Long id) {
        Departamento departamento = obterEntidade(id).orElseThrow(this::naoEncontrado);
        departamento.setAtivo(false);
        departamentoRepository.save(departamento);
    }

    public DepartamentoMembroDTO adicionarMembro(Long id, DepartamentoMembroDTO dto) {
        if (dto.getUserId() == null) {
            throw new BadRequestAlertException("Usuário é obrigatório", ENTITY, "userobrigatorio");
        }
        Departamento departamento = obterEntidade(id).orElseThrow(this::naoEncontrado);
        if (departamentoMembroRepository.findByDepartamentoIdAndUserId(id, dto.getUserId()).isPresent()) {
            throw new BadRequestAlertException("Usuário já vinculado ao departamento", ENTITY, "membroexistente");
        }

        User user = userRepository.findById(dto.getUserId()).orElseThrow(this::naoEncontrado);
        tenantService.validarMesmaIgreja(user.getIgreja());

        DepartamentoMembro membro = new DepartamentoMembro();
        membro.setDepartamento(departamento);
        membro.setUser(user);
        membro.setFuncao(dto.getFuncao());
        return toMembroDto(departamentoMembroRepository.save(membro));
    }

    public void removerMembro(Long id, Long userId) {
        obterEntidade(id).orElseThrow(this::naoEncontrado);
        departamentoMembroRepository.deleteByDepartamentoIdAndUserId(id, userId);
    }

    private Optional<Departamento> obterEntidade(Long id) {
        return departamentoRepository.findByIdAndIgrejaId(id, tenantService.getIgrejaIdAtual());
    }

    private void validarDados(DepartamentoDTO dto) {
        if (dto.getNome() == null || dto.getNome().isBlank()) {
            throw new BadRequestAlertException("Nome do departamento é obrigatório", ENTITY, "nomeobrigatorio");
        }
    }

    private void aplicarLider(Departamento departamento, DepartamentoDTO dto) {
        if (dto.getLiderId() == null) {
            departamento.setLider(null);
            return;
        }
        User lider = userRepository.findById(dto.getLiderId()).orElseThrow(this::naoEncontrado);
        tenantService.validarMesmaIgreja(lider.getIgreja());
        departamento.setLider(lider);
    }

    private DepartamentoDTO toDtoComMembros(Departamento entity) {
        DepartamentoDTO dto = new DepartamentoDTO();
        dto.setId(entity.getId());
        if (entity.getIgreja() != null) {
            dto.setIgrejaId(entity.getIgreja().getId());
        }
        dto.setNome(entity.getNome());
        dto.setDescricao(entity.getDescricao());
        dto.setCodigo(entity.getCodigo());
        dto.setOrientacoesServico(entity.getOrientacoesServico());
        dto.setAtivo(entity.getAtivo());
        dto.setCriadoEm(entity.getCriadoEm());
        if (entity.getLider() != null) {
            dto.setLiderId(entity.getLider().getId());
            dto.setLiderNome(montarNome(entity.getLider()));
        }
        dto.setMembros(departamentoMembroRepository.findByDepartamentoId(entity.getId()).stream().map(this::toMembroDto).toList());
        return dto;
    }

    private DepartamentoMembroDTO toMembroDto(DepartamentoMembro entity) {
        DepartamentoMembroDTO dto = new DepartamentoMembroDTO();
        dto.setId(entity.getId());
        if (entity.getDepartamento() != null) {
            dto.setDepartamentoId(entity.getDepartamento().getId());
        }
        if (entity.getUser() != null) {
            dto.setUserId(entity.getUser().getId());
            dto.setUserNome(montarNome(entity.getUser()));
        }
        dto.setFuncao(entity.getFuncao());
        return dto;
    }

    private String montarNome(User user) {
        String nome = (Objects.toString(user.getFirstName(), "") + " " + Objects.toString(user.getLastName(), "")).trim();
        return nome.isBlank() ? user.getLogin() : nome;
    }

    private BadRequestAlertException naoEncontrado() {
        return new BadRequestAlertException("Departamento não encontrado", ENTITY, "naoencontrado");
    }
}
