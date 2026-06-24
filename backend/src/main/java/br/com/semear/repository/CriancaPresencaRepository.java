package br.com.semear.repository;

import br.com.semear.domain.CriancaPresenca;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CriancaPresencaRepository extends JpaRepository<CriancaPresenca, Long> {
    Optional<CriancaPresenca> findByCriancaIdAndDataPresenca(Long criancaId, LocalDate dataPresenca);

    List<CriancaPresenca> findByIgrejaIdAndDataPresenca(Long igrejaId, LocalDate dataPresenca);
}
