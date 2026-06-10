package br.com.semear.repository;

import br.com.semear.domain.PagamentoPlataforma;
import br.com.semear.domain.enumeration.StatusPagamentoPlataforma;
import br.com.semear.domain.enumeration.TipoPagamentoPlataforma;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PagamentoPlataformaRepository extends JpaRepository<PagamentoPlataforma, Long> {
    @EntityGraph(attributePaths = { "igreja", "assinatura" })
    List<PagamentoPlataforma> findAllByOrderByDataCadastroDesc();

    long countByStatus(StatusPagamentoPlataforma status);

    long countByTipoPagamentoAndStatus(TipoPagamentoPlataforma tipo, StatusPagamentoPlataforma status);

    List<PagamentoPlataforma> findByDataVencimentoBetweenAndStatus(
        LocalDate inicio,
        LocalDate fim,
        StatusPagamentoPlataforma status
    );

    @EntityGraph(attributePaths = { "igreja", "assinatura" })
    List<PagamentoPlataforma> findByStatusAndDataVencimentoBefore(
        StatusPagamentoPlataforma status,
        LocalDate dataVencimento
    );
}
