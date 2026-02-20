package br.com.semear.web.rest;

import br.com.semear.domain.Lancamento;
import br.com.semear.domain.enumerations.TipoLancamento;
import br.com.semear.repository.LancamentoRepository;
import br.com.semear.security.SecurityUtils;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import jakarta.annotation.security.RolesAllowed;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api/lancamentos")
@Transactional
public class LancamentoResource {

    private static final Logger LOG = LoggerFactory.getLogger(LancamentoResource.class);
    private static final String ENTITY_NAME = "lancamento";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final LancamentoRepository lancamentoRepository;

    public LancamentoResource(LancamentoRepository lancamentoRepository) {
        this.lancamentoRepository = lancamentoRepository;
    }

    @PostMapping("")
    @RolesAllowed({ "ROLE_ADMIN", "ROLE_TESOURARIA" })
    public ResponseEntity<Lancamento> createLancamento(@RequestBody Lancamento lancamento) throws URISyntaxException {
        LOG.debug("REST request to save Lancamento : {}", lancamento);
        if (lancamento.getId() != null) {
            throw new BadRequestAlertException("A new lancamento cannot already have an ID", ENTITY_NAME, "idexists");
        }
        validarLancamento(lancamento);
        if (lancamento.getCriadoEm() == null) {
            lancamento.setCriadoEm(Instant.now());
        }
        if (lancamento.getCriadoPor() == null || lancamento.getCriadoPor().isBlank()) {
            lancamento.setCriadoPor(SecurityUtils.getCurrentUserLogin().orElse("system"));
        }
        Lancamento result = lancamentoRepository.save(lancamento);
        return ResponseEntity.created(new URI("/api/lancamentos/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @PutMapping("/{id}")
    @RolesAllowed({ "ROLE_ADMIN", "ROLE_TESOURARIA" })
    public ResponseEntity<Lancamento> updateLancamento(@PathVariable("id") final Long id, @RequestBody Lancamento lancamento)
        throws URISyntaxException {
        LOG.debug("REST request to update Lancamento : {}, {}", id, lancamento);
        if (lancamento.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, lancamento.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }
        Optional<Lancamento> existenteOpt = lancamentoRepository.findById(id);
        if (existenteOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        validarLancamento(lancamento);

        Lancamento existente = existenteOpt.get();
        existente.setTipo(lancamento.getTipo());
        existente.setCategoria(lancamento.getCategoria());
        existente.setDescricao(lancamento.getDescricao());
        existente.setValor(lancamento.getValor());
        existente.setDataLancamento(lancamento.getDataLancamento());
        existente.setMetodoPagamento(lancamento.getMetodoPagamento());
        existente.setReferencia(lancamento.getReferencia());
        existente.setObservacoes(lancamento.getObservacoes());
        existente.setAtualizadoEm(Instant.now());
        existente.setAtualizadoPor(SecurityUtils.getCurrentUserLogin().orElse("system"));

        Lancamento result = lancamentoRepository.save(existente);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @GetMapping("")
    @RolesAllowed({ "ROLE_ADMIN", "ROLE_TESOURARIA" })
    public ResponseEntity<List<Lancamento>> getAllLancamentos(
        @RequestParam(name = "tipo", required = false) TipoLancamento tipo
    ) {
        LOG.debug("REST request to get Lancamentos");
        List<Lancamento> lista = tipo != null
            ? lancamentoRepository.findByTipoOrderByDataLancamentoDescCriadoEmDesc(tipo)
            : lancamentoRepository.findAllByOrderByDataLancamentoDescCriadoEmDesc();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    @RolesAllowed({ "ROLE_ADMIN", "ROLE_TESOURARIA" })
    public ResponseEntity<Lancamento> getLancamento(@PathVariable("id") final Long id) {
        LOG.debug("REST request to get Lancamento : {}", id);
        Optional<Lancamento> lancamento = lancamentoRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(lancamento);
    }

    @DeleteMapping("/{id}")
    @RolesAllowed({ "ROLE_ADMIN", "ROLE_TESOURARIA" })
    public ResponseEntity<Void> deleteLancamento(@PathVariable("id") final Long id) {
        LOG.debug("REST request to delete Lancamento : {}", id);
        lancamentoRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    private void validarLancamento(Lancamento lancamento) {
        if (lancamento.getTipo() == null) {
            throw new BadRequestAlertException("Tipo é obrigatório.", ENTITY_NAME, "tipoobrigatorio");
        }
        if (lancamento.getCategoria() == null || lancamento.getCategoria().isBlank()) {
            throw new BadRequestAlertException("Categoria é obrigatória.", ENTITY_NAME, "categoriaobrigatoria");
        }
        if (lancamento.getDescricao() == null || lancamento.getDescricao().isBlank()) {
            throw new BadRequestAlertException("Descrição é obrigatória.", ENTITY_NAME, "descricaoobrigatoria");
        }
        if (lancamento.getValor() == null || lancamento.getValor().signum() < 0) {
            throw new BadRequestAlertException("Valor deve ser maior ou igual a zero.", ENTITY_NAME, "valorinvalido");
        }
        if (lancamento.getDataLancamento() == null) {
            throw new BadRequestAlertException("Data é obrigatória.", ENTITY_NAME, "dataobrigatoria");
        }
    }
}
