package br.com.semear.service;

import br.com.semear.domain.Crianca;
import br.com.semear.domain.CriancaPresenca;
import br.com.semear.domain.CriancaResponsavel;
import br.com.semear.domain.User;
import br.com.semear.repository.CriancaPresencaRepository;
import br.com.semear.repository.CriancaRepository;
import br.com.semear.repository.CriancaResponsavelRepository;
import br.com.semear.repository.UserRepository;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.service.dto.CriancaDTO;
import br.com.semear.service.dto.CriancaResponsavelDTO;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CriancaService {

    private static final String ENTITY = "crianca";

    private final CriancaRepository criancaRepository;
    private final CriancaResponsavelRepository criancaResponsavelRepository;
    private final CriancaPresencaRepository criancaPresencaRepository;
    private final UserRepository userRepository;
    private final TenantService tenantService;

    public CriancaService(
        CriancaRepository criancaRepository,
        CriancaResponsavelRepository criancaResponsavelRepository,
        CriancaPresencaRepository criancaPresencaRepository,
        UserRepository userRepository,
        TenantService tenantService
    ) {
        this.criancaRepository = criancaRepository;
        this.criancaResponsavelRepository = criancaResponsavelRepository;
        this.criancaPresencaRepository = criancaPresencaRepository;
        this.userRepository = userRepository;
        this.tenantService = tenantService;
    }

    @Transactional(readOnly = true)
    public List<CriancaDTO> listar() {
        validarLideranca();
        return criancaRepository
            .findByIgrejaIdAndAtivoTrueOrderByNomeAsc(tenantService.getIgrejaIdAtual())
            .stream()
            .map(this::toDtoComResponsaveis)
            .toList();
    }

    @Transactional(readOnly = true)
    public Optional<CriancaDTO> obter(Long id) {
        validarLideranca();
        return obterEntidade(id).map(this::toDtoComResponsaveis);
    }

    public CriancaDTO criar(CriancaDTO dto) {
        validarLideranca();
        validarDados(dto);
        Crianca entity = new Crianca();
        entity.setIgreja(tenantService.resolverIgrejaParaCriacao());
        aplicarDados(entity, dto);
        Crianca salva = criancaRepository.save(entity);
        sincronizarResponsaveis(salva, dto.getResponsaveis());
        return toDtoComResponsaveis(salva);
    }

    public CriancaDTO atualizar(Long id, CriancaDTO dto) {
        validarLideranca();
        validarDados(dto);
        Crianca entity = obterEntidade(id).orElseThrow(this::naoEncontrado);
        aplicarDados(entity, dto);
        Crianca salva = criancaRepository.save(entity);
        sincronizarResponsaveis(salva, dto.getResponsaveis());
        return toDtoComResponsaveis(salva);
    }

    public void excluir(Long id) {
        validarLideranca();
        Crianca entity = obterEntidade(id).orElseThrow(this::naoEncontrado);
        entity.setAtivo(false);
        criancaRepository.save(entity);
    }

    public CriancaDTO registrarCheckIn(Long id) {
        validarLideranca();
        Crianca crianca = obterEntidade(id).orElseThrow(this::naoEncontrado);
        LocalDate hoje = LocalDate.now();
        if (criancaPresencaRepository.findByCriancaIdAndDataPresenca(crianca.getId(), hoje).isPresent()) {
            throw new BadRequestAlertException("Check-in já registrado hoje", ENTITY, "checkinexistente");
        }
        CriancaPresenca presenca = new CriancaPresenca();
        presenca.setIgreja(crianca.getIgreja());
        presenca.setCrianca(crianca);
        presenca.setDataPresenca(hoje);
        presenca.setEntradaEm(Instant.now());
        presenca.setRegistradoPor(tenantService.getUsuarioAtual());
        criancaPresencaRepository.save(presenca);
        return toDtoComResponsaveis(crianca);
    }

    public CriancaDTO registrarCheckOut(Long id) {
        validarLideranca();
        Crianca crianca = obterEntidade(id).orElseThrow(this::naoEncontrado);
        LocalDate hoje = LocalDate.now();
        CriancaPresenca presenca = criancaPresencaRepository
            .findByCriancaIdAndDataPresenca(crianca.getId(), hoje)
            .orElseThrow(() -> new BadRequestAlertException("Nenhum check-in hoje", ENTITY, "semcheckin"));
        if (presenca.getSaidaEm() != null) {
            throw new BadRequestAlertException("Check-out já registrado", ENTITY, "checkoutexistente");
        }
        presenca.setSaidaEm(Instant.now());
        criancaPresencaRepository.save(presenca);
        return toDtoComResponsaveis(crianca);
    }

    private void aplicarDados(Crianca entity, CriancaDTO dto) {
        entity.setNome(dto.getNome().trim());
        entity.setDataNascimento(dto.getDataNascimento());
        entity.setObservacoes(dto.getObservacoes());
        entity.setSala(dto.getSala());
        entity.setAlergias(dto.getAlergias());
        entity.setAtivo(dto.getAtivo() == null ? true : dto.getAtivo());
    }

    private void sincronizarResponsaveis(Crianca crianca, List<CriancaResponsavelDTO> responsaveis) {
        if (responsaveis == null) {
            return;
        }
        criancaResponsavelRepository.findByCriancaId(crianca.getId()).forEach(criancaResponsavelRepository::delete);
        for (CriancaResponsavelDTO responsavelDto : responsaveis) {
            if (responsavelDto.getUserId() == null) {
                continue;
            }
            User user = userRepository.findById(responsavelDto.getUserId()).orElseThrow(this::naoEncontrado);
            tenantService.validarMesmaIgreja(user.getIgreja());
            CriancaResponsavel responsavel = new CriancaResponsavel();
            responsavel.setCrianca(crianca);
            responsavel.setUser(user);
            responsavel.setParentesco(responsavelDto.getParentesco());
            criancaResponsavelRepository.save(responsavel);
        }
    }

    private void validarDados(CriancaDTO dto) {
        if (dto.getNome() == null || dto.getNome().isBlank()) {
            throw new BadRequestAlertException("Nome da criança é obrigatório", ENTITY, "nomeobrigatorio");
        }
    }

    private Optional<Crianca> obterEntidade(Long id) {
        return criancaRepository.findByIdAndIgrejaId(id, tenantService.getIgrejaIdAtual());
    }

    private CriancaDTO toDtoComResponsaveis(Crianca entity) {
        CriancaDTO dto = new CriancaDTO();
        dto.setId(entity.getId());
        if (entity.getIgreja() != null) {
            dto.setIgrejaId(entity.getIgreja().getId());
        }
        dto.setNome(entity.getNome());
        dto.setDataNascimento(entity.getDataNascimento());
        dto.setObservacoes(entity.getObservacoes());
        dto.setSala(entity.getSala());
        dto.setAlergias(entity.getAlergias());
        dto.setAtivo(entity.getAtivo());
        dto.setResponsaveis(criancaResponsavelRepository.findByCriancaId(entity.getId()).stream().map(this::toResponsavelDto).toList());
        criancaPresencaRepository.findByCriancaIdAndDataPresenca(entity.getId(), LocalDate.now()).ifPresent(p -> {
            dto.setCheckInHoje(true);
            dto.setCheckoutRegistrado(p.getSaidaEm() != null);
        });
        if (dto.getCheckInHoje() == null) {
            dto.setCheckInHoje(false);
            dto.setCheckoutRegistrado(false);
        }
        return dto;
    }

    private CriancaResponsavelDTO toResponsavelDto(CriancaResponsavel entity) {
        CriancaResponsavelDTO dto = new CriancaResponsavelDTO();
        dto.setId(entity.getId());
        if (entity.getCrianca() != null) {
            dto.setCriancaId(entity.getCrianca().getId());
        }
        if (entity.getUser() != null) {
            dto.setUserId(entity.getUser().getId());
            dto.setUserNome(montarNome(entity.getUser()));
        }
        dto.setParentesco(entity.getParentesco());
        return dto;
    }

    private void validarLideranca() {
        if (!ehLideranca(tenantService.getUsuarioAtual())) {
            throw new BadRequestAlertException("Acesso restrito à liderança", ENTITY, "acessonegado");
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

    private String montarNome(User user) {
        String nome = (Objects.toString(user.getFirstName(), "") + " " + Objects.toString(user.getLastName(), "")).trim();
        return nome.isBlank() ? user.getLogin() : nome;
    }

    private BadRequestAlertException naoEncontrado() {
        return new BadRequestAlertException("Criança não encontrada", ENTITY, "naoencontrado");
    }
}
