package br.com.semear.web.rest;

import br.com.semear.domain.enumeration.NivelAcessoModulo;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.service.EventoService;
import br.com.semear.service.ModuleAccessService;
import br.com.semear.service.dto.EventoDTO;
import br.com.semear.service.dto.EventoFiltroDTO;
import br.com.semear.service.dto.EventoInscricaoDTO;
import jakarta.annotation.security.RolesAllowed;
import java.net.URI;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api/eventos")
public class EventoResource {

    private final EventoService eventoService;
    private final ModuleAccessService moduleAccessService;

    public EventoResource(EventoService eventoService, ModuleAccessService moduleAccessService) {
        this.eventoService = eventoService;
        this.moduleAccessService = moduleAccessService;
    }

    @GetMapping("")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.SECRETARIA,
        AuthoritiesConstants.MEMBRO,
    })
    public List<EventoDTO> listar(
        @RequestParam(required = false) String busca,
        @RequestParam(required = false) String categoria,
        @RequestParam(required = false) String publico,
        @RequestParam(required = false) Boolean inscricoesAbertas,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String periodo
    ) {
        moduleAccessService.assertModuleAccess("eventos", NivelAcessoModulo.READ);
        return eventoService.listar(montarFiltro(busca, categoria, publico, inscricoesAbertas, status, periodo));
    }

    @GetMapping("/proximos")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.SECRETARIA,
        AuthoritiesConstants.MEMBRO,
    })
    public List<EventoDTO> listarProximos() {
        moduleAccessService.assertModuleAccess("eventos", NivelAcessoModulo.READ);
        return eventoService.listarProximos();
    }

    @GetMapping("/passados")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.SECRETARIA,
        AuthoritiesConstants.MEMBRO,
    })
    public List<EventoDTO> listarPassados() {
        moduleAccessService.assertModuleAccess("eventos", NivelAcessoModulo.READ);
        return eventoService.listarPassados();
    }

    @GetMapping("/minhas-inscricoes")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.SECRETARIA,
        AuthoritiesConstants.MEMBRO,
    })
    public List<EventoDTO> listarMinhasInscricoes() {
        moduleAccessService.assertModuleAccess("eventos", NivelAcessoModulo.READ);
        return eventoService.listarMinhasInscricoes();
    }

    @GetMapping("/{id}")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.SECRETARIA,
        AuthoritiesConstants.MEMBRO,
    })
    public ResponseEntity<EventoDTO> obter(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("eventos", NivelAcessoModulo.READ);
        return ResponseUtil.wrapOrNotFound(eventoService.obter(id));
    }

    @GetMapping("/{id}/inscricoes")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.SECRETARIA,
    })
    public List<EventoInscricaoDTO> listarInscritos(
        @PathVariable Long id,
        @RequestParam(required = false) String filtro,
        @RequestParam(required = false) String busca
    ) {
        moduleAccessService.assertModuleAccess("eventos", NivelAcessoModulo.WRITE);
        return eventoService.listarInscritos(id, filtro, busca);
    }

    @GetMapping("/{id}/inscricoes/export")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.SECRETARIA,
    })
    public ResponseEntity<String> exportarInscritos(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("eventos", NivelAcessoModulo.WRITE);
        String csv = eventoService.exportarInscritosCsv(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"inscritos-evento-" + id + ".csv\"");
        return new ResponseEntity<>(csv, headers, HttpStatus.OK);
    }

    @PostMapping("")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.SECRETARIA,
    })
    public ResponseEntity<EventoDTO> criar(@RequestBody EventoDTO dto) {
        moduleAccessService.assertModuleAccess("eventos", NivelAcessoModulo.WRITE);
        EventoDTO result = eventoService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).location(URI.create("/api/eventos/" + result.getId())).body(result);
    }

    @PutMapping("/{id}")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.SECRETARIA,
    })
    public ResponseEntity<EventoDTO> atualizar(@PathVariable Long id, @RequestBody EventoDTO dto) {
        moduleAccessService.assertModuleAccess("eventos", NivelAcessoModulo.WRITE);
        return ResponseEntity.ok(eventoService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.SECRETARIA,
    })
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("eventos", NivelAcessoModulo.WRITE);
        eventoService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/inscrever")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.SECRETARIA,
        AuthoritiesConstants.MEMBRO,
    })
    public ResponseEntity<EventoInscricaoDTO> inscrever(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("eventos", NivelAcessoModulo.READ);
        return ResponseEntity.status(HttpStatus.CREATED).body(eventoService.inscrever(id));
    }

    @DeleteMapping("/{id}/inscrever")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.SECRETARIA,
        AuthoritiesConstants.MEMBRO,
    })
    public ResponseEntity<Void> desinscrever(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("eventos", NivelAcessoModulo.READ);
        eventoService.desinscrever(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/inscricoes/{inscricaoId}/check-in")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.SECRETARIA,
    })
    public ResponseEntity<EventoInscricaoDTO> checkIn(@PathVariable Long id, @PathVariable Long inscricaoId) {
        moduleAccessService.assertModuleAccess("eventos", NivelAcessoModulo.WRITE);
        return ResponseEntity.ok(eventoService.checkIn(id, inscricaoId));
    }

    @PatchMapping("/{id}/inscricoes/check-in-lote")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.SECRETARIA,
    })
    public ResponseEntity<List<EventoInscricaoDTO>> checkInLote(@PathVariable Long id, @RequestBody Map<String, List<Long>> body) {
        moduleAccessService.assertModuleAccess("eventos", NivelAcessoModulo.WRITE);
        List<Long> ids = body != null ? body.get("ids") : null;
        return ResponseEntity.ok(eventoService.checkInLote(id, ids));
    }

    @PostMapping("/{id}/banner")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.SECRETARIA,
    })
    public ResponseEntity<EventoDTO> uploadBanner(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        moduleAccessService.assertModuleAccess("eventos", NivelAcessoModulo.WRITE);
        return ResponseEntity.ok(eventoService.uploadBanner(id, file));
    }

    @GetMapping("/{id}/banner")
    public ResponseEntity<byte[]> obterBanner(@PathVariable Long id) {
        return eventoService
            .obterBanner(id)
            .map(banner ->
                ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(banner.contentType()))
                    .header(HttpHeaders.CACHE_CONTROL, "max-age=3600")
                    .body(banner.bytes())
            )
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}/banner")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.SECRETARIA,
    })
    public ResponseEntity<EventoDTO> removerBanner(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("eventos", NivelAcessoModulo.WRITE);
        return ResponseEntity.ok(eventoService.removerBanner(id));
    }

    private EventoFiltroDTO montarFiltro(
        String busca,
        String categoria,
        String publico,
        Boolean inscricoesAbertas,
        String status,
        String periodo
    ) {
        EventoFiltroDTO filtro = new EventoFiltroDTO();
        filtro.setBusca(busca);
        if (categoria != null && !categoria.isBlank()) {
            filtro.setCategoria(br.com.semear.domain.enumeration.CategoriaEvento.valueOf(categoria));
        }
        if (publico != null && !publico.isBlank()) {
            filtro.setPublico(br.com.semear.domain.enumeration.PublicoEvento.valueOf(publico));
        }
        filtro.setInscricoesAbertas(inscricoesAbertas);
        if (status != null && !status.isBlank()) {
            filtro.setStatus(br.com.semear.domain.enumeration.StatusEvento.valueOf(status));
        }
        filtro.setPeriodo(periodo);
        return filtro;
    }
}
