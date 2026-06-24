package br.com.semear.service;

import br.com.semear.domain.Celula;
import br.com.semear.domain.CelulaMembro;
import br.com.semear.domain.User;
import br.com.semear.repository.CelulaMembroRepository;
import br.com.semear.repository.CelulaRepository;
import br.com.semear.repository.UserRepository;
import br.com.semear.service.dto.CelulaDTO;
import br.com.semear.service.dto.CelulaMembroDTO;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CelulaService {

    private static final String ENTITY = "celula";

    private final CelulaRepository celulaRepository;
    private final CelulaMembroRepository celulaMembroRepository;
    private final UserRepository userRepository;
    private final TenantService tenantService;

    public CelulaService(
        CelulaRepository celulaRepository,
        CelulaMembroRepository celulaMembroRepository,
        UserRepository userRepository,
        TenantService tenantService
    ) {
        this.celulaRepository = celulaRepository;
        this.celulaMembroRepository = celulaMembroRepository;
        this.userRepository = userRepository;
        this.tenantService = tenantService;
    }

    @Transactional(readOnly = true)
    public List<CelulaDTO> listar() {
        return celulaRepository.findByIgrejaIdOrderByNomeAsc(tenantService.getIgrejaIdAtual()).stream().map(this::toDtoComMembros).toList();
    }

    @Transactional(readOnly = true)
    public Optional<CelulaDTO> obter(Long id) {
        return obterEntidade(id).map(this::toDtoComMembros);
    }

    public CelulaDTO criar(CelulaDTO dto) {
        validarDados(dto);
        Celula celula = new Celula();
        celula.setIgreja(tenantService.resolverIgrejaParaCriacao());
        aplicarDados(celula, dto);
        Celula salva = celulaRepository.save(celula);
        sincronizarMembros(salva, dto.getMembros());
        return toDtoComMembros(salva);
    }

    public CelulaDTO atualizar(Long id, CelulaDTO dto) {
        validarDados(dto);
        Celula celula = obterEntidade(id).orElseThrow(this::naoEncontrado);
        aplicarDados(celula, dto);
        Celula salva = celulaRepository.save(celula);
        sincronizarMembros(salva, dto.getMembros());
        return toDtoComMembros(salva);
    }

    public void excluir(Long id) {
        Celula celula = obterEntidade(id).orElseThrow(this::naoEncontrado);
        celula.setAtivo(false);
        celulaRepository.save(celula);
    }

    public CelulaMembroDTO adicionarMembro(Long id, CelulaMembroDTO dto) {
        Celula celula = obterEntidade(id).orElseThrow(this::naoEncontrado);
        if (dto.getUserId() == null) {
            throw new BadRequestAlertException("Usuário é obrigatório", ENTITY, "userobrigatorio");
        }
        if (celulaMembroRepository.findByCelulaIdAndUserId(celula.getId(), dto.getUserId()).isPresent()) {
            throw new BadRequestAlertException("Usuário já está na célula", ENTITY, "membroexistente");
        }
        User user = userRepository.findById(dto.getUserId()).orElseThrow(this::naoEncontrado);
        tenantService.validarMesmaIgreja(user.getIgreja());
        CelulaMembro membro = new CelulaMembro();
        membro.setCelula(celula);
        membro.setUser(user);
        return toMembroDto(celulaMembroRepository.save(membro));
    }

    public void removerMembro(Long id, Long userId) {
        obterEntidade(id).orElseThrow(this::naoEncontrado);
        celulaMembroRepository.deleteByCelulaIdAndUserId(id, userId);
    }

    private void sincronizarMembros(Celula celula, List<CelulaMembroDTO> membros) {
        if (membros == null) {
            return;
        }
        celulaMembroRepository.findByCelulaId(celula.getId()).forEach(celulaMembroRepository::delete);
        for (CelulaMembroDTO membroDto : membros) {
            if (membroDto.getUserId() == null) {
                continue;
            }
            User user = userRepository.findById(membroDto.getUserId()).orElseThrow(this::naoEncontrado);
            tenantService.validarMesmaIgreja(user.getIgreja());
            CelulaMembro membro = new CelulaMembro();
            membro.setCelula(celula);
            membro.setUser(user);
            celulaMembroRepository.save(membro);
        }
    }

    private void aplicarDados(Celula celula, CelulaDTO dto) {
        celula.setNome(dto.getNome().trim());
        celula.setEndereco(dto.getEndereco());
        celula.setDiaSemana(dto.getDiaSemana());
        celula.setHorario(dto.getHorario());
        celula.setAtivo(dto.getAtivo() == null ? true : dto.getAtivo());

        celula.setLider(resolverUsuarioOpcional(dto.getLiderId()));
        celula.setAuxiliar(resolverUsuarioOpcional(dto.getAuxiliarId()));
    }

    private User resolverUsuarioOpcional(Long userId) {
        if (userId == null) {
            return null;
        }
        User user = userRepository.findById(userId).orElseThrow(this::naoEncontrado);
        tenantService.validarMesmaIgreja(user.getIgreja());
        return user;
    }

    private void validarDados(CelulaDTO dto) {
        if (dto.getNome() == null || dto.getNome().isBlank()) {
            throw new BadRequestAlertException("Nome da célula é obrigatório", ENTITY, "nomeobrigatorio");
        }
    }

    private Optional<Celula> obterEntidade(Long id) {
        return celulaRepository.findByIdAndIgrejaId(id, tenantService.getIgrejaIdAtual());
    }

    private CelulaDTO toDtoComMembros(Celula entity) {
        CelulaDTO dto = new CelulaDTO();
        dto.setId(entity.getId());
        if (entity.getIgreja() != null) {
            dto.setIgrejaId(entity.getIgreja().getId());
        }
        dto.setNome(entity.getNome());
        dto.setEndereco(entity.getEndereco());
        dto.setDiaSemana(entity.getDiaSemana());
        dto.setHorario(entity.getHorario());
        dto.setAtivo(entity.getAtivo());
        if (entity.getLider() != null) {
            dto.setLiderId(entity.getLider().getId());
            dto.setLiderNome(montarNome(entity.getLider()));
        }
        if (entity.getAuxiliar() != null) {
            dto.setAuxiliarId(entity.getAuxiliar().getId());
            dto.setAuxiliarNome(montarNome(entity.getAuxiliar()));
        }
        dto.setMembros(celulaMembroRepository.findByCelulaId(entity.getId()).stream().map(this::toMembroDto).toList());
        return dto;
    }

    private CelulaMembroDTO toMembroDto(CelulaMembro entity) {
        CelulaMembroDTO dto = new CelulaMembroDTO();
        dto.setId(entity.getId());
        if (entity.getCelula() != null) {
            dto.setCelulaId(entity.getCelula().getId());
        }
        if (entity.getUser() != null) {
            dto.setUserId(entity.getUser().getId());
            dto.setUserNome(montarNome(entity.getUser()));
        }
        return dto;
    }

    private String montarNome(User user) {
        String nome = (Objects.toString(user.getFirstName(), "") + " " + Objects.toString(user.getLastName(), "")).trim();
        return nome.isBlank() ? user.getLogin() : nome;
    }

    private BadRequestAlertException naoEncontrado() {
        return new BadRequestAlertException("Célula não encontrada", ENTITY, "naoencontrado");
    }
}
