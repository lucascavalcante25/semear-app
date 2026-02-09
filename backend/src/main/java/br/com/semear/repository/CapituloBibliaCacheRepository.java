package br.com.semear.repository;

import br.com.semear.domain.CapituloBibliaCache;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the CapituloBibliaCache entity.
 */
@SuppressWarnings("unused")
@Repository
public interface CapituloBibliaCacheRepository extends JpaRepository<CapituloBibliaCache, Long> {}
