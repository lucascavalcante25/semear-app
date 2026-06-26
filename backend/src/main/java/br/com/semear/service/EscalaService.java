package br.com.semear.service;

import br.com.semear.domain.Departamento;
import br.com.semear.domain.Escala;
import br.com.semear.domain.EscalaGeracao;
import br.com.semear.domain.EscalaItem;
import br.com.semear.domain.User;
import br.com.semear.repository.DepartamentoRepository;
import br.com.semear.repository.EscalaGeracaoRepository;
import br.com.semear.repository.EscalaItemRepository;
import br.com.semear.repository.EscalaRepository;
import br.com.semear.repository.UserRepository;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.domain.enumeration.StatusEscalaPublicacao;
import br.com.semear.service.dto.EscalaDTO;
import br.com.semear.service.dto.EscalaItemDTO;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EscalaService {

    private static final String ENTITY = "escala";
    private static final ZoneId FUSO = ZoneId.of("America/Sao_Paulo");

    private final EscalaRepository escalaRepository;
    private final EscalaGeracaoRepository geracaoRepository;
    private final EscalaItemRepository escalaItemRepository;
    private final DepartamentoRepository departamentoRepository;
    private final UserRepository userRepository;
    private final TenantService tenantService;
    private final NotificacaoService notificacaoService;

    public EscalaService(
        EscalaRepository escalaRepository,
        EscalaGeracaoRepository geracaoRepository,
        EscalaItemRepository escalaItemRepository,
        DepartamentoRepository departamentoRepository,
        UserRepository userRepository,
        TenantService tenantService,
        NotificacaoService notificacaoService
    ) {
        this.escalaRepository = escalaRepository;
        this.geracaoRepository = geracaoRepository;
        this.escalaItemRepository = escalaItemRepository;
        this.departamentoRepository = departamentoRepository;
        this.userRepository = userRepository;
        this.tenantService = tenantService;
        this.notificacaoService = notificacaoService;
    }

    @Transactional(readOnly = true)
    public List<EscalaDTO> listar() {
        Long igrejaId = tenantService.getIgrejaIdAtual();
        Optional<EscalaGeracao> geracaoVigente = resolverGeracaoVigente(igrejaId);

        if (geracaoVigente.isPresent()) {
            return escalaRepository
                .findByGeracaoId(geracaoVigente.get().getId())
                .stream()
                .filter(e -> e.getStatus() == StatusEscalaPublicacao.PUBLICADA || usuarioPodeGerenciarEscalas())
                .sorted(Comparator.comparing(Escala::getDataEvento, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(this::toDtoComItens)
                .toList();
        }

        return escalaRepository
            .findByIgrejaIdOrderByDataEventoDesc(igrejaId)
            .stream()
            .filter(e -> e.getGeracao() == null)
            .filter(e -> e.getStatus() == StatusEscalaPublicacao.PUBLICADA || usuarioPodeGerenciarEscalas())
            .map(this::toDtoComItens)
            .toList();
    }

    private Optional<EscalaGeracao> resolverGeracaoVigente(Long igrejaId) {
        if (usuarioPodeGerenciarEscalas()) {
            Optional<EscalaGeracao> rascunho = geracaoRepository.findFirstByIgrejaIdAndStatusOrderByCriadoEmDesc(
                igrejaId,
                StatusEscalaPublicacao.RASCUNHO
            );
            if (rascunho.isPresent()) {
                return rascunho;
            }
        }

        LocalDate hoje = LocalDate.now(FUSO);
        Optional<EscalaGeracao> vigente = geracaoRepository
            .findByIgrejaIdOrderByDataInicioDesc(igrejaId)
            .stream()
            .filter(g -> g.getStatus() == StatusEscalaPublicacao.PUBLICADA)
            .filter(g -> !hoje.isBefore(g.getDataInicio()) && !hoje.isAfter(g.getDataFim()))
            .findFirst();
        if (vigente.isPresent()) {
            return vigente;
        }

        return geracaoRepository.findFirstByIgrejaIdAndStatusOrderByDataFimDesc(igrejaId, StatusEscalaPublicacao.PUBLICADA);
    }

    @Transactional(readOnly = true)
    public Optional<EscalaDTO> obter(Long id) {
        return obterEntidade(id).map(this::toDtoComItens);
    }

    public EscalaDTO criar(EscalaDTO dto) {
        validarDados(dto);
        Escala escala = new Escala();
        escala.setIgreja(tenantService.resolverIgrejaParaCriacao());
        aplicarDados(escala, dto);
        escala.setCriadoEm(Instant.now());
        escala.setStatus(StatusEscalaPublicacao.PUBLICADA);
        Escala salva = escalaRepository.save(escala);
        sincronizarItens(salva, dto.getItens(), true);
        return toDtoComItens(salva);
    }

    public EscalaDTO atualizar(Long id, EscalaDTO dto) {
        validarDados(dto);
        Escala escala = obterEntidade(id).orElseThrow(this::naoEncontrado);
        String tituloAntes = escala.getTitulo();
        Instant dataAntes = escala.getDataEvento();
        List<EscalaItem> itensAntes = escalaItemRepository.findByEscalaId(escala.getId());
        aplicarDados(escala, dto);
        Escala salva = escalaRepository.save(escala);
        sincronizarItens(salva, dto.getItens(), false);
        if (salva.getStatus() == StatusEscalaPublicacao.PUBLICADA) {
            List<EscalaItem> itensDepois = escalaItemRepository.findByEscalaId(salva.getId());
            notificacaoService.processarAlteracoesEscala(salva, tituloAntes, dataAntes, itensAntes, itensDepois);
        }
        return toDtoComItens(salva);
    }

    public void excluir(Long id) {
        Escala escala = obterEntidade(id).orElseThrow(this::naoEncontrado);
        if (escala.getStatus() == StatusEscalaPublicacao.PUBLICADA) {
            notificacaoService.notificarEscalasExcluidas(escala);
        }
        escalaItemRepository.findByEscalaId(escala.getId()).forEach(escalaItemRepository::delete);
        escalaRepository.delete(escala);
    }

    public EscalaItemDTO confirmarItem(Long id, Long itemId) {
        Escala escala = obterEntidade(id).orElseThrow(this::naoEncontrado);
        EscalaItem item = escalaItemRepository.findByIdAndEscalaId(itemId, escala.getId()).orElseThrow(this::naoEncontrado);

        User usuario = tenantService.getUsuarioAtual();
        boolean podeConfirmar = Objects.equals(usuario.getId(), item.getUser().getId()) || ehLideranca(usuario);
        if (!podeConfirmar) {
            throw new BadRequestAlertException("Acesso negado para confirmar este item", ENTITY, "acessonegado");
        }

        item.setConfirmado(true);
        item.setConfirmadoEm(Instant.now());
        return toItemDto(escalaItemRepository.save(item));
    }

    private void sincronizarItens(Escala escala, List<EscalaItemDTO> itens, boolean notificarAtribuicao) {
        escalaItemRepository.findByEscalaId(escala.getId()).forEach(escalaItemRepository::delete);
        if (itens == null || itens.isEmpty()) {
            return;
        }
        for (EscalaItemDTO itemDto : itens) {
            if (itemDto.getUserId() == null) {
                continue;
            }
            User user = userRepository.findById(itemDto.getUserId()).orElseThrow(this::naoEncontrado);
            tenantService.validarMesmaIgreja(user.getIgreja());

            EscalaItem item = new EscalaItem();
            item.setEscala(escala);
            item.setUser(user);
            item.setFuncao(itemDto.getFuncao());
            item.setConfirmado(Boolean.TRUE.equals(itemDto.getConfirmado()));
            item.setConfirmadoEm(Boolean.TRUE.equals(itemDto.getConfirmado()) ? Instant.now() : null);
            EscalaItem salvo = escalaItemRepository.save(item);
            if (notificarAtribuicao) {
                notificacaoService.notificarEscalaItemAtribuido(escala, salvo);
            }
        }
    }

    private void aplicarDados(Escala escala, EscalaDTO dto) {
        escala.setTitulo(dto.getTitulo().trim());
        escala.setDataEvento(dto.getDataEvento());
        escala.setObservacao(dto.getObservacao());
        if (dto.getDepartamentoId() != null) {
            Departamento departamento = departamentoRepository.findById(dto.getDepartamentoId()).orElseThrow(this::naoEncontrado);
            tenantService.validarMesmaIgreja(departamento.getIgreja());
            escala.setDepartamento(departamento);
        } else {
            escala.setDepartamento(null);
        }
    }

    private void validarDados(EscalaDTO dto) {
        if (dto.getTitulo() == null || dto.getTitulo().isBlank()) {
            throw new BadRequestAlertException("Título da escala é obrigatório", ENTITY, "tituloobrigatorio");
        }
        if (dto.getDataEvento() == null) {
            throw new BadRequestAlertException("Data do evento é obrigatória", ENTITY, "dataobrigatoria");
        }
    }

    private Optional<Escala> obterEntidade(Long id) {
        return escalaRepository.findByIdAndIgrejaId(id, tenantService.getIgrejaIdAtual());
    }

    private EscalaDTO toDtoComItens(Escala entity) {
        EscalaDTO dto = new EscalaDTO();
        dto.setId(entity.getId());
        if (entity.getIgreja() != null) {
            dto.setIgrejaId(entity.getIgreja().getId());
        }
        if (entity.getDepartamento() != null) {
            dto.setDepartamentoId(entity.getDepartamento().getId());
            dto.setDepartamentoNome(entity.getDepartamento().getNome());
        }
        dto.setTitulo(entity.getTitulo());
        dto.setDataEvento(entity.getDataEvento());
        dto.setObservacao(entity.getObservacao());
        dto.setStatus(entity.getStatus() != null ? entity.getStatus().name() : StatusEscalaPublicacao.PUBLICADA.name());
        if (entity.getGeracao() != null) {
            dto.setGeracaoId(entity.getGeracao().getId());
        }
        dto.setCriadoEm(entity.getCriadoEm());
        dto.setItens(escalaItemRepository.findByEscalaId(entity.getId()).stream().map(this::toItemDto).toList());
        return dto;
    }

    private EscalaItemDTO toItemDto(EscalaItem entity) {
        EscalaItemDTO dto = new EscalaItemDTO();
        dto.setId(entity.getId());
        if (entity.getEscala() != null) {
            dto.setEscalaId(entity.getEscala().getId());
        }
        if (entity.getUser() != null) {
            dto.setUserId(entity.getUser().getId());
            dto.setUserNome(montarNome(entity.getUser()));
        }
        dto.setFuncao(entity.getFuncao());
        dto.setConfirmado(entity.getConfirmado());
        dto.setConfirmadoEm(entity.getConfirmadoEm());
        return dto;
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

    private boolean usuarioPodeGerenciarEscalas() {
        try {
            User usuario = tenantService.getUsuarioAtual();
            return usuario
                .getAuthorities()
                .stream()
                .anyMatch(a ->
                    AuthoritiesConstants.SECRETARIA.equals(a.getName()) ||
                    AuthoritiesConstants.ADMIN.equals(a.getName()) ||
                    AuthoritiesConstants.ADMIN_IGREJA.equals(a.getName()) ||
                    AuthoritiesConstants.PASTOR.equals(a.getName()) ||
                    AuthoritiesConstants.COPASTOR.equals(a.getName()) ||
                    AuthoritiesConstants.LIDER.equals(a.getName())
                );
        } catch (Exception e) {
            return false;
        }
    }

    private BadRequestAlertException naoEncontrado() {
        return new BadRequestAlertException("Escala não encontrada", ENTITY, "naoencontrado");
    }
}
