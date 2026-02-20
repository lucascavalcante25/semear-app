package br.com.semear.repository;

import br.com.semear.domain.Lancamento;
import br.com.semear.domain.enumerations.TipoLancamento;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LancamentoRepository extends JpaRepository<Lancamento, Long> {

    List<Lancamento> findAllByOrderByDataLancamentoDescCriadoEmDesc();

    List<Lancamento> findByTipoOrderByDataLancamentoDescCriadoEmDesc(TipoLancamento tipo);

    @Query("SELECT l FROM Lancamento l WHERE l.dataLancamento >= :inicio AND l.dataLancamento <= :fim ORDER BY l.dataLancamento DESC, l.criadoEm DESC")
    List<Lancamento> findByPeriodo(@Param("inicio") LocalDate inicio, @Param("fim") LocalDate fim);
}
