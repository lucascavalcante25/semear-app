package br.com.semear.repository;

import br.com.semear.domain.Visitante;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VisitanteRepository extends JpaRepository<Visitante, Long> {
    Page<Visitante> findAllByIgrejaId(Long igrejaId, Pageable pageable);
}

