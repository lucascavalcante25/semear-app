package br.com.semear.web.rest;

import br.com.semear.domain.enumeration.NivelAcessoModulo;
import br.com.semear.domain.enumeration.OrigemEscalaGeracao;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.service.EscalaAutomacaoService;
import br.com.semear.service.ModuleAccessService;
import br.com.semear.service.dto.*;
import jakarta.annotation.security.RolesAllowed;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/escalas/automacao")
public class EscalaAutomacaoResource {

    private final EscalaAutomacaoService escalaAutomacaoService;
    private final ModuleAccessService moduleAccessService;

    public EscalaAutomacaoResource(EscalaAutomacaoService escalaAutomacaoService, ModuleAccessService moduleAccessService) {
        this.escalaAutomacaoService = escalaAutomacaoService;
        this.moduleAccessService = moduleAccessService;
    }

    @GetMapping("/config")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.SECRETARIA,
        AuthoritiesConstants.LIDER,
    })
    public EscalaConfigAutomaticaDTO obterConfig() {
        moduleAccessService.assertModuleAccess("escalas", NivelAcessoModulo.READ);
        return escalaAutomacaoService.obterConfig();
    }

    @PutMapping("/config")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.SECRETARIA,
    })
    public EscalaConfigAutomaticaDTO salvarConfig(@RequestBody EscalaConfigAutomaticaDTO dto) {
        moduleAccessService.assertModuleAccess("escalas", NivelAcessoModulo.WRITE);
        return escalaAutomacaoService.salvarConfig(dto);
    }

    @GetMapping("/cultos")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.SECRETARIA,
        AuthoritiesConstants.LIDER,
    })
    public List<CultoRegistroDTO> listarCultos() {
        moduleAccessService.assertModuleAccess("escalas", NivelAcessoModulo.READ);
        return escalaAutomacaoService.listarCultos();
    }

    @PutMapping("/cultos")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.SECRETARIA,
    })
    public List<CultoRegistroDTO> salvarCultos(@RequestBody List<CultoRegistroDTO> cultos) {
        moduleAccessService.assertModuleAccess("escalas", NivelAcessoModulo.WRITE);
        return escalaAutomacaoService.salvarCultos(cultos);
    }

    @GetMapping("/geracoes")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.SECRETARIA,
        AuthoritiesConstants.LIDER,
    })
    public List<EscalaGeracaoDTO> listarGeracoes() {
        moduleAccessService.assertModuleAccess("escalas", NivelAcessoModulo.READ);
        return escalaAutomacaoService.listarGeracoes();
    }

    @GetMapping("/geracoes/{id}/escalas")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.SECRETARIA,
        AuthoritiesConstants.LIDER,
    })
    public List<EscalaDTO> listarEscalasDaGeracao(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("escalas", NivelAcessoModulo.READ);
        return escalaAutomacaoService.listarEscalasDaGeracao(id);
    }

    @PostMapping("/geracoes/gerar")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.SECRETARIA,
    })
    public ResponseEntity<EscalaGeracaoDTO> gerarProximoCiclo(@RequestBody(required = false) GerarCicloEscalasDTO body) {
        moduleAccessService.assertModuleAccess("escalas", NivelAcessoModulo.WRITE);
        return ResponseEntity.ok(escalaAutomacaoService.gerarProximoCiclo(OrigemEscalaGeracao.MANUAL, body));
    }

    @PostMapping("/geracoes/{id}/publicar")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.SECRETARIA,
    })
    public ResponseEntity<EscalaGeracaoDTO> publicar(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("escalas", NivelAcessoModulo.WRITE);
        return ResponseEntity.ok(escalaAutomacaoService.publicarGeracao(id));
    }

    @DeleteMapping("/geracoes/{id}")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.SECRETARIA,
    })
    public ResponseEntity<Void> descartarRascunho(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("escalas", NivelAcessoModulo.WRITE);
        escalaAutomacaoService.descartarGeracaoRascunho(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/geracoes/{id}/portaria-recepcao")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.SECRETARIA,
    })
    public ResponseEntity<Void> excluirEscalasPortariaRecepcao(@PathVariable Long id) {
        moduleAccessService.assertModuleAccess("escalas", NivelAcessoModulo.WRITE);
        escalaAutomacaoService.excluirEscalasPortariaRecepcaoDaGeracao(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/limpeza/lotes/{chave}/publicar")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.SECRETARIA,
    })
    public ResponseEntity<EscalaLimpezaLoteDTO> publicarLoteLimpeza(@PathVariable String chave) {
        moduleAccessService.assertModuleAccess("escalas", NivelAcessoModulo.WRITE);
        return ResponseEntity.ok(escalaAutomacaoService.publicarLoteLimpeza(chave));
    }

    @GetMapping("/limpeza/lotes/{chave}/escalas")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.SECRETARIA,
        AuthoritiesConstants.LIDER,
    })
    public List<EscalaDTO> listarEscalasDoLoteLimpeza(@PathVariable String chave) {
        moduleAccessService.assertModuleAccess("escalas", NivelAcessoModulo.READ);
        return escalaAutomacaoService.listarEscalasDoLoteLimpeza(chave);
    }

    @DeleteMapping("/limpeza/lotes/{chave}")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.SECRETARIA,
    })
    public ResponseEntity<Void> excluirLoteLimpeza(@PathVariable String chave) {
        moduleAccessService.assertModuleAccess("escalas", NivelAcessoModulo.WRITE);
        escalaAutomacaoService.excluirLoteLimpeza(chave);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/limpeza/lotes")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.SECRETARIA,
        AuthoritiesConstants.LIDER,
    })
    public List<EscalaLimpezaLoteDTO> listarLotesLimpeza() {
        moduleAccessService.assertModuleAccess("escalas", NivelAcessoModulo.READ);
        return escalaAutomacaoService.listarLotesLimpeza();
    }

    @GetMapping("/alertas-secretaria")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.SECRETARIA,
    })
    public List<EscalaAlertaSecretariaDTO> alertasSecretaria() {
        moduleAccessService.assertModuleAccess("escalas", NivelAcessoModulo.READ);
        return escalaAutomacaoService.alertasSecretaria();
    }

    @GetMapping("/avisos-login")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.SECRETARIA,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.MEMBRO,
        AuthoritiesConstants.TESOURARIA,
    })
    public List<EscalaLoginAvisoDTO> avisosLogin() {
        return escalaAutomacaoService.avisosLoginUsuario();
    }

    @PostMapping("/avisos-login/{escalaItemId}/visto")
    @RolesAllowed({
        AuthoritiesConstants.ADMIN,
        AuthoritiesConstants.ADMIN_IGREJA,
        AuthoritiesConstants.PASTOR,
        AuthoritiesConstants.COPASTOR,
        AuthoritiesConstants.SECRETARIA,
        AuthoritiesConstants.LIDER,
        AuthoritiesConstants.MEMBRO,
        AuthoritiesConstants.TESOURARIA,
    })
    public ResponseEntity<Void> marcarAvisoVisto(@PathVariable Long escalaItemId) {
        escalaAutomacaoService.marcarAvisoLoginVisto(escalaItemId);
        return ResponseEntity.noContent().build();
    }
}
