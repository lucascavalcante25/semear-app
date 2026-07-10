package br.com.semear.repository;

import br.com.semear.domain.CultoOcorrenciaResponsavel;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CultoOcorrenciaResponsavelRepository extends JpaRepository<CultoOcorrenciaResponsavel, Long> {
    List<CultoOcorrenciaResponsavel> findByCultoOcorrenciaId(Long cultoOcorrenciaId);

    void deleteByCultoOcorrenciaId(Long cultoOcorrenciaId);
}
