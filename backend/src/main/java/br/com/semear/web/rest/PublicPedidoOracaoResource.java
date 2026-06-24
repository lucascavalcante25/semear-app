package br.com.semear.web.rest;

import br.com.semear.service.PedidoOracaoService;
import br.com.semear.service.dto.PedidoOracaoDTO;
import br.com.semear.service.dto.PedidoOracaoPublicoCriarDTO;
import java.net.URI;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/igrejas")
public class PublicPedidoOracaoResource {

    private final PedidoOracaoService pedidoOracaoService;

    public PublicPedidoOracaoResource(PedidoOracaoService pedidoOracaoService) {
        this.pedidoOracaoService = pedidoOracaoService;
    }

    @PostMapping("/{slug}/pedidos-oracao")
    public ResponseEntity<PedidoOracaoDTO> criarPedidoPublico(
        @PathVariable String slug,
        @RequestBody PedidoOracaoPublicoCriarDTO dto
    ) {
        PedidoOracaoDTO result = pedidoOracaoService.criarPublico(slug, dto);
        return ResponseEntity.created(URI.create("/api/public/igrejas/" + slug + "/pedidos-oracao/" + result.getId())).body(result);
    }
}
