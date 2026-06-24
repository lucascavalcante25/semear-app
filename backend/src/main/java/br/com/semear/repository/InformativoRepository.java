package br.com.semear.repository;

import br.com.semear.domain.Informativo;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InformativoRepository extends JpaRepository<Informativo, Long> {
    List<Informativo> findByIgrejaIdOrderByCriadoEmDesc(Long igrejaId);

    Optional<Informativo> findByIdAndIgrejaId(Long id, Long igrejaId);

    List<Informativo> findByIgrejaIdAndAtivoTrueAndExibirNoLoginTrueOrderByPrioridadeDescCriadoEmDesc(Long igrejaId);
}
