package br.com.semear.repository;

import br.com.semear.domain.SolicitacaoSuporteMensagem;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SolicitacaoSuporteMensagemRepository extends JpaRepository<SolicitacaoSuporteMensagem, Long> {

    List<SolicitacaoSuporteMensagem> findAllBySolicitacaoSuporteIdOrderByDataEnvioAsc(Long solicitacaoSuporteId);
}
