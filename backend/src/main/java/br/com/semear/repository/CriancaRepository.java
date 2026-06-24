package br.com.semear.repository;

import br.com.semear.domain.Crianca;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CriancaRepository extends JpaRepository<Crianca, Long> {
    List<Crianca> findByIgrejaIdAndAtivoTrueOrderByNomeAsc(Long igrejaId);
    Optional<Crianca> findByIdAndIgrejaId(Long id, Long igrejaId);
}
