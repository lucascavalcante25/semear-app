package br.com.semear.repository;

import br.com.semear.domain.AcompanhamentoPastoral;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AcompanhamentoPastoralRepository extends JpaRepository<AcompanhamentoPastoral, Long> {
    List<AcompanhamentoPastoral> findByIgrejaIdOrderByDataContatoDesc(Long igrejaId);
    Optional<AcompanhamentoPastoral> findByIdAndIgrejaId(Long id, Long igrejaId);
    List<AcompanhamentoPastoral> findByIgrejaIdAndMembroIdOrderByDataContatoDesc(Long igrejaId, Long membroId);
}
