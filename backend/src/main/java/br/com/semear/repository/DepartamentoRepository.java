package br.com.semear.repository;

import br.com.semear.domain.Departamento;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartamentoRepository extends JpaRepository<Departamento, Long> {
    List<Departamento> findByIgrejaIdAndAtivoTrueOrderByNomeAsc(Long igrejaId);
    List<Departamento> findByIgrejaIdOrderByNomeAsc(Long igrejaId);
    Optional<Departamento> findByIdAndIgrejaId(Long id, Long igrejaId);
}
