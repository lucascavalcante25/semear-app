package br.com.semear.repository;

import br.com.semear.domain.Plano;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlanoRepository extends JpaRepository<Plano, Long> {
    List<Plano> findAllByOrderByValorMensalAsc();
}
