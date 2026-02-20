package br.com.semear.repository;

import br.com.semear.domain.GrupoLouvor;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface GrupoLouvorRepository extends JpaRepository<GrupoLouvor, Long> {

    List<GrupoLouvor> findAllByOrderByOrdemAsc();

    @Query("SELECT DISTINCT g FROM GrupoLouvor g LEFT JOIN FETCH g.itens i LEFT JOIN FETCH i.louvor WHERE g.id = :id")
    Optional<GrupoLouvor> findByIdWithItens(@Param("id") Long id);

    @Query("SELECT DISTINCT g FROM GrupoLouvor g LEFT JOIN FETCH g.itens i LEFT JOIN FETCH i.louvor ORDER BY g.ordem ASC")
    List<GrupoLouvor> findAllWithItensOrderByOrdemAsc();
}
