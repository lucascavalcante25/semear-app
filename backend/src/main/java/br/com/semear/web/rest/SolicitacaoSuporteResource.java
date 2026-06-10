package br.com.semear.web.rest;

import br.com.semear.domain.enumeration.StatusSolicitacaoSuporte;
import br.com.semear.domain.enumeration.TipoSolicitacaoSuporte;
import br.com.semear.service.SolicitacaoSuporteService;
import br.com.semear.service.dto.EnviarMensagemSuporteDTO;
import br.com.semear.service.dto.SolicitacaoSuporteDTO;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
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
@RequestMapping("/api/suporte")
public class SolicitacaoSuporteResource {

    private final SolicitacaoSuporteService solicitacaoSuporteService;

    public SolicitacaoSuporteResource(SolicitacaoSuporteService solicitacaoSuporteService) {
        this.solicitacaoSuporteService = solicitacaoSuporteService;
    }

    @GetMapping("/solicitacoes")
    public List<SolicitacaoSuporteDTO> listar(
        @RequestParam(required = false) StatusSolicitacaoSuporte status,
        @RequestParam(required = false) TipoSolicitacaoSuporte tipo,
        @RequestParam(required = false) String busca,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim
    ) {
        return solicitacaoSuporteService.listarDaIgreja(status, tipo, busca, dataInicio, dataFim);
    }

    @GetMapping("/solicitacoes/{id}")
    public ResponseEntity<SolicitacaoSuporteDTO> obter(@PathVariable Long id) {
        return ResponseUtil.wrapOrNotFound(solicitacaoSuporteService.obterDaIgreja(id));
    }

    @PostMapping("/solicitacoes")
    public ResponseEntity<SolicitacaoSuporteDTO> criar(@RequestBody SolicitacaoSuporteDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(solicitacaoSuporteService.criar(dto, null));
    }

    @PostMapping(value = "/solicitacoes/com-anexo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SolicitacaoSuporteDTO> criarComAnexo(
        @RequestPart("solicitacao") SolicitacaoSuporteDTO dto,
        @RequestPart(value = "anexos", required = false) MultipartFile[] anexos
    ) {
        List<MultipartFile> lista = anexos != null ? Arrays.asList(anexos) : List.of();
        return ResponseEntity.status(HttpStatus.CREATED).body(solicitacaoSuporteService.criar(dto, lista));
    }

    @PatchMapping("/solicitacoes/{id}/marcar-lida")
    public ResponseEntity<Void> marcarLida(@PathVariable Long id) {
        solicitacaoSuporteService.marcarComoLidaPeloCliente(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/solicitacoes/{id}/mensagens")
    public ResponseEntity<SolicitacaoSuporteDTO> enviarMensagem(@PathVariable Long id, @RequestBody EnviarMensagemSuporteDTO dto) {
        return ResponseEntity.ok(solicitacaoSuporteService.enviarMensagemCliente(id, dto.getTexto()));
    }

    @PatchMapping("/solicitacoes/{id}/cancelar")
    public ResponseEntity<SolicitacaoSuporteDTO> cancelar(
        @PathVariable Long id,
        @RequestBody(required = false) EnviarMensagemSuporteDTO dto
    ) {
        String motivo = dto != null ? dto.getTexto() : null;
        return ResponseEntity.ok(solicitacaoSuporteService.cancelarCliente(id, motivo));
    }

    @GetMapping("/solicitacoes/{id}/anexos/zip")
    public ResponseEntity<byte[]> downloadAnexosZip(@PathVariable Long id) {
        return solicitacaoSuporteService
            .obterZipAnexos(id, false)
            .map(a -> {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.parseMediaType(a.contentType()));
                headers.setContentDispositionFormData("attachment", a.fileName());
                return new ResponseEntity<>(a.bytes(), headers, HttpStatus.OK);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/solicitacoes/{id}/anexos/{anexoId}")
    public ResponseEntity<byte[]> downloadAnexo(
        @PathVariable Long id,
        @PathVariable Long anexoId,
        @RequestParam(defaultValue = "false") boolean inline
    ) {
        return montarRespostaAnexo(solicitacaoSuporteService.obterAnexo(id, anexoId, false), inline);
    }

    private ResponseEntity<byte[]> montarRespostaAnexo(
        java.util.Optional<SolicitacaoSuporteService.AnexoDownload> anexoOpt,
        boolean inline
    ) {
        return anexoOpt
            .map(a -> {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.parseMediaType(a.contentType()));
                if (inline) {
                    headers.setContentDisposition(
                        ContentDisposition.inline().filename(a.fileName(), StandardCharsets.UTF_8).build()
                    );
                } else {
                    headers.setContentDispositionFormData("attachment", a.fileName());
                }
                return new ResponseEntity<>(a.bytes(), headers, HttpStatus.OK);
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
