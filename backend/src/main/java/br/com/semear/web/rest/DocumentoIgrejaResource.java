package br.com.semear.web.rest;

import br.com.semear.domain.enumeration.CategoriaDocumentoIgreja;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.service.DocumentoIgrejaService;
import br.com.semear.service.dto.DocumentoIgrejaDTO;
import jakarta.annotation.security.RolesAllowed;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api/igreja/documentos")
public class DocumentoIgrejaResource {

    private static final Logger LOG = LoggerFactory.getLogger(DocumentoIgrejaResource.class);

    private final DocumentoIgrejaService documentoIgrejaService;

    public DocumentoIgrejaResource(DocumentoIgrejaService documentoIgrejaService) {
        this.documentoIgrejaService = documentoIgrejaService;
    }

    @GetMapping("")
    @RolesAllowed({ AuthoritiesConstants.ADMIN, AuthoritiesConstants.ADMIN_IGREJA })
    public List<DocumentoIgrejaDTO> listar(
        @RequestParam(required = false) String nome,
        @RequestParam(required = false) CategoriaDocumentoIgreja categoria,
        @RequestParam(required = false) String tipoArquivo,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim
    ) {
        LOG.debug("REST request to list DocumentoIgreja");
        return documentoIgrejaService.listar(nome, categoria, tipoArquivo, dataInicio, dataFim);
    }

    @GetMapping("/{id}")
    @RolesAllowed({ AuthoritiesConstants.ADMIN, AuthoritiesConstants.ADMIN_IGREJA })
    public ResponseEntity<DocumentoIgrejaDTO> obter(@PathVariable Long id) {
        LOG.debug("REST request to get DocumentoIgreja : {}", id);
        return ResponseUtil.wrapOrNotFound(documentoIgrejaService.obter(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @RolesAllowed({ AuthoritiesConstants.ADMIN, AuthoritiesConstants.ADMIN_IGREJA })
    public ResponseEntity<DocumentoIgrejaDTO> criar(
        @RequestParam("arquivo") MultipartFile arquivo,
        @RequestParam("nome") String nome,
        @RequestParam("categoria") CategoriaDocumentoIgreja categoria,
        @RequestParam(value = "descricao", required = false) String descricao,
        @RequestParam(value = "dataDocumento", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataDocumento
    ) {
        LOG.debug("REST request to create DocumentoIgreja : {}", nome);
        DocumentoIgrejaDTO result = documentoIgrejaService.criar(nome, descricao, categoria, dataDocumento, arquivo);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PutMapping("/{id}")
    @RolesAllowed({ AuthoritiesConstants.ADMIN, AuthoritiesConstants.ADMIN_IGREJA })
    public ResponseEntity<DocumentoIgrejaDTO> atualizar(@PathVariable Long id, @RequestBody DocumentoIgrejaDTO dto) {
        LOG.debug("REST request to update DocumentoIgreja : {}", id);
        return ResponseEntity.ok(documentoIgrejaService.atualizarMetadados(id, dto));
    }

    @GetMapping("/{id}/download")
    @RolesAllowed({ AuthoritiesConstants.ADMIN, AuthoritiesConstants.ADMIN_IGREJA })
    public ResponseEntity<byte[]> download(@PathVariable Long id, @RequestParam(defaultValue = "false") boolean inline) {
        LOG.debug("REST request to download DocumentoIgreja : {}", id);
        return documentoIgrejaService
            .obterArquivo(id, inline)
            .map(arquivo -> {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.parseMediaType(arquivo.contentType()));
                ContentDisposition disposition = inline
                    ? ContentDisposition.inline().filename(arquivo.fileName(), StandardCharsets.UTF_8).build()
                    : ContentDisposition.attachment().filename(arquivo.fileName(), StandardCharsets.UTF_8).build();
                headers.setContentDisposition(disposition);
                return new ResponseEntity<>(arquivo.bytes(), headers, HttpStatus.OK);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @RolesAllowed({ AuthoritiesConstants.ADMIN, AuthoritiesConstants.ADMIN_IGREJA })
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        LOG.debug("REST request to delete DocumentoIgreja : {}", id);
        documentoIgrejaService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
