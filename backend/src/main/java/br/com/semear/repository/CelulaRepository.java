package br.com.semear.repository;

import br.com.semear.domain.Celula;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CelulaRepository extends JpaRepository<Celula, Long> {
    List<Celula> findByIgrejaIdAndAtivoTrueOrderByNomeAsc(Long igrejaId);
    List<Celula> findByIgrejaIdOrderByNomeAsc(Long igrejaId);
    Optional<Celula> findByIdAndIgrejaId(Long id, Long igrejaId);
}
