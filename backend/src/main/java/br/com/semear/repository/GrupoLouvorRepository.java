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

    @Query("SELECT DISTINCT g FROM GrupoLouvor g LEFT JOIN FETCH g.itens i WHERE g.id = :id AND g.igreja.id = :igrejaId")
    Optional<GrupoLouvor> findByIdAndIgrejaIdWithItens(@Param("id") Long id, @Param("igrejaId") Long igrejaId);

    Optional<GrupoLouvor> findByIdAndIgrejaId(Long id, Long igrejaId);

    @Query("SELECT DISTINCT g FROM GrupoLouvor g LEFT JOIN FETCH g.itens i ORDER BY g.ordem ASC")
    List<GrupoLouvor> findAllWithItensOrderByOrdemAsc();

    @Query("SELECT DISTINCT g FROM GrupoLouvor g LEFT JOIN FETCH g.itens i WHERE g.igreja.id = :igrejaId ORDER BY g.ordem ASC")
    List<GrupoLouvor> findAllByIgrejaIdWithItensOrderByOrdemAsc(@Param("igrejaId") Long igrejaId);
}
