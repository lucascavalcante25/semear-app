package br.com.semear.repository;

import br.com.semear.domain.PlanoLeitura;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the PlanoLeitura entity.
 */
@SuppressWarnings("unused")
@Repository
public interface PlanoLeituraRepository extends JpaRepository<PlanoLeitura, Long> {}
