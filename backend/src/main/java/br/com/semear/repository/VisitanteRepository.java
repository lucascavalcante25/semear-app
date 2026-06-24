package br.com.semear.repository;

import br.com.semear.domain.Visitante;
import br.com.semear.domain.enumeration.EstadoFunilVisitante;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VisitanteRepository extends JpaRepository<Visitante, Long> {
    Page<Visitante> findAllByIgrejaId(Long igrejaId, Pageable pageable);

    long countByIgrejaId(Long igrejaId);

    long countByIgrejaIdAndDataVisitaBetween(Long igrejaId, java.time.LocalDate inicio, java.time.LocalDate fim);

    long countByIgrejaIdAndEstadoFunil(Long igrejaId, EstadoFunilVisitante estadoFunil);

    long countByIgrejaIdAndDataProximoContatoLessThanEqual(Long igrejaId, java.time.LocalDate data);
}

