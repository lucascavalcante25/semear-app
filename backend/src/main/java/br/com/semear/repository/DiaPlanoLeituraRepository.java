package br.com.semear.repository;

import br.com.semear.domain.DiaPlanoLeitura;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the DiaPlanoLeitura entity.
 */
@SuppressWarnings("unused")
@Repository
public interface DiaPlanoLeituraRepository extends JpaRepository<DiaPlanoLeitura, Long> {}
