package br.com.semear.web.rest;

import br.com.semear.service.PlanoComercialService;
import br.com.semear.service.dto.PlanoPublicoDTO;
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
    public PlanoPublicoDTO obterPlanoLancamento() {
        return planoComercialService.obterPlanoPublico();
    }
}
