package br.com.semear.repository;

import br.com.semear.domain.CultoOcorrenciaResponsavel;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CultoOcorrenciaResponsavelRepository extends JpaRepository<CultoOcorrenciaResponsavel, Long> {
    List<CultoOcorrenciaResponsavel> findByCultoOcorrenciaId(Long cultoOcorrenciaId);

    void deleteByCultoOcorrenciaId(Long cultoOcorrenciaId);

    @Query(
        """
        SELECT r FROM CultoOcorrenciaResponsavel r
        JOIN FETCH r.user
        WHERE r.cultoOcorrencia.id IN :ocorrenciaIds
        """
    )
    List<CultoOcorrenciaResponsavel> findByCultoOcorrenciaIdInWithUser(@Param("ocorrenciaIds") Collection<Long> ocorrenciaIds);
}
