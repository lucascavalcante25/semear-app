package br.com.semear.repository;

import br.com.semear.domain.CelulaRelatorio;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CelulaRelatorioRepository extends JpaRepository<CelulaRelatorio, Long> {
    List<CelulaRelatorio> findByCelulaIdAndIgrejaIdOrderByDataReuniaoDescCriadoEmDesc(Long celulaId, Long igrejaId);
}
