package br.com.semear.repository;

import br.com.semear.domain.AssinaturaIgreja;
import br.com.semear.domain.enumeration.StatusAssinatura;
import br.com.semear.domain.enumeration.StatusPagamentoPlataforma;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssinaturaIgrejaRepository extends JpaRepository<AssinaturaIgreja, Long> {
    @EntityGraph(attributePaths = { "igreja", "plano" })
    List<AssinaturaIgreja> findAllByOrderByDataCadastroDesc();

    @EntityGraph(attributePaths = { "igreja", "plano" })
    Optional<AssinaturaIgreja> findFirstByIgrejaIdOrderByDataCadastroDesc(Long igrejaId);

    @EntityGraph(attributePaths = { "igreja", "plano" })
    List<AssinaturaIgreja> findByStatusAssinatura(StatusAssinatura status);

    long countByStatusPagamento(StatusPagamentoPlataforma status);

    long countByStatusAssinatura(StatusAssinatura status);

    long countByStatusAssinaturaAndDataFimTesteBetween(StatusAssinatura status, LocalDate inicio, LocalDate fim);

    long countByStatusAssinaturaAndDataFimTesteBefore(StatusAssinatura status, LocalDate data);

    @EntityGraph(attributePaths = { "igreja", "plano" })
    List<AssinaturaIgreja> findByStatusAssinaturaAndStatusMensalidadeAndProximoVencimentoBefore(
        StatusAssinatura statusAssinatura,
        StatusPagamentoPlataforma statusMensalidade,
        LocalDate proximoVencimento
    );
}
