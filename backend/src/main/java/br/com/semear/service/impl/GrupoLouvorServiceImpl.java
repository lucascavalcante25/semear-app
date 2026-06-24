package br.com.semear.service.impl;

import br.com.semear.domain.GrupoLouvor;
import br.com.semear.domain.GrupoLouvorItem;
import br.com.semear.domain.Louvor;
import br.com.semear.repository.GrupoLouvorItemRepository;
import br.com.semear.repository.GrupoLouvorRepository;
import br.com.semear.repository.LouvorRepository;
import br.com.semear.service.GrupoLouvorService;
import br.com.semear.service.TenantService;
import br.com.semear.service.dto.GrupoLouvorDTO;
import br.com.semear.service.mapper.GrupoLouvorMapper;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class GrupoLouvorServiceImpl implements GrupoLouvorService {

    private static final Logger log = LoggerFactory.getLogger(GrupoLouvorServiceImpl.class);
    private static final String ENTITY = "grupoLouvor";

    @PersistenceContext
    private EntityManager entityManager;

    private final GrupoLouvorRepository grupoRepository;
    private final GrupoLouvorItemRepository itemRepository;
    private final LouvorRepository louvorRepository;
    private final GrupoLouvorMapper mapper;
    private final TenantService tenantService;

    public GrupoLouvorServiceImpl(
        GrupoLouvorRepository grupoRepository,
        GrupoLouvorItemRepository itemRepository,
        LouvorRepository louvorRepository,
        GrupoLouvorMapper mapper,
        TenantService tenantService
    ) {
        this.grupoRepository = grupoRepository;
        this.itemRepository = itemRepository;
        this.louvorRepository = louvorRepository;
        this.mapper = mapper;
        this.tenantService = tenantService;
    }

    @Override
    public GrupoLouvorDTO save(GrupoLouvorDTO dto) {
        log.debug("Request to save GrupoLouvor : {}", dto);
        GrupoLouvor grupo = mapper.toEntity(dto);
        if (grupo.getOrdem() == null) {
            long count = grupoRepository.count();
            grupo.setOrdem((int) count);
        }
        if (grupo.getIgreja() == null) {
            grupo.setIgreja(tenantService.resolverIgrejaParaCriacao());
        }
        grupo = grupoRepository.save(grupo);
        return mapper.toDto(grupo);
    }

    @Override
    public GrupoLouvorDTO update(GrupoLouvorDTO dto) {
        log.debug("Request to update GrupoLouvor : {}", dto);
        GrupoLouvor grupo = obterGrupoDoTenant(dto.getId());
        grupo.setNome(dto.getNome());
        grupo.setOrdem(dto.getOrdem() != null ? dto.getOrdem() : grupo.getOrdem());
        grupo = grupoRepository.save(grupo);
        return mapper.toDto(grupo);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GrupoLouvorDTO> findAll() {
        return grupoRepository.findAllByIgrejaIdWithItensOrderByOrdemAsc(tenantService.getIgrejaIdAtual()).stream()
            .map(mapper::toDto)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<GrupoLouvorDTO> findOne(Long id) {
        return grupoRepository.findByIdAndIgrejaIdWithItens(id, tenantService.getIgrejaIdAtual()).map(mapper::toDto);
    }

    @Override
    public void delete(Long id) {
        log.debug("Request to delete GrupoLouvor : {}", id);
        obterGrupoDoTenant(id);
        itemRepository.deleteByGrupoId(id);
        grupoRepository.deleteById(id);
    }

    @Override
    public GrupoLouvorDTO addLouvor(Long grupoId, Long louvorId) {
        log.debug("Request to add louvor {} to grupo {}", louvorId, grupoId);
        GrupoLouvor grupo = obterGrupoDoTenant(grupoId);
        Louvor louvor = louvorRepository.findById(louvorId)
            .orElseThrow(() -> new IllegalArgumentException("Louvor não encontrado: " + louvorId));
        tenantService.validarMesmaIgreja(louvor.getIgreja());

        if (itemRepository.findByGrupoIdAndLouvorId(grupoId, louvorId).isPresent()) {
            throw new IllegalArgumentException("Este louvor já está no grupo.");
        }

        int nextOrdem = itemRepository.findByGrupoIdOrderByOrdemAsc(grupoId).size();
        GrupoLouvorItem item = new GrupoLouvorItem();
        item.setGrupo(grupo);
        item.setLouvor(louvor);
        item.setOrdem(nextOrdem);
        itemRepository.save(item);

        return mapper.toDto(
            grupoRepository.findByIdAndIgrejaIdWithItens(grupoId, tenantService.getIgrejaIdAtual()).orElse(grupo)
        );
    }

    @Override
    public void removeLouvor(Long grupoId, Long louvorId) {
        log.debug("Request to remove louvor {} from grupo {}", louvorId, grupoId);
        obterGrupoDoTenant(grupoId);
        GrupoLouvorItem item = itemRepository.findByGrupoIdAndLouvorId(grupoId, louvorId)
            .orElseThrow(() -> new IllegalArgumentException("Louvor não está no grupo."));
        itemRepository.delete(item);
    }

    @Override
    public GrupoLouvorDTO reorderLouvores(Long grupoId, List<Long> louvorIdsInOrder) {
        log.debug("Request to reorder louvores in grupo {}: {}", grupoId, louvorIdsInOrder);
        obterGrupoDoTenant(grupoId);
        if (louvorIdsInOrder == null || louvorIdsInOrder.isEmpty()) {
            return grupoRepository.findByIdAndIgrejaIdWithItens(grupoId, tenantService.getIgrejaIdAtual())
                .map(mapper::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Grupo não encontrado: " + grupoId));
        }

        List<GrupoLouvorItem> itens = itemRepository.findByGrupoIdOrderByOrdemAsc(grupoId);
        if (itens.isEmpty()) {
            return grupoRepository.findByIdAndIgrejaIdWithItens(grupoId, tenantService.getIgrejaIdAtual())
                .map(mapper::toDto)
                .orElseThrow(() -> new IllegalArgumentException("Grupo não encontrado: " + grupoId));
        }

        for (int i = 0; i < louvorIdsInOrder.size(); i++) {
            Long louvorId = louvorIdsInOrder.get(i);
            for (GrupoLouvorItem item : itens) {
                if (item.getLouvor() != null && louvorId.equals(item.getLouvor().getId())) {
                    item.setOrdem(i);
                    itemRepository.save(item);
                    break;
                }
            }
        }
        entityManager.flush();
        return grupoRepository.findByIdAndIgrejaIdWithItens(grupoId, tenantService.getIgrejaIdAtual())
            .map(mapper::toDto)
            .orElseThrow(() -> new IllegalArgumentException("Grupo não encontrado: " + grupoId));
    }

    private GrupoLouvor obterGrupoDoTenant(Long id) {
        return grupoRepository
            .findByIdAndIgrejaId(id, tenantService.getIgrejaIdAtual())
            .orElseThrow(() -> new BadRequestAlertException("Grupo de louvor não encontrado", ENTITY, "naoencontrado"));
    }
}
