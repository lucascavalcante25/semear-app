package br.com.semear.repository;

import br.com.semear.domain.SolicitacaoSuporteHistorico;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SolicitacaoSuporteHistoricoRepository extends JpaRepository<SolicitacaoSuporteHistorico, Long> {

    List<SolicitacaoSuporteHistorico> findAllBySolicitacaoSuporteIdOrderByDataAcaoAsc(Long solicitacaoSuporteId);

    List<SolicitacaoSuporteHistorico> findAllBySolicitacaoSuporteIdAndVisivelParaClienteTrueOrderByDataAcaoAsc(
        Long solicitacaoSuporteId
    );
}
