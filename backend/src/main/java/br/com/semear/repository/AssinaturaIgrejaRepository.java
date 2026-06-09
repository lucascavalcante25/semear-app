package br.com.semear.repository;

import br.com.semear.domain.AssinaturaIgreja;
import br.com.semear.domain.enumeration.StatusPagamentoPlataforma;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssinaturaIgrejaRepository extends JpaRepository<AssinaturaIgreja, Long> {
    @EntityGraph(attributePaths = { "igreja", "plano" })
    List<AssinaturaIgreja> findAllByOrderByDataCadastroDesc();

    long countByStatusPagamento(StatusPagamentoPlataforma status);
}
