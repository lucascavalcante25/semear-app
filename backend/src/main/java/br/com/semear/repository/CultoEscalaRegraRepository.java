package br.com.semear.repository;

import br.com.semear.domain.CultoEscalaRegra;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CultoEscalaRegraRepository extends JpaRepository<CultoEscalaRegra, Long> {
    List<CultoEscalaRegra> findByCultoRegistroId(Long cultoRegistroId);
    void deleteByCultoRegistroId(Long cultoRegistroId);
}
