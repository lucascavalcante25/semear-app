package br.com.semear.web.rest;

import br.com.semear.service.PublicIgrejaSiteService;
import br.com.semear.service.dto.IgrejaSitePublicoDTO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/igrejas")
public class PublicIgrejaSiteResource {

    private final PublicIgrejaSiteService publicIgrejaSiteService;

    public PublicIgrejaSiteResource(PublicIgrejaSiteService publicIgrejaSiteService) {
        this.publicIgrejaSiteService = publicIgrejaSiteService;
    }

    @GetMapping("/{slug}")
    public IgrejaSitePublicoDTO obterPorSlug(@PathVariable String slug) {
        return publicIgrejaSiteService.obterPorSlug(slug);
    }
}
