package br.com.semear.repository;

import br.com.semear.domain.SolicitacaoAcesso;
import br.com.semear.domain.enumeration.StatusSolicitacaoAcesso;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SolicitacaoAcessoRepository extends JpaRepository<SolicitacaoAcesso, Long> {
    List<SolicitacaoAcesso> findAllByStatusOrderByDataSolicitacaoDesc(StatusSolicitacaoAcesso status);
    long countByStatus(StatusSolicitacaoAcesso status);
    boolean existsByEmailIgnoreCaseAndStatus(String email, StatusSolicitacaoAcesso status);
    boolean existsByCnpjIgrejaAndStatus(String cnpjIgreja, StatusSolicitacaoAcesso status);
    boolean existsByCpfAndStatus(String cpf, StatusSolicitacaoAcesso status);
}
