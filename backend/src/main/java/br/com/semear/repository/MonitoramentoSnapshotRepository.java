package br.com.semear.repository;

import br.com.semear.domain.MonitoramentoSnapshot;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MonitoramentoSnapshotRepository extends JpaRepository<MonitoramentoSnapshot, Long> {
    List<MonitoramentoSnapshot> findByColetadoEmAfterOrderByColetadoEmAsc(Instant desde);

    @Modifying
    @Query("DELETE FROM MonitoramentoSnapshot s WHERE s.coletadoEm < :limite")
    int deleteByColetadoEmBefore(@Param("limite") Instant limite);
}
