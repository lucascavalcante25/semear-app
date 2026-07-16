package br.com.semear.web.rest;

import br.com.semear.domain.enumeration.NivelAcessoModulo;
import br.com.semear.service.CultoAgendaService;
import br.com.semear.service.EscalaAutomacaoService;
import br.com.semear.service.ModuleAccessService;
import br.com.semear.service.dto.CultoAgendaItemDTO;
import br.com.semear.service.dto.CultoAgendaListaDTO;
import br.com.semear.service.dto.CultoCancelarDTO;
import br.com.semear.service.dto.CultoOcorrenciaSalvarDTO;
import br.com.semear.service.dto.CultoRegistroDTO;
import jakarta.annotation.security.RolesAllowed;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cultos")
public class CultoResource {

    private final CultoAgendaService cultoAgendaService;
    private final EscalaAutomacaoService escalaAutomacaoService;
    private final ModuleAccessService moduleAccessService;

    public CultoResource(
        CultoAgendaService cultoAgendaService,
        EscalaAutomacaoService escalaAutomacaoService,
        ModuleAccessService moduleAccessService
    ) {
        this.cultoAgendaService = cultoAgendaService;
        this.escalaAutomacaoService = escalaAutomacaoService;
        this.moduleAccessService = moduleAccessService;
    }

    @GetMapping("/modelos")
    @RolesAllowed({"ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_COPASTOR", "ROLE_LIDER", "ROLE_SECRETARIA", "ROLE_MEMBRO"})
    public ResponseEntity<List<CultoRegistroDTO>> listarModelos() {
        moduleAccessService.assertModuleAccess("cultos", NivelAcessoModulo.READ);
        return ResponseEntity.ok(escalaAutomacaoService.listarCultos());
    }

    @PutMapping("/modelos")
    @RolesAllowed({"ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_COPASTOR", "ROLE_LIDER", "ROLE_SECRETARIA"})
    public ResponseEntity<List<CultoRegistroDTO>> salvarModelos(@Valid @RequestBody List<CultoRegistroDTO> cultos) {
        moduleAccessService.assertModuleAccess("cultos", NivelAcessoModulo.WRITE);
        return ResponseEntity.ok(escalaAutomacaoService.salvarCultos(cultos));
    }

    @GetMapping("/agenda")
    @RolesAllowed({"ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_COPASTOR", "ROLE_LIDER", "ROLE_SECRETARIA", "ROLE_MEMBRO"})
    public ResponseEntity<CultoAgendaListaDTO> agenda() {
        moduleAccessService.assertModuleAccess("cultos", NivelAcessoModulo.READ);
        return ResponseEntity.ok(cultoAgendaService.listarAgenda());
    }

    @GetMapping("/agenda/detalhe")
    @RolesAllowed({"ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_COPASTOR", "ROLE_LIDER", "ROLE_SECRETARIA", "ROLE_MEMBRO"})
    public ResponseEntity<CultoAgendaItemDTO> detalhe(
        @RequestParam Long cultoRegistroId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data
    ) {
        moduleAccessService.assertModuleAccess("cultos", NivelAcessoModulo.READ);
        return ResponseEntity.ok(cultoAgendaService.obterDetalhe(cultoRegistroId, data));
    }

    @PutMapping("/agenda")
    @RolesAllowed({"ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_COPASTOR", "ROLE_LIDER", "ROLE_SECRETARIA"})
    public ResponseEntity<CultoAgendaItemDTO> salvarAgenda(@Valid @RequestBody CultoOcorrenciaSalvarDTO body) {
        moduleAccessService.assertModuleAccess("cultos", NivelAcessoModulo.WRITE);
        return ResponseEntity.ok(cultoAgendaService.salvarOcorrencia(body));
    }

    @PostMapping("/agenda/cancelar")
    @RolesAllowed({"ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_COPASTOR", "ROLE_LIDER", "ROLE_SECRETARIA"})
    public ResponseEntity<CultoAgendaItemDTO> cancelar(@Valid @RequestBody CultoCancelarDTO body) {
        moduleAccessService.assertModuleAccess("cultos", NivelAcessoModulo.WRITE);
        return ResponseEntity.ok(cultoAgendaService.cancelarOcorrencia(body));
    }

    @PostMapping("/agenda/reativar")
    @RolesAllowed({"ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_COPASTOR", "ROLE_LIDER", "ROLE_SECRETARIA"})
    public ResponseEntity<CultoAgendaItemDTO> reativar(@Valid @RequestBody CultoCancelarDTO body) {
        moduleAccessService.assertModuleAccess("cultos", NivelAcessoModulo.WRITE);
        return ResponseEntity.ok(cultoAgendaService.reativarOcorrencia(body));
    }

    @GetMapping("/grupos-louvor/{grupoId}/preview")
    @RolesAllowed({"ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_PASTOR", "ROLE_COPASTOR", "ROLE_LIDER", "ROLE_SECRETARIA"})
    public ResponseEntity<List<CultoAgendaItemDTO.CultoLouvorItemDTO>> previewGrupo(@PathVariable Long grupoId) {
        moduleAccessService.assertModuleAccess("cultos", NivelAcessoModulo.WRITE);
        return ResponseEntity.ok(cultoAgendaService.previewGrupoLouvor(grupoId));
    }
}
