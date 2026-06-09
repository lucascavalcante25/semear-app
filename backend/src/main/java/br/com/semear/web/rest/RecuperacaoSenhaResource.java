package br.com.semear.web.rest;

import br.com.semear.service.RecuperacaoSenhaService;
import br.com.semear.service.dto.RecuperacaoSenhaConcluirDTO;
import br.com.semear.service.dto.RecuperacaoSenhaIniciarDTO;
import br.com.semear.service.dto.RecuperacaoSenhaRespostaDTO;
import br.com.semear.service.dto.RecuperacaoSenhaValidarDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recuperacao-senha")
public class RecuperacaoSenhaResource {

    private static final Logger LOG = LoggerFactory.getLogger(RecuperacaoSenhaResource.class);

    private final RecuperacaoSenhaService recuperacaoSenhaService;

    public RecuperacaoSenhaResource(RecuperacaoSenhaService recuperacaoSenhaService) {
        this.recuperacaoSenhaService = recuperacaoSenhaService;
    }

    @PostMapping("/iniciar")
    public ResponseEntity<RecuperacaoSenhaRespostaDTO> iniciar(@RequestBody RecuperacaoSenhaIniciarDTO dto) {
        LOG.debug("REST request to start password recovery");
        return ResponseEntity.ok(recuperacaoSenhaService.iniciar(dto));
    }

    @PostMapping("/validar")
    public ResponseEntity<RecuperacaoSenhaRespostaDTO> validar(@RequestBody RecuperacaoSenhaValidarDTO dto) {
        LOG.debug("REST request to validate password recovery code");
        return ResponseEntity.ok(recuperacaoSenhaService.validar(dto));
    }

    @PostMapping("/concluir")
    public ResponseEntity<RecuperacaoSenhaRespostaDTO> concluir(@RequestBody RecuperacaoSenhaConcluirDTO dto) {
        LOG.debug("REST request to finish password recovery");
        return ResponseEntity.ok(recuperacaoSenhaService.concluir(dto));
    }
}
