package br.com.semear.repository;

import br.com.semear.domain.Devocional;
import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Devocional entity.
 */
@Repository
public interface DevocionalRepository extends JpaRepository<Devocional, Long> {

    Page<Devocional> findAllByOrderByDataPublicacaoDesc(Pageable pageable);

    Optional<Devocional> findFirstByDataPublicacaoOrderByIdDesc(LocalDate data);

    Page<Devocional> findByDataPublicacaoBeforeOrderByDataPublicacaoDesc(LocalDate data, Pageable pageable);
}
