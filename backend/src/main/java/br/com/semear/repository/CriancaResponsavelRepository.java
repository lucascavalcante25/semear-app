package br.com.semear.repository;

import br.com.semear.domain.CriancaResponsavel;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CriancaResponsavelRepository extends JpaRepository<CriancaResponsavel, Long> {
    List<CriancaResponsavel> findByCriancaId(Long criancaId);
    void deleteByCriancaIdAndUserId(Long criancaId, Long userId);
}
