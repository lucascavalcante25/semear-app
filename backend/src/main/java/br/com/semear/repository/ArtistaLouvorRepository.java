package br.com.semear.repository;

import br.com.semear.domain.ArtistaLouvor;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ArtistaLouvorRepository extends JpaRepository<ArtistaLouvor, Long> {

    Optional<ArtistaLouvor> findByIgrejaIdAndNomeIgnoreCase(Long igrejaId, String nome);

    List<ArtistaLouvor> findByIgrejaIdOrderByNomeAsc(Long igrejaId);

    @Query(
        "SELECT a FROM ArtistaLouvor a WHERE a.igreja.id = :igrejaId AND LOWER(a.nome) LIKE LOWER(CONCAT('%', :q, '%')) ORDER BY a.nome ASC"
    )
    List<ArtistaLouvor> searchByIgrejaAndNome(@Param("igrejaId") Long igrejaId, @Param("q") String q);
}
