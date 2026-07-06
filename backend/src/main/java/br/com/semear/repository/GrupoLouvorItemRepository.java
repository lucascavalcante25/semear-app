package br.com.semear.repository;

import br.com.semear.domain.GrupoLouvorItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GrupoLouvorItemRepository extends JpaRepository<GrupoLouvorItem, Long> {

    List<GrupoLouvorItem> findByGrupoIdOrderByOrdemAsc(Long grupoId);

    @Query("SELECT i.louvor.id FROM GrupoLouvorItem i WHERE i.grupo.id = :grupoId ORDER BY i.ordem ASC")
    List<Long> findLouvorIdsByGrupoIdOrderByOrdem(@Param("grupoId") Long grupoId);

    Optional<GrupoLouvorItem> findByGrupoIdAndLouvorId(Long grupoId, Long louvorId);

    void deleteByGrupoId(Long grupoId);
}
