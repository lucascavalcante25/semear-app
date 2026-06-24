package br.com.semear.service;

import br.com.semear.domain.Celula;
import br.com.semear.domain.CelulaRelatorio;
import br.com.semear.repository.CelulaRelatorioRepository;
import br.com.semear.repository.CelulaRepository;
import br.com.semear.service.dto.CelulaRelatorioDTO;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CelulaRelatorioService {

    private static final String ENTITY = "celulaRelatorio";

    private final CelulaRelatorioRepository celulaRelatorioRepository;
    private final CelulaRepository celulaRepository;
    private final TenantService tenantService;

    public CelulaRelatorioService(
        CelulaRelatorioRepository celulaRelatorioRepository,
        CelulaRepository celulaRepository,
        TenantService tenantService
    ) {
        this.celulaRelatorioRepository = celulaRelatorioRepository;
        this.celulaRepository = celulaRepository;
        this.tenantService = tenantService;
    }

    @Transactional(readOnly = true)
    public List<CelulaRelatorioDTO> listar(Long celulaId) {
        Celula celula = obterCelula(celulaId);
        return celulaRelatorioRepository
            .findByCelulaIdAndIgrejaIdOrderByDataReuniaoDescCriadoEmDesc(celula.getId(), tenantService.getIgrejaIdAtual())
            .stream()
            .map(this::toDto)
            .toList();
    }

    public CelulaRelatorioDTO criar(Long celulaId, CelulaRelatorioDTO dto) {
        Celula celula = obterCelula(celulaId);
        validarDados(dto);
        CelulaRelatorio entity = new CelulaRelatorio();
        entity.setCelula(celula);
        entity.setIgreja(celula.getIgreja());
        entity.setDataReuniao(dto.getDataReuniao());
        entity.setPresentes(dto.getPresentes());
        entity.setVisitantes(dto.getVisitantes());
        entity.setObservacao(dto.getObservacao());
        entity.setCriadoEm(Instant.now());
        return toDto(celulaRelatorioRepository.save(entity));
    }

    private Celula obterCelula(Long celulaId) {
        return celulaRepository
            .findByIdAndIgrejaId(celulaId, tenantService.getIgrejaIdAtual())
            .orElseThrow(() -> new BadRequestAlertException("Célula não encontrada", ENTITY, "naoencontrado"));
    }

    private void validarDados(CelulaRelatorioDTO dto) {
        if (dto.getDataReuniao() == null) {
            throw new BadRequestAlertException("Data da reunião é obrigatória", ENTITY, "dataobrigatoria");
        }
        if (dto.getPresentes() == null || dto.getPresentes() < 0) {
            throw new BadRequestAlertException("Presentes inválido", ENTITY, "presentesinvalido");
        }
        if (dto.getVisitantes() == null || dto.getVisitantes() < 0) {
            throw new BadRequestAlertException("Visitantes inválido", ENTITY, "visitantesinvalido");
        }
    }

    private CelulaRelatorioDTO toDto(CelulaRelatorio entity) {
        CelulaRelatorioDTO dto = new CelulaRelatorioDTO();
        dto.setId(entity.getId());
        if (entity.getCelula() != null) {
            dto.setCelulaId(entity.getCelula().getId());
        }
        if (entity.getIgreja() != null) {
            dto.setIgrejaId(entity.getIgreja().getId());
        }
        dto.setDataReuniao(entity.getDataReuniao());
        dto.setPresentes(entity.getPresentes());
        dto.setVisitantes(entity.getVisitantes());
        dto.setObservacao(entity.getObservacao());
        dto.setCriadoEm(entity.getCriadoEm());
        return dto;
    }
}
