package br.com.semear.repository;

import br.com.semear.domain.CultoOcorrenciaLouvor;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CultoOcorrenciaLouvorRepository extends JpaRepository<CultoOcorrenciaLouvor, Long> {
    List<CultoOcorrenciaLouvor> findByCultoOcorrenciaIdOrderByOrdemAsc(Long cultoOcorrenciaId);

    void deleteByCultoOcorrenciaId(Long cultoOcorrenciaId);
}
