package br.com.semear.repository;

import br.com.semear.domain.GrupoLouvorItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GrupoLouvorItemRepository extends JpaRepository<GrupoLouvorItem, Long> {

    List<GrupoLouvorItem> findByGrupoIdOrderByOrdemAsc(Long grupoId);

    Optional<GrupoLouvorItem> findByGrupoIdAndLouvorId(Long grupoId, Long louvorId);

    void deleteByGrupoId(Long grupoId);
}
