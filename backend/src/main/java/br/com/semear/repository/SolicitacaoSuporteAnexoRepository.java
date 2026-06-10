package br.com.semear.repository;

import br.com.semear.domain.SolicitacaoSuporteAnexo;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SolicitacaoSuporteAnexoRepository extends JpaRepository<SolicitacaoSuporteAnexo, Long> {

    List<SolicitacaoSuporteAnexo> findAllBySolicitacaoSuporteId(Long solicitacaoSuporteId);

    Optional<SolicitacaoSuporteAnexo> findByIdAndSolicitacaoSuporteId(Long id, Long solicitacaoSuporteId);

    long countBySolicitacaoSuporteId(Long solicitacaoSuporteId);
}
