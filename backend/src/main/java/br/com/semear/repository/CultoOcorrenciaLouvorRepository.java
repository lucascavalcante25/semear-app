package br.com.semear.repository;

import br.com.semear.domain.CultoOcorrenciaLouvor;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CultoOcorrenciaLouvorRepository extends JpaRepository<CultoOcorrenciaLouvor, Long> {
    List<CultoOcorrenciaLouvor> findByCultoOcorrenciaIdOrderByOrdemAsc(Long cultoOcorrenciaId);

    void deleteByCultoOcorrenciaId(Long cultoOcorrenciaId);

    @Query(
        """
        SELECT col.cultoOcorrencia.id AS ocorrenciaId,
               l.id AS louvorId,
               l.titulo AS titulo,
               l.artista AS artista,
               col.ordem AS ordem,
               l.youtubeUrl AS youtubeUrl,
               l.tonalidade AS tonalidade,
               CASE WHEN l.letraConteudo IS NOT NULL THEN true ELSE false END AS temLetra,
               CASE WHEN l.cifraConteudo IS NOT NULL THEN true ELSE false END AS temCifra
        FROM CultoOcorrenciaLouvor col
        JOIN col.louvor l
        WHERE col.cultoOcorrencia.id IN :ocorrenciaIds
        ORDER BY col.ordem ASC
        """
    )
    List<CultoLouvorAgendaProjection> findAgendaByOcorrenciaIdIn(@Param("ocorrenciaIds") Collection<Long> ocorrenciaIds);

    interface CultoLouvorAgendaProjection {
        Long getOcorrenciaId();
        Long getLouvorId();
        String getTitulo();
        String getArtista();
        Integer getOrdem();
        String getYoutubeUrl();
        String getTonalidade();
        Boolean getTemLetra();
        Boolean getTemCifra();
    }
}
