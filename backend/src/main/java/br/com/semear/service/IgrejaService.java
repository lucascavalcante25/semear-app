package br.com.semear.service;

import br.com.semear.config.Constants;
import br.com.semear.domain.Igreja;
import br.com.semear.domain.User;
import br.com.semear.domain.enumeration.StatusIgreja;
import br.com.semear.repository.IgrejaRepository;
import br.com.semear.repository.UserRepository;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.security.SecurityUtils;
import br.com.semear.service.dto.IgrejaDTO;
import br.com.semear.service.dto.IgrejaPixDTO;
import br.com.semear.service.dto.IgrejaPublicaDTO;
import br.com.semear.service.mapper.IgrejaMapper;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class IgrejaService {

    private static final Logger LOG = LoggerFactory.getLogger(IgrejaService.class);
    private static final String ENTITY_NAME = "igreja";
    private static final List<StatusIgreja> STATUS_IGREJA_OPERACIONAL = List.of(StatusIgreja.ATIVA, StatusIgreja.EM_TESTE);

    private final IgrejaRepository igrejaRepository;
    private final UserRepository userRepository;
    private final IgrejaMapper igrejaMapper;
    private final AssinaturaIgrejaService assinaturaIgrejaService;

    @Value("${semear.upload-dir:${user.home}/semear-app/uploads}")
    private String uploadDir;

    public IgrejaService(
        IgrejaRepository igrejaRepository,
        UserRepository userRepository,
        IgrejaMapper igrejaMapper,
        AssinaturaIgrejaService assinaturaIgrejaService
    ) {
        this.igrejaRepository = igrejaRepository;
        this.userRepository = userRepository;
        this.igrejaMapper = igrejaMapper;
        this.assinaturaIgrejaService = assinaturaIgrejaService;
    }

    public record LogoArquivo(byte[] bytes, String contentType) {}

    @Transactional(readOnly = true)
    public Optional<IgrejaDTO> findOne(Long id) {
        return igrejaRepository.findById(id).map(igrejaMapper::toDto);
    }

    @Transactional(readOnly = true)
    public List<IgrejaDTO> buscarComFiltros(String nome, String cnpj, String cidade, StatusIgreja status) {
        Specification<Igreja> spec = Specification.allOf();

        if (nome != null && !nome.isBlank()) {
            String termo = "%" + nome.trim().toLowerCase() + "%";
            spec = spec.and(
                (root, query, cb) ->
                    cb.or(
                        cb.like(cb.lower(root.get("nome")), termo),
                        cb.like(cb.lower(cb.coalesce(root.get("nomeFantasia"), "")), termo)
                    )
            );
        }
        if (cnpj != null && !cnpj.isBlank()) {
            String termo = "%" + cnpj.trim() + "%";
            spec = spec.and((root, query, cb) -> cb.like(root.get("cnpj"), termo));
        }
        if (cidade != null && !cidade.isBlank()) {
            String termo = "%" + cidade.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("cidade")), termo));
        }
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }

        return igrejaRepository
            .findAll(spec, Sort.by(Sort.Direction.ASC, "nome"))
            .stream()
            .map(igrejaMapper::toDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public Optional<IgrejaPublicaDTO> obterConfiguracaoPublica() {
        return obterPrimeiraIgrejaOperacional().map(igrejaMapper::toPublicaDto);
    }

    @Transactional(readOnly = true)
    public List<IgrejaPublicaDTO> listarIgrejasParaPreCadastro() {
        return igrejaRepository
            .findByStatusIn(
                List.of(StatusIgreja.ATIVA, StatusIgreja.EM_TESTE),
                Sort.by(Sort.Direction.ASC, "nome")
            )
            .stream()
            .map(igrejaMapper::toPublicaDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public Optional<IgrejaDTO> obterIgrejaAtualDoUsuario() {
        return resolverIgrejaDoUsuarioLogado().map(igrejaMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Optional<IgrejaPixDTO> obterPixAtual() {
        return resolverIgrejaDoUsuarioLogado().map(igrejaMapper::toPixDto);
    }

    public IgrejaDTO salvar(IgrejaDTO dto) {
        Igreja igreja;
        if (dto.getId() == null) {
            igreja = igrejaMapper.toEntity(dto);
            igreja.setDataCadastro(Instant.now());
        } else {
            igreja = igrejaRepository
                .findById(dto.getId())
                .orElseThrow(() -> new BadRequestAlertException("Igreja não encontrada", ENTITY_NAME, "idnotfound"));
            aplicarDados(igreja, dto);
        }
        if (igreja.getStatus() == null) {
            igreja.setStatus(StatusIgreja.ATIVA);
        }
        if (igreja.getDataCadastro() == null) {
            igreja.setDataCadastro(Instant.now());
        }
        igreja.setDataAtualizacao(Instant.now());
        igreja = igrejaRepository.save(igreja);
        if (dto.getId() == null && igreja.getStatus() == StatusIgreja.EM_TESTE) {
            assinaturaIgrejaService.iniciarTesteGratis(igreja, dto.getNomeFantasia() != null ? dto.getNomeFantasia() : igreja.getNome());
        }
        return igrejaMapper.toDto(igreja);
    }

    public IgrejaDTO atualizarIgrejaAtual(IgrejaDTO dto) {
        Igreja igreja = resolverIgrejaDoUsuarioLogado()
            .orElseThrow(() -> new BadRequestAlertException("Usuário sem igreja vinculada", ENTITY_NAME, "semigreja"));
        validarAcessoIgreja(igreja);
        aplicarDados(igreja, dto);
        igreja.setDataAtualizacao(Instant.now());
        return igrejaMapper.toDto(igrejaRepository.save(igreja));
    }

    public IgrejaDTO atualizarConfiguracao(IgrejaDTO dto) {
        return atualizarIgrejaAtual(dto);
    }

    public IgrejaPixDTO atualizarPix(IgrejaPixDTO pixDto) {
        Igreja igreja = resolverIgrejaDoUsuarioLogado()
            .orElseThrow(() -> new BadRequestAlertException("Usuário sem igreja vinculada", ENTITY_NAME, "semigreja"));
        validarAcessoIgreja(igreja);
        igreja.setChavePix(pixDto.getChavePix());
        igreja.setTipoChavePix(pixDto.getTipoChavePix());
        igreja.setNomeTitularPix(pixDto.getNomeTitularPix());
        igreja.setBancoPix(pixDto.getBancoPix());
        igreja.setDocumentoTitularPix(pixDto.getDocumentoTitularPix());
        igreja.setTextoAgradecimentoOferta(pixDto.getTextoAgradecimentoOferta());
        igreja.setDataAtualizacao(Instant.now());
        return igrejaMapper.toPixDto(igrejaRepository.save(igreja));
    }

    public IgrejaDTO uploadLogo(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestAlertException("Arquivo vazio", ENTITY_NAME, "arquivovazio");
        }
        String contentType = file.getContentType();
        if (contentType == null || !isTipoImagemPermitido(contentType)) {
            throw new BadRequestAlertException("Use JPEG, PNG, GIF ou WebP", ENTITY_NAME, "tipoinvalido");
        }
        Igreja igreja = resolverIgrejaDoUsuarioLogado()
            .orElseThrow(() -> new BadRequestAlertException("Usuário sem igreja vinculada", ENTITY_NAME, "semigreja"));
        validarAcessoIgreja(igreja);
        try {
            String ext = extensaoPorContentType(contentType);
            Path dir = Paths.get(uploadDir, "igrejas", igreja.getId().toString()).toAbsolutePath().normalize();
            Files.createDirectories(dir);
            Path target = dir.resolve("logo." + ext);
            Files.write(target, file.getBytes());
            igreja.setLogoUrl("/api/igrejas/" + igreja.getId() + "/logo");
            igreja.setDataAtualizacao(Instant.now());
            return igrejaMapper.toDto(igrejaRepository.save(igreja));
        } catch (IOException e) {
            LOG.error("Erro ao salvar logo da igreja {}", igreja.getId(), e);
            throw new BadRequestAlertException("Erro ao salvar logo", ENTITY_NAME, "errosalvar");
        }
    }

    @Transactional(readOnly = true)
    public Optional<LogoArquivo> obterLogo(Long igrejaId) {
        Path dir = Paths.get(uploadDir, "igrejas", igrejaId.toString()).toAbsolutePath().normalize();
        if (!Files.isDirectory(dir)) {
            return Optional.empty();
        }
        try {
            Optional<Path> arquivo = Files.list(dir)
                .filter(p -> p.getFileName().toString().startsWith("logo."))
                .findFirst();
            if (arquivo.isEmpty()) {
                return Optional.empty();
            }
            Path path = arquivo.get();
            String nome = path.getFileName().toString();
            String ext = nome.substring(nome.lastIndexOf('.') + 1).toLowerCase();
            String contentType = contentTypePorExtensao(ext);
            return Optional.of(new LogoArquivo(Files.readAllBytes(path), contentType));
        } catch (IOException e) {
            LOG.warn("Erro ao ler logo da igreja {}", igrejaId, e);
            return Optional.empty();
        }
    }

    public IgrejaDTO atualizarPlanoLeitura(LocalDate dataInicio) {
        if (dataInicio == null) {
            throw new BadRequestAlertException("Data de início obrigatória", ENTITY_NAME, "dataobrigatoria");
        }
        Igreja igreja = resolverIgrejaDoUsuarioLogado()
            .orElseThrow(() -> new BadRequestAlertException("Usuário sem igreja vinculada", ENTITY_NAME, "semigreja"));
        validarAcessoIgreja(igreja);
        igreja.setDataInicioPlanoLeitura(dataInicio);
        if (igreja.getCicloPlanoLeitura() == null) {
            igreja.setCicloPlanoLeitura(1);
        }
        igreja.setDataAtualizacao(Instant.now());
        return igrejaMapper.toDto(igrejaRepository.save(igreja));
    }

    public IgrejaDTO reiniciarPlanoLeitura(LocalDate novaData) {
        Igreja igreja = resolverIgrejaDoUsuarioLogado()
            .orElseThrow(() -> new BadRequestAlertException("Usuário sem igreja vinculada", ENTITY_NAME, "semigreja"));
        validarAcessoIgreja(igreja);
        LocalDate data = novaData != null ? novaData : LocalDate.now();
        int ciclo = igreja.getCicloPlanoLeitura() != null ? igreja.getCicloPlanoLeitura() : 1;
        igreja.setCicloPlanoLeitura(ciclo + 1);
        igreja.setDataInicioPlanoLeitura(data);
        igreja.setDataAtualizacao(Instant.now());
        return igrejaMapper.toDto(igrejaRepository.save(igreja));
    }

    public IgrejaDTO atualizarIdentidadeVisual(IgrejaDTO dto) {
        Igreja igreja = resolverIgrejaDoUsuarioLogado()
            .orElseThrow(() -> new BadRequestAlertException("Usuário sem igreja vinculada", ENTITY_NAME, "semigreja"));
        validarAcessoIgreja(igreja);
        igreja.setLogoUrl(dto.getLogoUrl());
        igreja.setCorPrimaria(Constants.COR_PRIMARIA_PADRAO);
        igreja.setCorSecundaria(Constants.COR_SECUNDARIA_PADRAO);
        igreja.setTextoBoasVindas(dto.getTextoBoasVindas());
        igreja.setDescricaoIgreja(dto.getDescricaoIgreja());
        igreja.setSubtituloIgreja(dto.getSubtituloIgreja());
        igreja.setDataAtualizacao(Instant.now());
        return igrejaMapper.toDto(igrejaRepository.save(igreja));
    }

    public IgrejaDTO ativar(Long id) {
        return alterarStatus(id, StatusIgreja.ATIVA);
    }

    public IgrejaDTO inativar(Long id) {
        return alterarStatus(id, StatusIgreja.INATIVA);
    }

    public IgrejaDTO colocarEmTeste(Long id) {
        return alterarStatus(id, StatusIgreja.EM_TESTE);
    }

    private IgrejaDTO alterarStatus(Long id, StatusIgreja status) {
        Igreja igreja = igrejaRepository
            .findById(id)
            .orElseThrow(() -> new BadRequestAlertException("Igreja não encontrada", ENTITY_NAME, "idnotfound"));
        igreja.setStatus(status);
        igreja.setDataAtualizacao(Instant.now());
        return igrejaMapper.toDto(igrejaRepository.save(igreja));
    }

    private void validarAcessoIgreja(Igreja igreja) {
        if (SecurityUtils.hasCurrentUserAnyOfAuthorities(AuthoritiesConstants.SUPER_ADMIN)) {
            return;
        }
        if (
            !SecurityUtils.hasCurrentUserAnyOfAuthorities(
                AuthoritiesConstants.ADMIN_IGREJA,
                AuthoritiesConstants.ADMIN
            )
        ) {
            throw new BadRequestAlertException("Sem permissão para editar a igreja", ENTITY_NAME, "acessonegado");
        }
        User user = obterUsuarioLogado();
        if (user.getIgreja() == null || !user.getIgreja().getId().equals(igreja.getId())) {
            throw new BadRequestAlertException("Acesso negado à igreja", ENTITY_NAME, "acessonegado");
        }
    }

    private Optional<Igreja> resolverIgrejaDoUsuarioLogado() {
        if (SecurityUtils.hasCurrentUserAnyOfAuthorities(AuthoritiesConstants.SUPER_ADMIN)) {
            return obterPrimeiraIgrejaOperacional();
        }
        User user = obterUsuarioLogado();
        if (user.getIgreja() != null) {
            return Optional.of(user.getIgreja());
        }
        return obterPrimeiraIgrejaOperacional();
    }

    private Optional<Igreja> obterPrimeiraIgrejaOperacional() {
        return igrejaRepository
            .findByStatusIn(STATUS_IGREJA_OPERACIONAL, Sort.by(Sort.Direction.ASC, "id"))
            .stream()
            .findFirst();
    }

    private User obterUsuarioLogado() {
        String login = SecurityUtils
            .getCurrentUserLogin()
            .orElseThrow(() -> new BadRequestAlertException("Usuário não autenticado", ENTITY_NAME, "naoautenticado"));
        return userRepository
            .findOneWithAuthoritiesByLogin(login)
            .orElseThrow(() -> new BadRequestAlertException("Usuário não encontrado", ENTITY_NAME, "usuarionaoencontrado"));
    }

    private void aplicarDados(Igreja igreja, IgrejaDTO dto) {
        if (dto.getNome() != null) igreja.setNome(dto.getNome());
        if (dto.getNomeFantasia() != null) igreja.setNomeFantasia(dto.getNomeFantasia());
        if (dto.getCnpj() != null) igreja.setCnpj(dto.getCnpj());
        if (dto.getEmail() != null) igreja.setEmail(dto.getEmail());
        if (dto.getTelefone() != null) igreja.setTelefone(dto.getTelefone());
        if (dto.getCep() != null) igreja.setCep(dto.getCep());
        if (dto.getEndereco() != null) igreja.setEndereco(dto.getEndereco());
        if (dto.getNumero() != null) igreja.setNumero(dto.getNumero());
        if (dto.getBairro() != null) igreja.setBairro(dto.getBairro());
        if (dto.getCidade() != null) igreja.setCidade(dto.getCidade());
        if (dto.getEstado() != null) igreja.setEstado(dto.getEstado());
        if (dto.getComplemento() != null) igreja.setComplemento(dto.getComplemento());
        if (dto.getNomePastorResponsavel() != null) igreja.setNomePastorResponsavel(dto.getNomePastorResponsavel());
        if (dto.getCpfPastorResponsavel() != null) igreja.setCpfPastorResponsavel(dto.getCpfPastorResponsavel());
        if (dto.getTelefoneResponsavel() != null) igreja.setTelefoneResponsavel(dto.getTelefoneResponsavel());
        if (dto.getEmailResponsavel() != null) igreja.setEmailResponsavel(dto.getEmailResponsavel());
        if (dto.getChavePix() != null) igreja.setChavePix(dto.getChavePix());
        if (dto.getTipoChavePix() != null) igreja.setTipoChavePix(dto.getTipoChavePix());
        if (dto.getNomeTitularPix() != null) igreja.setNomeTitularPix(dto.getNomeTitularPix());
        if (dto.getBancoPix() != null) igreja.setBancoPix(dto.getBancoPix());
        if (dto.getDocumentoTitularPix() != null) igreja.setDocumentoTitularPix(dto.getDocumentoTitularPix());
        if (dto.getLogoUrl() != null) igreja.setLogoUrl(dto.getLogoUrl());
        if (dto.getTemaPreferido() != null) igreja.setTemaPreferido(dto.getTemaPreferido());
        if (dto.getTextoBoasVindas() != null) igreja.setTextoBoasVindas(dto.getTextoBoasVindas());
        if (dto.getDescricaoIgreja() != null) igreja.setDescricaoIgreja(dto.getDescricaoIgreja());
        if (dto.getTextoAgradecimentoOferta() != null) igreja.setTextoAgradecimentoOferta(dto.getTextoAgradecimentoOferta());
        if (dto.getDataInicioPlanoLeitura() != null) igreja.setDataInicioPlanoLeitura(dto.getDataInicioPlanoLeitura());
        if (dto.getStatus() != null && SecurityUtils.hasCurrentUserAnyOfAuthorities(AuthoritiesConstants.SUPER_ADMIN)) {
            igreja.setStatus(dto.getStatus());
        }
    }

    private boolean isTipoImagemPermitido(String contentType) {
        return (
            "image/jpeg".equals(contentType) ||
            "image/png".equals(contentType) ||
            "image/gif".equals(contentType) ||
            "image/webp".equals(contentType)
        );
    }

    private String extensaoPorContentType(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> "jpg";
            case "image/png" -> "png";
            case "image/gif" -> "gif";
            case "image/webp" -> "webp";
            default -> "png";
        };
    }

    private String contentTypePorExtensao(String ext) {
        return switch (ext) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            default -> "application/octet-stream";
        };
    }
}
