package br.com.semear.repository;

import br.com.semear.domain.EscalaGeracao;
import br.com.semear.domain.enumeration.StatusEscalaPublicacao;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EscalaGeracaoRepository extends JpaRepository<EscalaGeracao, Long> {
    List<EscalaGeracao> findByIgrejaIdOrderByDataInicioDesc(Long igrejaId);
    Optional<EscalaGeracao> findByIdAndIgrejaId(Long id, Long igrejaId);
    Optional<EscalaGeracao> findFirstByIgrejaIdAndStatusOrderByDataFimDesc(Long igrejaId, StatusEscalaPublicacao status);
    boolean existsByIgrejaIdAndStatusAndDataInicioGreaterThanEqual(Long igrejaId, StatusEscalaPublicacao status, LocalDate data);
    Optional<EscalaGeracao> findFirstByIgrejaIdAndStatusOrderByCriadoEmDesc(Long igrejaId, StatusEscalaPublicacao status);
}
