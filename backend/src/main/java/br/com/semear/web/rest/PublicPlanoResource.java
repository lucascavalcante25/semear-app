package br.com.semear.web.rest;

import br.com.semear.service.PlanoComercialService;
import br.com.semear.service.dto.PlanoPublicoDTO;
import java.util.concurrent.TimeUnit;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
public class PublicPlanoResource {

    private final PlanoComercialService planoComercialService;

    public PublicPlanoResource(PlanoComercialService planoComercialService) {
        this.planoComercialService = planoComercialService;
    }

    @GetMapping("/plano-lancamento")
    public ResponseEntity<PlanoPublicoDTO> obterPlanoLancamento() {
        return ResponseEntity.ok()
            .cacheControl(CacheControl.maxAge(1, TimeUnit.HOURS).cachePublic())
            .body(planoComercialService.obterPlanoPublico());
    }
}
