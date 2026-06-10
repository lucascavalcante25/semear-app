package br.com.semear.repository;

import br.com.semear.domain.SolicitacaoSuporte;
import br.com.semear.domain.User;
import br.com.semear.domain.enumeration.StatusSolicitacaoSuporte;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface SolicitacaoSuporteRepository extends JpaRepository<SolicitacaoSuporte, Long>, JpaSpecificationExecutor<SolicitacaoSuporte> {

    List<SolicitacaoSuporte> findAllByIgrejaIdOrderByCreatedDateDesc(Long igrejaId);

    long countByStatus(StatusSolicitacaoSuporte status);

    long countByLidaPeloSuporteFalseAndStatusNotIn(List<StatusSolicitacaoSuporte> statuses);

    List<SolicitacaoSuporte> findTop5ByOrderByCreatedDateDesc();

    List<SolicitacaoSuporte> findByUsuarioSolicitanteAndLidaPeloClienteFalse(User usuarioSolicitante);
}
