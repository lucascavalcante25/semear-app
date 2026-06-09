package br.com.semear.repository;

import br.com.semear.domain.Louvor;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LouvorRepository extends JpaRepository<Louvor, Long> {

    List<Louvor> findAllByOrderByTituloAsc();

    List<Louvor> findAllByIgrejaIdOrderByTituloAsc(Long igrejaId);

    @Query("SELECT l FROM Louvor l WHERE l.igreja.id = :igrejaId AND (LOWER(l.titulo) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(l.artista) LIKE LOWER(CONCAT('%', :q, '%'))) ORDER BY l.titulo")
    List<Louvor> searchByIgrejaAndTituloOrArtista(@Param("igrejaId") Long igrejaId, @Param("q") String query);
}
