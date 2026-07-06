package br.com.semear.repository;

import br.com.semear.domain.Louvor;
import br.com.semear.repository.projection.LouvorListagemProjection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LouvorRepository extends JpaRepository<Louvor, Long> {

    List<Louvor> findAllByOrderByTituloAsc();

    List<Louvor> findAllByIgrejaIdOrderByTituloAsc(Long igrejaId);

    @Query(
        """
        SELECT l.id AS id, l.titulo AS titulo, l.artista AS artista, l.tonalidade AS tonalidade, l.tempo AS tempo,
        l.tipo AS tipo, l.youtubeUrl AS youtubeUrl, l.cifraUrl AS cifraUrl, l.cifraFileName AS cifraFileName,
        l.cifraContentType AS cifraContentType, l.ativo AS ativo,
        CASE WHEN l.letraConteudo IS NOT NULL AND TRIM(l.letraConteudo) <> '' THEN true ELSE false END AS temLetraSalva,
        CASE WHEN l.cifraApiCacheEm IS NOT NULL THEN true ELSE false END AS temCifraApiSalva,
        l.createdAt AS createdAt, l.updatedAt AS updatedAt
        FROM Louvor l WHERE l.igreja.id = :igrejaId ORDER BY l.titulo ASC
        """
    )
    List<LouvorListagemProjection> findResumoByIgrejaIdOrderByTituloAsc(@Param("igrejaId") Long igrejaId);

    @Query(
        """
        SELECT l.id AS id, l.titulo AS titulo, l.artista AS artista, l.tonalidade AS tonalidade, l.tempo AS tempo,
        l.tipo AS tipo, l.youtubeUrl AS youtubeUrl, l.cifraUrl AS cifraUrl, l.cifraFileName AS cifraFileName,
        l.cifraContentType AS cifraContentType, l.ativo AS ativo,
        CASE WHEN l.letraConteudo IS NOT NULL AND TRIM(l.letraConteudo) <> '' THEN true ELSE false END AS temLetraSalva,
        CASE WHEN l.cifraApiCacheEm IS NOT NULL THEN true ELSE false END AS temCifraApiSalva,
        l.createdAt AS createdAt, l.updatedAt AS updatedAt
        FROM Louvor l
        WHERE l.igreja.id = :igrejaId
        AND (LOWER(l.titulo) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(l.artista) LIKE LOWER(CONCAT('%', :q, '%')))
        ORDER BY l.titulo ASC
        """
    )
    List<LouvorListagemProjection> searchResumoByIgrejaAndTituloOrArtista(@Param("igrejaId") Long igrejaId, @Param("q") String query);

    @Query("SELECT l FROM Louvor l WHERE l.igreja.id = :igrejaId AND (LOWER(l.titulo) LIKE LOWER(CONCAT('%', :q, '%')) OR LOWER(l.artista) LIKE LOWER(CONCAT('%', :q, '%'))) ORDER BY l.titulo")
    List<Louvor> searchByIgrejaAndTituloOrArtista(@Param("igrejaId") Long igrejaId, @Param("q") String query);
}
