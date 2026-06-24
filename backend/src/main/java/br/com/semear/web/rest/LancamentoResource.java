package br.com.semear.web.rest;

import br.com.semear.domain.Lancamento;
import br.com.semear.domain.enumerations.TipoLancamento;
import br.com.semear.domain.enumeration.NivelAcessoModulo;
import br.com.semear.repository.LancamentoRepository;
import br.com.semear.security.SecurityUtils;
import br.com.semear.service.ModuleAccessService;
import br.com.semear.service.TenantService;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import jakarta.annotation.security.RolesAllowed;
import java.math.BigDecimal;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
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
    private final TenantService tenantService;
    private final ModuleAccessService moduleAccessService;

    public LancamentoResource(
        LancamentoRepository lancamentoRepository,
        TenantService tenantService,
        ModuleAccessService moduleAccessService
    ) {
        this.lancamentoRepository = lancamentoRepository;
        this.tenantService = tenantService;
        this.moduleAccessService = moduleAccessService;
    }

    @PostMapping("")
    @RolesAllowed({ "ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_TESOURARIA", "ROLE_PASTOR", "ROLE_SECRETARIA" })
    public ResponseEntity<Lancamento> createLancamento(@RequestBody Lancamento lancamento) throws URISyntaxException {
        moduleAccessService.assertModuleAccess("financeiro", NivelAcessoModulo.WRITE);
        LOG.debug("REST request to save Lancamento : {}", lancamento);
        if (lancamento.getId() != null) {
            throw new BadRequestAlertException("A new lancamento cannot already have an ID", ENTITY_NAME, "idexists");
        }
        validarLancamento(lancamento);
        lancamento.setIgreja(tenantService.resolverIgrejaParaCriacao());
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
    @RolesAllowed({ "ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_TESOURARIA", "ROLE_PASTOR", "ROLE_SECRETARIA" })
    public ResponseEntity<Lancamento> updateLancamento(@PathVariable("id") final Long id, @RequestBody Lancamento lancamento)
        throws URISyntaxException {
        moduleAccessService.assertModuleAccess("financeiro", NivelAcessoModulo.WRITE);
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
        Lancamento existente = existenteOpt.get();
        tenantService.validarMesmaIgreja(existente.getIgreja());
        validarLancamento(lancamento);
        existente.setTipo(lancamento.getTipo());
        existente.setCategoria(lancamento.getCategoria());
        existente.setDescricao(lancamento.getDescricao());
        existente.setValor(lancamento.getValor());
        existente.setDataLancamento(lancamento.getDataLancamento());
        existente.setMetodoPagamento(lancamento.getMetodoPagamento());
        existente.setReferencia(lancamento.getReferencia());
        existente.setObservacoes(lancamento.getObservacoes());
        existente.setCentroCusto(lancamento.getCentroCusto());
        existente.setAtualizadoEm(Instant.now());
        existente.setAtualizadoPor(SecurityUtils.getCurrentUserLogin().orElse("system"));

        Lancamento result = lancamentoRepository.save(existente);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @GetMapping("")
    @RolesAllowed({ "ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_TESOURARIA", "ROLE_PASTOR", "ROLE_SECRETARIA" })
    public ResponseEntity<List<Lancamento>> getAllLancamentos(
        @RequestParam(name = "tipo", required = false) TipoLancamento tipo
    ) {
        moduleAccessService.assertModuleAccess("financeiro", NivelAcessoModulo.READ);
        LOG.debug("REST request to get Lancamentos");
        Long igrejaId = tenantService.getIgrejaIdAtual();
        List<Lancamento> lista = tipo != null
            ? lancamentoRepository.findByIgrejaIdAndTipoOrderByDataLancamentoDescCriadoEmDesc(igrejaId, tipo)
            : lancamentoRepository.findByIgrejaIdOrderByDataLancamentoDescCriadoEmDesc(igrejaId);
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/export/csv")
    @RolesAllowed({ "ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_TESOURARIA", "ROLE_PASTOR", "ROLE_SECRETARIA" })
    public ResponseEntity<byte[]> exportarCsvMesAtual() {
        moduleAccessService.assertModuleAccess("financeiro", NivelAcessoModulo.READ);
        Long igrejaId = tenantService.getIgrejaIdAtual();
        YearMonth mesAtual = YearMonth.now();
        LocalDate inicio = mesAtual.atDay(1);
        LocalDate fim = mesAtual.atEndOfMonth();
        List<Lancamento> lancamentos = lancamentoRepository.findByIgrejaIdAndPeriodo(igrejaId, inicio, fim);

        StringBuilder csv = new StringBuilder();
        csv.append("id,tipo,categoria,descricao,valor,data_lancamento,centro_custo,metodo_pagamento,referencia\n");
        for (Lancamento l : lancamentos) {
            csv.append(l.getId()).append(',');
            csv.append(escapeCsv(l.getTipo() != null ? l.getTipo().name() : "")).append(',');
            csv.append(escapeCsv(l.getCategoria())).append(',');
            csv.append(escapeCsv(l.getDescricao())).append(',');
            csv.append(formatValor(l.getValor())).append(',');
            csv.append(l.getDataLancamento()).append(',');
            csv.append(escapeCsv(l.getCentroCusto())).append(',');
            csv.append(escapeCsv(l.getMetodoPagamento())).append(',');
            csv.append(escapeCsv(l.getReferencia())).append('\n');
        }

        byte[] bytes = csv.toString().getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
            .header("Content-Disposition", "attachment; filename=lancamentos-" + mesAtual + ".csv")
            .header("Content-Type", "text/csv; charset=UTF-8")
            .body(bytes);
    }

    @GetMapping("/{id}")
    @RolesAllowed({ "ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_TESOURARIA", "ROLE_PASTOR", "ROLE_SECRETARIA" })
    public ResponseEntity<Lancamento> getLancamento(@PathVariable("id") final Long id) {
        moduleAccessService.assertModuleAccess("financeiro", NivelAcessoModulo.READ);
        LOG.debug("REST request to get Lancamento : {}", id);
        Optional<Lancamento> lancamento = lancamentoRepository.findById(id);
        lancamento.ifPresent(l -> tenantService.validarMesmaIgreja(l.getIgreja()));
        return ResponseUtil.wrapOrNotFound(lancamento);
    }

    @DeleteMapping("/{id}")
    @RolesAllowed({ "ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_TESOURARIA", "ROLE_PASTOR", "ROLE_COPASTOR", "ROLE_SECRETARIA", "ROLE_LIDER" })
    public ResponseEntity<Void> deleteLancamento(@PathVariable("id") final Long id) {
        moduleAccessService.assertModuleAccess("financeiro", NivelAcessoModulo.WRITE);
        LOG.debug("REST request to delete Lancamento : {}", id);
        lancamentoRepository.findById(id).ifPresent(l -> {
            tenantService.validarMesmaIgreja(l.getIgreja());
            lancamentoRepository.delete(l);
        });
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

    private String escapeCsv(String value) {
        if (value == null) {
            return "";
        }
        String escaped = value.replace("\"", "\"\"");
        if (escaped.contains(",") || escaped.contains("\"") || escaped.contains("\n")) {
            return "\"" + escaped + "\"";
        }
        return escaped;
    }

    private String formatValor(BigDecimal valor) {
        return valor != null ? valor.toPlainString() : "0";
    }
}
