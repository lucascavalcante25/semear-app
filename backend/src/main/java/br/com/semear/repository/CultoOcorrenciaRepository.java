package br.com.semear.repository;

import br.com.semear.domain.CultoOcorrencia;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CultoOcorrenciaRepository extends JpaRepository<CultoOcorrencia, Long> {
    Optional<CultoOcorrencia> findByIdAndIgrejaId(Long id, Long igrejaId);

    Optional<CultoOcorrencia> findByCultoRegistroIdAndDataEvento(Long cultoRegistroId, LocalDate dataEvento);

    List<CultoOcorrencia> findByIgrejaIdAndDataEventoBetweenOrderByDataEventoAsc(
        Long igrejaId,
        LocalDate inicio,
        LocalDate fim
    );
}
