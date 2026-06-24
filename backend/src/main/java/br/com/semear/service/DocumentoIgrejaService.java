package br.com.semear.service;

import br.com.semear.domain.DocumentoIgreja;
import br.com.semear.domain.Igreja;
import br.com.semear.domain.User;
import br.com.semear.domain.enumeration.CategoriaDocumentoIgreja;
import br.com.semear.repository.DocumentoIgrejaRepository;
import br.com.semear.service.dto.DocumentoIgrejaDTO;
import br.com.semear.service.mapper.DocumentoIgrejaMapper;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class DocumentoIgrejaService {

    private static final Logger LOG = LoggerFactory.getLogger(DocumentoIgrejaService.class);
    private static final String ENTITY = "documentoIgreja";
    private static final long MAX_ARQUIVO_BYTES = 10L * 1024 * 1024;
    /** Preparado para limite futuro por plano — null = sem limite. */
    private static final Integer MAX_DOCUMENTOS_POR_IGREJA = null;

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    private static final Set<String> BLOCKED_EXTENSIONS = Set.of(
        ".exe",
        ".bat",
        ".sh",
        ".cmd",
        ".msi",
        ".dll",
        ".js",
        ".html",
        ".jar",
        ".php"
    );

    private final DocumentoIgrejaRepository documentoIgrejaRepository;
    private final DocumentoIgrejaMapper documentoIgrejaMapper;
    private final TenantService tenantService;

    @Value("${semear.upload-dir:${user.home}/semear-app/uploads}")
    private String uploadDir;

    public DocumentoIgrejaService(
        DocumentoIgrejaRepository documentoIgrejaRepository,
        DocumentoIgrejaMapper documentoIgrejaMapper,
        TenantService tenantService
    ) {
        this.documentoIgrejaRepository = documentoIgrejaRepository;
        this.documentoIgrejaMapper = documentoIgrejaMapper;
        this.tenantService = tenantService;
    }

    public record ArquivoDownload(byte[] bytes, String contentType, String fileName) {}

    @Transactional(readOnly = true)
    public List<DocumentoIgrejaDTO> listar(
        String nome,
        CategoriaDocumentoIgreja categoria,
        String tipoArquivo,
        LocalDate dataInicio,
        LocalDate dataFim
    ) {
        Long igrejaId = tenantService.getIgrejaIdAtual();
        List<DocumentoIgreja> documentos = documentoIgrejaRepository.findByIgrejaIdAndAtivoTrueOrderByDataUploadDesc(igrejaId);

        return documentos
            .stream()
            .filter(d -> filtrarPorNome(d, nome))
            .filter(d -> categoria == null || categoria.equals(d.getCategoria()))
            .filter(d -> tipoArquivo == null || tipoArquivo.isBlank() || tipoArquivo.equalsIgnoreCase(d.getTipoArquivo()))
            .filter(d -> filtrarPorData(d, dataInicio, dataFim))
            .map(documentoIgrejaMapper::toDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public Optional<DocumentoIgrejaDTO> obter(Long id) {
        return obterDocumentoDaIgrejaAtual(id).filter(DocumentoIgreja::getAtivo).map(documentoIgrejaMapper::toDto);
    }

    public DocumentoIgrejaDTO criar(
        String nome,
        String descricao,
        CategoriaDocumentoIgreja categoria,
        LocalDate dataDocumento,
        LocalDate dataValidade,
        MultipartFile arquivo
    ) {
        validarMetadadosCriacao(nome, descricao, categoria);
        if (arquivo == null || arquivo.isEmpty()) {
            throw new BadRequestAlertException("Arquivo obrigatório", ENTITY, "arquivoobrigatorio");
        }

        Igreja igreja = tenantService.resolverIgrejaParaCriacao();
        validarLimiteDocumentos(igreja.getId());

        User usuario = tenantService.getUsuarioAtual();
        validarArquivo(arquivo);

        String originalName = Objects.requireNonNullElse(arquivo.getOriginalFilename(), "documento");
        String ext = getExtension(originalName).toLowerCase();
        if (BLOCKED_EXTENSIONS.contains(ext)) {
            throw new BadRequestAlertException("Tipo de arquivo não permitido", ENTITY, "arquivoinvalido");
        }

        String storedName = UUID.randomUUID() + ext;
        String storedRelative = "igrejas/" + igreja.getId() + "/documentos/" + storedName;
        Path targetPath = Paths.get(uploadDir, storedRelative).toAbsolutePath().normalize();

        try {
            Files.createDirectories(targetPath.getParent());
            byte[] bytes = arquivo.getBytes();
            Files.write(targetPath, bytes);

            DocumentoIgreja documento = new DocumentoIgreja();
            documento.setIgreja(igreja);
            documento.setUsuarioUpload(usuario);
            documento.setNome(nome.trim());
            documento.setDescricao(descricao != null && !descricao.isBlank() ? descricao.trim() : null);
            documento.setCategoria(categoria);
            documento.setNomeArquivoOriginal(sanitizarNomeArquivo(originalName));
            documento.setNomeArquivoArmazenado(storedName);
            documento.setTipoArquivo(arquivo.getContentType());
            documento.setTamanhoArquivo((long) bytes.length);
            documento.setCaminhoArquivo(storedRelative);
            documento.setDataDocumento(dataDocumento);
            documento.setDataValidade(dataValidade);
            documento.setDataUpload(Instant.now());
            documento.setAtivo(true);

            return documentoIgrejaMapper.toDto(documentoIgrejaRepository.save(documento));
        } catch (IOException e) {
            LOG.error("Erro ao salvar documento da igreja {}", igreja.getId(), e);
            throw new BadRequestAlertException("Erro ao guardar arquivo", ENTITY, "erroarquivo");
        }
    }

    public DocumentoIgrejaDTO atualizarMetadados(Long id, DocumentoIgrejaDTO dto) {
        DocumentoIgreja documento = obterDocumentoDaIgrejaAtual(id)
            .filter(DocumentoIgreja::getAtivo)
            .orElseThrow(() -> new BadRequestAlertException("Documento não encontrado", ENTITY, "naoencontrado"));

        validarMetadadosAtualizacao(dto.getNome(), dto.getDescricao(), dto.getCategoria());

        documento.setNome(dto.getNome().trim());
        documento.setDescricao(dto.getDescricao() != null && !dto.getDescricao().isBlank() ? dto.getDescricao().trim() : null);
        documento.setCategoria(dto.getCategoria());
        documento.setDataDocumento(dto.getDataDocumento());
        documento.setDataValidade(dto.getDataValidade());
        documento.setDataAtualizacao(Instant.now());

        return documentoIgrejaMapper.toDto(documentoIgrejaRepository.save(documento));
    }

    @Transactional(readOnly = true)
    public List<DocumentoIgrejaDTO> listarVencendo(int dias) {
        Long igrejaId = tenantService.getIgrejaIdAtual();
        LocalDate hoje = LocalDate.now();
        LocalDate limite = hoje.plusDays(Math.max(dias, 1));
        return documentoIgrejaRepository
            .findByIgrejaIdAndAtivoTrueAndDataValidadeBetweenOrderByDataValidadeAsc(igrejaId, hoje, limite)
            .stream()
            .map(documentoIgrejaMapper::toDto)
            .toList();
    }

    public void excluir(Long id) {
        DocumentoIgreja documento = obterDocumentoDaIgrejaAtual(id)
            .filter(DocumentoIgreja::getAtivo)
            .orElseThrow(() -> new BadRequestAlertException("Documento não encontrado", ENTITY, "naoencontrado"));

        documento.setAtivo(false);
        documento.setDataAtualizacao(Instant.now());
        documentoIgrejaRepository.save(documento);
    }

    @Transactional(readOnly = true)
    public Optional<ArquivoDownload> obterArquivo(Long id, boolean inline) {
        DocumentoIgreja documento = obterDocumentoDaIgrejaAtual(id)
            .filter(DocumentoIgreja::getAtivo)
            .orElse(null);
        if (documento == null) {
            return Optional.empty();
        }

        Path path = resolverCaminhoSeguro(documento.getCaminhoArquivo());
        if (path == null || !Files.exists(path)) {
            return Optional.empty();
        }

        try {
            byte[] bytes = Files.readAllBytes(path);
            String fileName = documento.getNomeArquivoOriginal() != null ? documento.getNomeArquivoOriginal() : "documento";
            return Optional.of(new ArquivoDownload(bytes, documento.getTipoArquivo(), fileName));
        } catch (IOException e) {
            LOG.error("Erro ao ler documento {}", id, e);
            return Optional.empty();
        }
    }

    private Optional<DocumentoIgreja> obterDocumentoDaIgrejaAtual(Long id) {
        Long igrejaId = tenantService.getIgrejaIdAtual();
        return documentoIgrejaRepository.findByIdAndIgrejaId(id, igrejaId);
    }

    private Path resolverCaminhoSeguro(String caminhoRelativo) {
        if (caminhoRelativo == null || caminhoRelativo.isBlank()) {
            return null;
        }
        Path base = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path resolved = base.resolve(caminhoRelativo).normalize();
        if (!resolved.startsWith(base)) {
            LOG.warn("Tentativa de acesso a caminho inválido: {}", caminhoRelativo);
            return null;
        }
        return resolved;
    }

    private void validarLimiteDocumentos(Long igrejaId) {
        if (MAX_DOCUMENTOS_POR_IGREJA == null) {
            return;
        }
        long total = documentoIgrejaRepository.findByIgrejaIdAndAtivoTrueOrderByDataUploadDesc(igrejaId).size();
        if (total >= MAX_DOCUMENTOS_POR_IGREJA) {
            throw new BadRequestAlertException("Limite de documentos atingido", ENTITY, "limiteatingido");
        }
    }

    private void validarMetadadosCriacao(String nome, String descricao, CategoriaDocumentoIgreja categoria) {
        validarMetadadosAtualizacao(nome, descricao, categoria);
    }

    private void validarMetadadosAtualizacao(String nome, String descricao, CategoriaDocumentoIgreja categoria) {
        if (nome == null || nome.trim().length() < 3) {
            throw new BadRequestAlertException("Nome deve ter ao menos 3 caracteres", ENTITY, "nomecurto");
        }
        if (nome.trim().length() > 120) {
            throw new BadRequestAlertException("Nome muito longo", ENTITY, "nomelongo");
        }
        if (categoria == null) {
            throw new BadRequestAlertException("Categoria obrigatória", ENTITY, "categoriaobrigatoria");
        }
        if (descricao != null && descricao.trim().length() > 500) {
            throw new BadRequestAlertException("Descrição muito longa", ENTITY, "descricaolonga");
        }
    }

    private void validarArquivo(MultipartFile file) {
        if (file.getSize() > MAX_ARQUIVO_BYTES) {
            throw new BadRequestAlertException("Arquivo excede 10 MB", ENTITY, "arquivogrande");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestAlertException(
                "Tipo de arquivo não permitido. Use PDF, imagens ou documentos de escritório.",
                ENTITY,
                "tipoinvalido"
            );
        }
        String originalName = file.getOriginalFilename();
        if (originalName != null) {
            String ext = getExtension(originalName).toLowerCase();
            if (BLOCKED_EXTENSIONS.contains(ext)) {
                throw new BadRequestAlertException("Tipo de arquivo não permitido", ENTITY, "arquivoinvalido");
            }
        }
    }

    private boolean filtrarPorNome(DocumentoIgreja documento, String nome) {
        if (nome == null || nome.isBlank()) {
            return true;
        }
        return documento.getNome() != null && documento.getNome().toLowerCase().contains(nome.trim().toLowerCase());
    }

    private boolean filtrarPorData(DocumentoIgreja documento, LocalDate dataInicio, LocalDate dataFim) {
        LocalDate data = documento.getDataDocumento();
        if (dataInicio != null && (data == null || data.isBefore(dataInicio))) {
            return false;
        }
        if (dataFim != null && (data == null || data.isAfter(dataFim))) {
            return false;
        }
        return true;
    }

    private String getExtension(String filename) {
        int idx = filename.lastIndexOf('.');
        return idx >= 0 ? filename.substring(idx) : "";
    }

    private String sanitizarNomeArquivo(String name) {
        return name.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
