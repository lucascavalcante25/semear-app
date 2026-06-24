package br.com.semear.repository;

import br.com.semear.domain.CultoRegistro;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CultoRegistroRepository extends JpaRepository<CultoRegistro, Long> {
    List<CultoRegistro> findByIgrejaIdOrderByNomeAsc(Long igrejaId);
    Optional<CultoRegistro> findByIdAndIgrejaId(Long id, Long igrejaId);
}
