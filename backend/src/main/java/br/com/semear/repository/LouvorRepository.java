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

    @Query("SELECT l FROM Louvor l WHERE LOWER(l.titulo) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(l.artista) LIKE LOWER(CONCAT('%', :q, '%')) ORDER BY l.titulo")
    List<Louvor> searchByTituloOrArtista(@Param("q") String query);
}
