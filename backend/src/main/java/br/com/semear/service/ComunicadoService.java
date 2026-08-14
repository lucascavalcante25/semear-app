package br.com.semear.service;

import br.com.semear.domain.Comunicado;
import br.com.semear.domain.ComunicadoBanner;
import br.com.semear.domain.ComunicadoLeitura;
import br.com.semear.domain.User;
import br.com.semear.domain.enumeration.PublicoAlvoInformativo;
import br.com.semear.domain.enumeration.TipoComunicado;
import br.com.semear.repository.ComunicadoBannerRepository;
import br.com.semear.repository.ComunicadoLeituraRepository;
import br.com.semear.repository.ComunicadoRepository;
import br.com.semear.repository.UserRepository;
import br.com.semear.repository.UsuarioNotificacaoVistaRepository;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.service.dto.ComunicadoDTO;
import br.com.semear.service.dto.ComunicadoLeituraDTO;
import br.com.semear.service.mapper.ComunicadoMapper;
import br.com.semear.service.util.ConfigNotificacaoJsonUtil;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import java.io.IOException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class ComunicadoService {

    private static final Logger LOG = LoggerFactory.getLogger(ComunicadoService.class);
    private static final String ENTITY = "comunicado";
    private static final String TIPO_NOTIFICACAO_COMUNICADO = "COMUNICADO";
    private static final String TIPO_NOTIFICACAO_AVISO = "AVISO";
    private static final long TAMANHO_MAX_BANNER_BYTES = 3L * 1024 * 1024;
    private static final Set<String> TIPOS_IMAGEM = Set.of("image/jpeg", "image/png", "image/gif", "image/webp");

    public record BannerArquivo(byte[] bytes, String contentType) {}

    private final ComunicadoRepository comunicadoRepository;
    private final ComunicadoBannerRepository comunicadoBannerRepository;
    private final ComunicadoLeituraRepository comunicadoLeituraRepository;
    private final TenantService tenantService;
    private final ComunicadoMapper comunicadoMapper;
    private final UserRepository userRepository;
    private final NotificacaoProgramadaService notificacaoProgramadaService;
    private final UsuarioNotificacaoVistaRepository usuarioNotificacaoVistaRepository;

    public ComunicadoService(
        ComunicadoRepository comunicadoRepository,
        ComunicadoBannerRepository comunicadoBannerRepository,
        ComunicadoLeituraRepository comunicadoLeituraRepository,
        TenantService tenantService,
        ComunicadoMapper comunicadoMapper,
        UserRepository userRepository,
        NotificacaoProgramadaService notificacaoProgramadaService,
        UsuarioNotificacaoVistaRepository usuarioNotificacaoVistaRepository
    ) {
        this.comunicadoRepository = comunicadoRepository;
        this.comunicadoBannerRepository = comunicadoBannerRepository;
        this.comunicadoLeituraRepository = comunicadoLeituraRepository;
        this.tenantService = tenantService;
        this.comunicadoMapper = comunicadoMapper;
        this.userRepository = userRepository;
        this.notificacaoProgramadaService = notificacaoProgramadaService;
        this.usuarioNotificacaoVistaRepository = usuarioNotificacaoVistaRepository;
    }

    @Transactional(readOnly = true)
    public Page<ComunicadoDTO> listar(Pageable pageable, boolean ativos) {
        Long igrejaId = tenantService.getIgrejaIdAtual();
        Page<Comunicado> page = ativos
            ? comunicadoRepository.findAllByIgrejaIdAndAtivoIsTrue(pageable, igrejaId)
            : comunicadoRepository.findAllByIgrejaId(pageable, igrejaId);
        return page.map(c -> comunicadoMapper.toListagemDto(c, null));
    }

    @Transactional(readOnly = true)
    public List<ComunicadoDTO> listarPendentesLogin() {
        User usuario = tenantService.getUsuarioAtual();
        Long igrejaId = tenantService.getIgrejaIdAtual();
        LocalDate hoje = LocalDate.now();

        return comunicadoRepository
            .findByIgrejaIdAndAtivoTrueAndExibirNoLoginTrueOrderByPrioridadeDescCriadoEmDesc(igrejaId)
            .stream()
            .filter(c -> estaVigente(c, hoje))
            .filter(c -> atendePublicoAlvo(c, usuario))
            .filter(c -> !comunicadoLeituraRepository.existsByComunicadoIdAndUsuarioId(c.getId(), usuario.getId()))
            .map(c -> comunicadoMapper.toDto(c, false))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<ComunicadoDTO> listarBanner() {
        User usuario = tenantService.getUsuarioAtual();
        Long igrejaId = tenantService.getIgrejaIdAtual();
        LocalDate hoje = LocalDate.now();

        return comunicadoRepository
            .findByIgrejaIdAndAtivoTrueAndExibirNoLoginTrueOrderByPrioridadeDescCriadoEmDesc(igrejaId)
            .stream()
            .filter(c -> estaVigente(c, hoje))
            .filter(c -> atendePublicoAlvo(c, usuario))
            .filter(c -> !Boolean.TRUE.equals(c.getObrigatorio()))
            .filter(c -> !comunicadoLeituraRepository.existsByComunicadoIdAndUsuarioId(c.getId(), usuario.getId()))
            .map(c -> comunicadoMapper.toDto(c, false))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<ComunicadoLeituraDTO> listarLeituras(Long id) {
        validarLideranca();
        Comunicado comunicado = obterDaIgreja(id).orElseThrow(this::naoEncontrado);
        return comunicadoLeituraRepository
            .findByComunicadoIdOrderByConfirmadoEmDesc(comunicado.getId())
            .stream()
            .map(comunicadoMapper::toLeituraDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public ComunicadoDTO obter(Long id) {
        Comunicado comunicado = obterDaIgreja(id).orElseThrow(this::naoEncontrado);
        return comunicadoMapper.toDto(comunicado);
    }

    public ComunicadoDTO criar(ComunicadoDTO dto) {
        validarLideranca();
        validarDados(dto);
        User usuario = tenantService.getUsuarioAtual();

        Comunicado comunicado = new Comunicado();
        comunicado.setIgreja(tenantService.resolverIgrejaParaCriacao());
        aplicarDados(comunicado, dto);
        comunicado.setCriadoPor(obterNomeCompleto(usuario));
        comunicado.setCriadoEm(Instant.now());

        Comunicado salvo = comunicadoRepository.save(comunicado);
        notificacaoProgramadaService.sincronizarComunicado(salvo, dto.getConfigNotificacao(), true);
        return comunicadoMapper.toDto(salvo);
    }

    public ComunicadoDTO atualizar(Long id, ComunicadoDTO dto) {
        validarLideranca();
        validarDados(dto);
        Comunicado comunicado = obterDaIgreja(id).orElseThrow(this::naoEncontrado);
        aplicarDados(comunicado, dto);
        comunicado.setAtualizadoEm(Instant.now());
        comunicado.setAtualizadoPor(obterNomeCompleto(tenantService.getUsuarioAtual()));
        Comunicado salvo = comunicadoRepository.save(comunicado);
        notificacaoProgramadaService.sincronizarComunicado(salvo, dto.getConfigNotificacao(), false);
        return comunicadoMapper.toDto(salvo);
    }

    public void excluir(Long id) {
        validarLideranca();
        Comunicado comunicado = obterDaIgreja(id).orElseThrow(this::naoEncontrado);
        notificacaoProgramadaService.cancelarEntidade("COMUNICADO", comunicado.getId());
        comunicadoBannerRepository.deleteById(comunicado.getId());
        comunicadoLeituraRepository.deleteByComunicadoId(comunicado.getId());
        usuarioNotificacaoVistaRepository.deleteAllByTipoAndReferenciaId(TIPO_NOTIFICACAO_COMUNICADO, comunicado.getId());
        usuarioNotificacaoVistaRepository.deleteAllByTipoAndReferenciaId(TIPO_NOTIFICACAO_AVISO, comunicado.getId());
        comunicadoRepository.delete(comunicado);
    }

    public ComunicadoDTO confirmarLeitura(Long id) {
        User usuario = tenantService.getUsuarioAtual();
        Comunicado comunicado = obterDaIgreja(id).orElseThrow(this::naoEncontrado);
        if (!Boolean.TRUE.equals(comunicado.getAtivo())) {
            throw new BadRequestAlertException("Comunicado inativo", ENTITY, "inativo");
        }
        if (!estaVigente(comunicado, LocalDate.now())) {
            throw new BadRequestAlertException("Comunicado fora da vigência", ENTITY, "foravigencia");
        }
        if (!atendePublicoAlvo(comunicado, usuario)) {
            throw new BadRequestAlertException("Comunicado não disponível para seu perfil", ENTITY, "publiconegado");
        }

        if (!comunicadoLeituraRepository.existsByComunicadoIdAndUsuarioId(id, usuario.getId())) {
            ComunicadoLeitura leitura = new ComunicadoLeitura();
            leitura.setComunicado(comunicado);
            leitura.setUsuario(usuario);
            leitura.setConfirmadoEm(Instant.now());
            comunicadoLeituraRepository.save(leitura);
        }

        return comunicadoMapper.toDto(comunicado, true);
    }

    public ComunicadoDTO uploadImagem(Long id, MultipartFile file) {
        validarLideranca();
        if (file == null || file.isEmpty()) {
            throw new BadRequestAlertException("Arquivo vazio", ENTITY, "arquivovazio");
        }
        if (file.getSize() > TAMANHO_MAX_BANNER_BYTES) {
            throw new BadRequestAlertException("A imagem deve ter no máximo 3 MB", ENTITY, "arquivoGrande");
        }
        String contentType = file.getContentType();
        if (contentType == null || !TIPOS_IMAGEM.contains(contentType)) {
            throw new BadRequestAlertException("Use JPEG, PNG, GIF ou WebP", ENTITY, "tipoinvalido");
        }
        Comunicado entity = obterDaIgreja(id).orElseThrow(this::naoEncontrado);
        final byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            LOG.error("Erro ao ler bytes da imagem do comunicado {}", entity.getId(), e);
            throw new BadRequestAlertException("Erro ao ler o arquivo da imagem", ENTITY, "errosalvar");
        }

        ComunicadoBanner banner = comunicadoBannerRepository.findById(entity.getId()).orElseGet(ComunicadoBanner::new);
        banner.setComunicadoId(entity.getId());
        banner.setContentType(contentType);
        banner.setDados(bytes);
        banner.setAtualizadoEm(Instant.now());
        comunicadoBannerRepository.saveAndFlush(banner);

        entity.setImagemUrl("/api/comunicados/" + entity.getId() + "/imagem");
        Comunicado salvo = comunicadoRepository.saveAndFlush(entity);
        return comunicadoMapper.toDto(salvo);
    }

    @Transactional(readOnly = true)
    public Optional<BannerArquivo> obterImagem(Long id) {
        return comunicadoBannerRepository
            .findById(id)
            .filter(b -> b.getDados() != null && b.getDados().length > 0)
            .map(b -> new BannerArquivo(b.getDados(), b.getContentType()));
    }

    public ComunicadoDTO removerImagem(Long id) {
        validarLideranca();
        Comunicado entity = obterDaIgreja(id).orElseThrow(this::naoEncontrado);
        comunicadoBannerRepository.deleteById(id);
        entity.setImagemUrl(null);
        return comunicadoMapper.toDto(comunicadoRepository.save(entity));
    }

    public String resolverCriadoPorDisplayName(String criadoPor) {
        if (criadoPor == null || criadoPor.isBlank()) {
            return "Sistema";
        }
        String apenasDigitos = criadoPor.replaceAll("\\D", "");
        if (apenasDigitos.length() == 11) {
            return userRepository.findOneByLogin(apenasDigitos).map(ComunicadoService::obterNomeCompleto).orElse(criadoPor);
        }
        return criadoPor;
    }

    private Optional<Comunicado> obterDaIgreja(Long id) {
        return comunicadoRepository.findByIdAndIgrejaId(id, tenantService.getIgrejaIdAtual());
    }

    private void aplicarDados(Comunicado comunicado, ComunicadoDTO dto) {
        comunicado.setTitulo(dto.getTitulo().trim());
        comunicado.setConteudo(dto.getConteudo().trim());
        comunicado.setTipo(dto.getTipo() != null ? dto.getTipo() : TipoComunicado.NORMAL);
        comunicado.setPublicoAlvo(dto.getPublicoAlvo() != null ? dto.getPublicoAlvo() : PublicoAlvoInformativo.TODOS);
        comunicado.setPrioridade(dto.getPrioridade() != null ? dto.getPrioridade() : comunicado.getPrioridade());
        comunicado.setExibirNoLogin(dto.getExibirNoLogin() != null ? dto.getExibirNoLogin() : false);
        comunicado.setObrigatorio(dto.getObrigatorio() != null ? dto.getObrigatorio() : false);
        comunicado.setExibirNoSitePublico(dto.getExibirNoSitePublico() != null ? dto.getExibirNoSitePublico() : true);
        comunicado.setAtivo(dto.getAtivo() != null ? dto.getAtivo() : true);
        comunicado.setDataInicio(dto.getDataInicio());
        comunicado.setDataFim(dto.getDataFim());
        comunicado.setCtaRotulo(dto.getCtaRotulo());
        comunicado.setCtaRota(dto.getCtaRota());
        comunicado.setImagemUrl(dto.getImagemUrl());
        comunicado.setConfigNotificacao(ConfigNotificacaoJsonUtil.serializar(dto.getConfigNotificacao()));
    }

    private void validarDados(ComunicadoDTO dto) {
        if (dto.getTitulo() == null || dto.getTitulo().isBlank()) {
            throw new BadRequestAlertException("Título obrigatório", ENTITY, "tituloobrigatorio");
        }
        if (dto.getConteudo() == null || dto.getConteudo().isBlank()) {
            throw new BadRequestAlertException("Conteúdo obrigatório", ENTITY, "conteudoobrigatorio");
        }
        if (dto.getDataInicio() == null) {
            throw new BadRequestAlertException("Data início é obrigatória", ENTITY, "datainicioobrigatoria");
        }
    }

    public boolean estaVigente(Comunicado comunicado, LocalDate referencia) {
        if (comunicado.getDataInicio() != null && referencia.isBefore(comunicado.getDataInicio())) {
            return false;
        }
        if (comunicado.getDataFim() != null && referencia.isAfter(comunicado.getDataFim())) {
            return false;
        }
        return true;
    }

    private boolean atendePublicoAlvo(Comunicado comunicado, User usuario) {
        PublicoAlvoInformativo publico = comunicado.getPublicoAlvo();
        if (publico == PublicoAlvoInformativo.TODOS) {
            return true;
        }
        if (publico == PublicoAlvoInformativo.LIDERANCA) {
            return ehLideranca(usuario);
        }
        if (publico == PublicoAlvoInformativo.NOVOS_USUARIOS) {
            return usuario.getCreatedDate() != null && usuario.getCreatedDate().isAfter(Instant.now().minusSeconds(30L * 24 * 3600));
        }
        if (publico == PublicoAlvoInformativo.MEMBROS) {
            return usuario
                .getAuthorities()
                .stream()
                .anyMatch(a ->
                    AuthoritiesConstants.MEMBRO.equals(a.getName()) ||
                    AuthoritiesConstants.LIDER.equals(a.getName()) ||
                    AuthoritiesConstants.SECRETARIA.equals(a.getName()) ||
                    AuthoritiesConstants.TESOURARIA.equals(a.getName()) ||
                    AuthoritiesConstants.PASTOR.equals(a.getName()) ||
                    AuthoritiesConstants.COPASTOR.equals(a.getName()) ||
                    AuthoritiesConstants.ADMIN_IGREJA.equals(a.getName()) ||
                    AuthoritiesConstants.ADMIN.equals(a.getName())
                );
        }
        return true;
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

    private void validarLideranca() {
        if (!ehLideranca(tenantService.getUsuarioAtual())) {
            throw new BadRequestAlertException("Acesso restrito à liderança", ENTITY, "acessonegado");
        }
    }

    private static String obterNomeCompleto(User user) {
        if (user == null) return "Sistema";
        String first = user.getFirstName() != null ? user.getFirstName().trim() : "";
        String last = user.getLastName() != null ? user.getLastName().trim() : "";
        String nome = (first + " " + last).trim();
        return nome.isEmpty() ? user.getLogin() : nome;
    }

    private BadRequestAlertException naoEncontrado() {
        return new BadRequestAlertException("Comunicado não encontrado", ENTITY, "naoencontrado");
    }
}
