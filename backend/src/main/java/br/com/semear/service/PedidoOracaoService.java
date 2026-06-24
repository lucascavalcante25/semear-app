package br.com.semear.service;

import br.com.semear.domain.Igreja;
import br.com.semear.domain.PedidoOracao;
import br.com.semear.domain.PedidoOracaoIntercessao;
import br.com.semear.domain.User;
import br.com.semear.domain.enumeration.CategoriaPedidoOracao;
import br.com.semear.domain.enumeration.StatusPedidoOracao;
import br.com.semear.domain.enumeration.VisibilidadePedidoOracao;
import br.com.semear.repository.IgrejaRepository;
import br.com.semear.repository.PedidoOracaoIntercessaoRepository;
import br.com.semear.repository.PedidoOracaoRepository;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.service.dto.PedidoOracaoAtualizarDTO;
import br.com.semear.service.dto.PedidoOracaoCriarDTO;
import br.com.semear.service.dto.PedidoOracaoDTO;
import br.com.semear.service.dto.PedidoOracaoPublicoCriarDTO;
import br.com.semear.service.dto.PedidoOracaoResponderDTO;
import br.com.semear.service.mapper.PedidoOracaoMapper;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PedidoOracaoService {

    private static final String ENTITY = "pedidoOracao";

    private static final List<StatusPedidoOracao> STATUS_MURAL = List.of(
        StatusPedidoOracao.ABERTO,
        StatusPedidoOracao.EM_INTERCESSAO,
        StatusPedidoOracao.RESPONDIDO
    );

    private static final List<StatusPedidoOracao> STATUS_ABERTOS = List.of(
        StatusPedidoOracao.AGUARDANDO_APROVACAO,
        StatusPedidoOracao.ABERTO,
        StatusPedidoOracao.EM_INTERCESSAO
    );

    private final PedidoOracaoRepository pedidoOracaoRepository;
    private final PedidoOracaoIntercessaoRepository intercessaoRepository;
    private final IgrejaRepository igrejaRepository;
    private final TenantService tenantService;
    private final PedidoOracaoMapper pedidoOracaoMapper;
    private final NotificacaoService notificacaoService;

    public PedidoOracaoService(
        PedidoOracaoRepository pedidoOracaoRepository,
        PedidoOracaoIntercessaoRepository intercessaoRepository,
        IgrejaRepository igrejaRepository,
        TenantService tenantService,
        PedidoOracaoMapper pedidoOracaoMapper,
        NotificacaoService notificacaoService
    ) {
        this.pedidoOracaoRepository = pedidoOracaoRepository;
        this.intercessaoRepository = intercessaoRepository;
        this.igrejaRepository = igrejaRepository;
        this.tenantService = tenantService;
        this.pedidoOracaoMapper = pedidoOracaoMapper;
        this.notificacaoService = notificacaoService;
    }

    @Transactional(readOnly = true)
    public Page<PedidoOracaoDTO> listarMural(Pageable pageable, CategoriaPedidoOracao categoria, StatusPedidoOracao status) {
        Long igrejaId = tenantService.getIgrejaIdAtual();
        User viewer = tenantService.getUsuarioAtual();
        return pedidoOracaoRepository
            .findMural(igrejaId, VisibilidadePedidoOracao.PUBLICA, STATUS_MURAL, categoria, status, pageable)
            .map(p -> toDtoComIntercessao(p, viewer, true));
    }

    @Transactional(readOnly = true)
    public Page<PedidoOracaoDTO> listarMeus(Pageable pageable) {
        Long igrejaId = tenantService.getIgrejaIdAtual();
        User usuario = tenantService.getUsuarioAtual();
        return pedidoOracaoRepository
            .findByIgrejaIdAndUsuarioIdAndDeletedAtIsNullOrderByCriadoEmDesc(igrejaId, usuario.getId(), pageable)
            .map(p -> toDtoComIntercessao(p, usuario, false));
    }

    @Transactional(readOnly = true)
    public Page<PedidoOracaoDTO> listarLideranca(Pageable pageable, CategoriaPedidoOracao categoria, StatusPedidoOracao status) {
        validarLideranca();
        Long igrejaId = tenantService.getIgrejaIdAtual();
        User viewer = tenantService.getUsuarioAtual();
        return pedidoOracaoRepository
            .findLideranca(igrejaId, categoria, status, pageable)
            .map(p -> toDtoComIntercessao(p, viewer, false));
    }

    @Transactional(readOnly = true)
    public Optional<PedidoOracaoDTO> obter(Long id) {
        User viewer = tenantService.getUsuarioAtual();
        return obterEntidade(id).map(p -> toDtoComIntercessao(p, viewer, deveOcultarAutor(p, viewer)));
    }

    public PedidoOracaoDTO criar(PedidoOracaoCriarDTO dto) {
        validarCriacao(dto);
        Igreja igreja = tenantService.resolverIgrejaParaCriacao();
        User usuario = tenantService.getUsuarioAtual();
        boolean requerAprovacaoIgreja = Boolean.TRUE.equals(igreja.getRequerAprovacaoOracaoPublica());

        PedidoOracao pedido = new PedidoOracao();
        pedido.setIgreja(igreja);
        pedido.setUsuario(usuario);
        pedido.setTitulo(dto.getTitulo().trim());
        pedido.setDescricao(dto.getDescricao().trim());
        pedido.setCategoria(dto.getCategoria());
        pedido.setVisibilidade(dto.getVisibilidade());
        pedido.setAnonimo(Boolean.TRUE.equals(dto.getAnonimo()));
        pedido.setCriadoEm(Instant.now());

        if (dto.getVisibilidade() == VisibilidadePedidoOracao.PUBLICA && requerAprovacaoIgreja) {
            pedido.setRequerAprovacao(true);
            pedido.setAprovado(false);
            pedido.setStatus(StatusPedidoOracao.AGUARDANDO_APROVACAO);
        } else {
            pedido.setRequerAprovacao(false);
            pedido.setAprovado(dto.getVisibilidade() == VisibilidadePedidoOracao.PUBLICA);
            pedido.setStatus(StatusPedidoOracao.ABERTO);
        }

        PedidoOracao salvo = pedidoOracaoRepository.save(pedido);

        if (dto.getVisibilidade() == VisibilidadePedidoOracao.PRIVADA) {
            notificacaoService.notificarPedidoOracaoPrivado(salvo);
        } else if (pedido.getStatus() == StatusPedidoOracao.AGUARDANDO_APROVACAO) {
            notificacaoService.notificarPedidoOracaoAguardandoAprovacao(salvo);
        }

        return toDtoComIntercessao(salvo, usuario, false);
    }

    public PedidoOracaoDTO criarPublico(String slug, PedidoOracaoPublicoCriarDTO dto) {
        validarCriacaoPublica(dto);
        Igreja igreja = igrejaRepository
            .findBySlugAndSiteAtivoTrue(slug)
            .orElseThrow(() -> new BadRequestAlertException("Igreja pública não encontrada", ENTITY, "naoencontrado"));

        PedidoOracao pedido = new PedidoOracao();
        pedido.setIgreja(igreja);
        pedido.setUsuario(null);
        pedido.setNomeSolicitante(dto.getNome() != null && !dto.getNome().isBlank() ? dto.getNome().trim() : null);
        pedido.setTitulo(dto.getTitulo().trim());
        pedido.setDescricao(dto.getDescricao().trim());
        pedido.setCategoria(dto.getCategoria());
        pedido.setVisibilidade(VisibilidadePedidoOracao.PRIVADA);
        pedido.setAnonimo(pedido.getNomeSolicitante() == null);
        pedido.setRequerAprovacao(true);
        pedido.setAprovado(false);
        pedido.setStatus(StatusPedidoOracao.AGUARDANDO_APROVACAO);
        pedido.setCriadoEm(Instant.now());

        PedidoOracao salvo = pedidoOracaoRepository.save(pedido);
        notificacaoService.notificarPedidoOracaoAguardandoAprovacao(salvo);

        PedidoOracaoDTO result = pedidoOracaoMapper.toDto(salvo, null, false);
        result.setTotalIntercessoes(0L);
        result.setOreiPorMim(false);
        return result;
    }

    public PedidoOracaoDTO denunciar(Long id) {
        PedidoOracao pedido = obterEntidadeVisivel(id);
        if (Boolean.TRUE.equals(pedido.getDenunciado())) {
            throw new BadRequestAlertException("Pedido já foi denunciado", ENTITY, "jadenunciado");
        }
        User usuario = tenantService.getUsuarioAtual();
        pedido.setDenunciado(true);
        pedido.setDenunciadoEm(Instant.now());
        pedido.setDenunciadoPor(usuario);
        pedido.setAtualizadoEm(Instant.now());
        return toDtoComIntercessao(pedidoOracaoRepository.save(pedido), usuario, deveOcultarAutor(pedido, usuario));
    }

    public PedidoOracaoDTO atualizar(Long id, PedidoOracaoAtualizarDTO dto) {
        PedidoOracao pedido = obterEntidadeEditavel(id);
        validarAtualizacao(dto);

        if (dto.getVisibilidade() == VisibilidadePedidoOracao.PUBLICA && !Boolean.TRUE.equals(pedido.getAprovado())) {
            Igreja igreja = igrejaRepository.findById(tenantService.getIgrejaIdAtual()).orElse(pedido.getIgreja());
            if (Boolean.TRUE.equals(igreja.getRequerAprovacaoOracaoPublica())) {
                pedido.setRequerAprovacao(true);
                pedido.setAprovado(false);
                pedido.setStatus(StatusPedidoOracao.AGUARDANDO_APROVACAO);
            }
        }

        pedido.setTitulo(dto.getTitulo().trim());
        pedido.setDescricao(dto.getDescricao().trim());
        pedido.setCategoria(dto.getCategoria());
        pedido.setVisibilidade(dto.getVisibilidade());
        pedido.setAnonimo(Boolean.TRUE.equals(dto.getAnonimo()));
        pedido.setAtualizadoEm(Instant.now());

        return toDtoComIntercessao(pedidoOracaoRepository.save(pedido), tenantService.getUsuarioAtual(), false);
    }

    public PedidoOracaoDTO aprovar(Long id) {
        validarLideranca();
        PedidoOracao pedido = obterEntidadeLideranca(id);
        if (pedido.getStatus() != StatusPedidoOracao.AGUARDANDO_APROVACAO) {
            throw new BadRequestAlertException("Pedido não está aguardando aprovação", ENTITY, "statusinvalido");
        }
        User aprovador = tenantService.getUsuarioAtual();
        pedido.setAprovado(true);
        pedido.setAprovadoPor(aprovador);
        pedido.setAprovadoEm(Instant.now());
        pedido.setStatus(StatusPedidoOracao.ABERTO);
        pedido.setAtualizadoEm(Instant.now());
        return toDtoComIntercessao(pedidoOracaoRepository.save(pedido), aprovador, false);
    }

    public PedidoOracaoDTO rejeitar(Long id) {
        validarLideranca();
        PedidoOracao pedido = obterEntidadeLideranca(id);
        pedido.setAprovado(false);
        pedido.setStatus(StatusPedidoOracao.REJEITADO);
        pedido.setAtualizadoEm(Instant.now());
        return toDtoComIntercessao(pedidoOracaoRepository.save(pedido), tenantService.getUsuarioAtual(), false);
    }

    public PedidoOracaoDTO responder(Long id, PedidoOracaoResponderDTO dto) {
        validarLideranca();
        if (dto.getRespostaTexto() == null || dto.getRespostaTexto().isBlank()) {
            throw new BadRequestAlertException("Resposta obrigatória", ENTITY, "respostaobrigatoria");
        }
        PedidoOracao pedido = obterEntidadeLideranca(id);
        pedido.setRespostaTexto(dto.getRespostaTexto().trim());
        pedido.setRespondidoEm(Instant.now());
        pedido.setStatus(StatusPedidoOracao.RESPONDIDO);
        pedido.setAtualizadoEm(Instant.now());
        return toDtoComIntercessao(pedidoOracaoRepository.save(pedido), tenantService.getUsuarioAtual(), false);
    }

    public PedidoOracaoDTO encerrar(Long id) {
        PedidoOracao pedido = obterEntidade(id).orElseThrow(() -> naoEncontrado());
        User usuario = tenantService.getUsuarioAtual();
        if (!ehLideranca(usuario) && (pedido.getUsuario() == null || !Objects.equals(pedido.getUsuario().getId(), usuario.getId()))) {
            throw new BadRequestAlertException("Acesso negado", ENTITY, "acessonegado");
        }
        pedido.setStatus(StatusPedidoOracao.ENCERRADO);
        pedido.setAtualizadoEm(Instant.now());
        return toDtoComIntercessao(pedidoOracaoRepository.save(pedido), usuario, deveOcultarAutor(pedido, usuario));
    }

    public void excluir(Long id) {
        PedidoOracao pedido = obterEntidadeEditavel(id);
        pedido.setDeletedAt(Instant.now());
        pedido.setAtualizadoEm(Instant.now());
        pedidoOracaoRepository.save(pedido);
    }

    public PedidoOracaoDTO registrarIntercessao(Long id) {
        PedidoOracao pedido = obterEntidadeVisivel(id);
        if (pedido.getVisibilidade() != VisibilidadePedidoOracao.PUBLICA || !podeAparecerNoMural(pedido)) {
            throw new BadRequestAlertException("Intercessão disponível apenas para pedidos públicos no mural", ENTITY, "intercessaoinvalida");
        }
        User usuario = tenantService.getUsuarioAtual();
        if (intercessaoRepository.existsByPedidoOracaoIdAndUsuarioId(id, usuario.getId())) {
            return toDtoComIntercessao(pedido, usuario, true);
        }
        PedidoOracaoIntercessao intercessao = new PedidoOracaoIntercessao();
        intercessao.setPedidoOracao(pedido);
        intercessao.setUsuario(usuario);
        intercessao.setCriadoEm(Instant.now());
        intercessaoRepository.save(intercessao);
        if (pedido.getStatus() == StatusPedidoOracao.ABERTO) {
            pedido.setStatus(StatusPedidoOracao.EM_INTERCESSAO);
            pedido.setAtualizadoEm(Instant.now());
            pedidoOracaoRepository.save(pedido);
        }
        return toDtoComIntercessao(pedido, usuario, true);
    }

    public void removerIntercessao(Long id) {
        User usuario = tenantService.getUsuarioAtual();
        obterEntidadeVisivel(id);
        intercessaoRepository.deleteByPedidoOracaoIdAndUsuarioId(id, usuario.getId());
    }

    private PedidoOracaoDTO toDtoComIntercessao(PedidoOracao pedido, User viewer, boolean ocultarAutor) {
        PedidoOracaoDTO dto = pedidoOracaoMapper.toDto(pedido, viewer, ocultarAutor);
        dto.setTotalIntercessoes(intercessaoRepository.countByPedidoOracaoId(pedido.getId()));
        dto.setOreiPorMim(intercessaoRepository.existsByPedidoOracaoIdAndUsuarioId(pedido.getId(), viewer.getId()));
        return dto;
    }

    private Optional<PedidoOracao> obterEntidade(Long id) {
        Long igrejaId = tenantService.getIgrejaIdAtual();
        return pedidoOracaoRepository.findByIdAndIgrejaIdAndDeletedAtIsNull(id, igrejaId).map(p -> {
            validarAcessoLeitura(p);
            return p;
        });
    }

    private PedidoOracao obterEntidadeVisivel(Long id) {
        return obterEntidade(id).orElseThrow(this::naoEncontrado);
    }

    private PedidoOracao obterEntidadeEditavel(Long id) {
        PedidoOracao pedido = obterEntidade(id).orElseThrow(this::naoEncontrado);
        User usuario = tenantService.getUsuarioAtual();
        if (pedido.getUsuario() == null || !Objects.equals(pedido.getUsuario().getId(), usuario.getId())) {
            throw new BadRequestAlertException("Apenas o autor pode editar este pedido", ENTITY, "acessonegado");
        }
        if (pedido.getStatus() == StatusPedidoOracao.ENCERRADO || pedido.getStatus() == StatusPedidoOracao.REJEITADO) {
            throw new BadRequestAlertException("Pedido não pode ser alterado", ENTITY, "statusinvalido");
        }
        return pedido;
    }

    private PedidoOracao obterEntidadeLideranca(Long id) {
        validarLideranca();
        Long igrejaId = tenantService.getIgrejaIdAtual();
        return pedidoOracaoRepository.findByIdAndIgrejaIdAndDeletedAtIsNull(id, igrejaId).orElseThrow(this::naoEncontrado);
    }

    private void validarAcessoLeitura(PedidoOracao pedido) {
        User usuario = tenantService.getUsuarioAtual();
        if (ehLideranca(usuario)) {
            return;
        }
        if (pedido.getUsuario() != null && Objects.equals(pedido.getUsuario().getId(), usuario.getId())) {
            return;
        }
        if (pedido.getVisibilidade() == VisibilidadePedidoOracao.PUBLICA && podeAparecerNoMural(pedido)) {
            return;
        }
        throw new BadRequestAlertException("Acesso negado ao pedido de oração", ENTITY, "acessonegado");
    }

    private boolean podeAparecerNoMural(PedidoOracao pedido) {
        if (pedido.getVisibilidade() != VisibilidadePedidoOracao.PUBLICA) {
            return false;
        }
        if (!STATUS_MURAL.contains(pedido.getStatus())) {
            return false;
        }
        return Boolean.TRUE.equals(pedido.getAprovado()) || !Boolean.TRUE.equals(pedido.getRequerAprovacao());
    }

    private boolean deveOcultarAutor(PedidoOracao pedido, User viewer) {
        if (!Boolean.TRUE.equals(pedido.getAnonimo())) {
            return false;
        }
        if (!ehLideranca(viewer) && !Objects.equals(pedido.getUsuario() != null ? pedido.getUsuario().getId() : null, viewer.getId())) {
            return true;
        }
        return false;
    }

    private void validarCriacaoPublica(PedidoOracaoPublicoCriarDTO dto) {
        if (dto.getTitulo() == null || dto.getTitulo().isBlank()) {
            throw new BadRequestAlertException("Título obrigatório", ENTITY, "tituloobrigatorio");
        }
        if (dto.getDescricao() == null || dto.getDescricao().isBlank()) {
            throw new BadRequestAlertException("Descrição obrigatória", ENTITY, "descricaoobrigatoria");
        }
        if (dto.getCategoria() == null) {
            throw new BadRequestAlertException("Categoria obrigatória", ENTITY, "categoriaobrigatoria");
        }
    }

    private void validarCriacao(PedidoOracaoCriarDTO dto) {
        if (dto.getTitulo() == null || dto.getTitulo().isBlank()) {
            throw new BadRequestAlertException("Título obrigatório", ENTITY, "tituloobrigatorio");
        }
        if (dto.getDescricao() == null || dto.getDescricao().isBlank()) {
            throw new BadRequestAlertException("Descrição obrigatória", ENTITY, "descricaoobrigatoria");
        }
        if (dto.getCategoria() == null) {
            throw new BadRequestAlertException("Categoria obrigatória", ENTITY, "categoriaobrigatoria");
        }
        if (dto.getVisibilidade() == null) {
            throw new BadRequestAlertException("Visibilidade obrigatória", ENTITY, "visibilidadeobrigatoria");
        }
    }

    private void validarAtualizacao(PedidoOracaoAtualizarDTO dto) {
        if (dto.getTitulo() == null || dto.getTitulo().isBlank()) {
            throw new BadRequestAlertException("Título obrigatório", ENTITY, "tituloobrigatorio");
        }
        if (dto.getDescricao() == null || dto.getDescricao().isBlank()) {
            throw new BadRequestAlertException("Descrição obrigatória", ENTITY, "descricaoobrigatoria");
        }
        if (dto.getCategoria() == null || dto.getVisibilidade() == null) {
            throw new BadRequestAlertException("Categoria e visibilidade obrigatórias", ENTITY, "dadosobrigatorios");
        }
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

    private BadRequestAlertException naoEncontrado() {
        return new BadRequestAlertException("Pedido de oração não encontrado", ENTITY, "naoencontrado");
    }
}
