package br.com.semear.repository;

import br.com.semear.domain.EscalaConfigAutomatica;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EscalaConfigAutomaticaRepository extends JpaRepository<EscalaConfigAutomatica, Long> {
    Optional<EscalaConfigAutomatica> findByIgrejaId(Long igrejaId);
    List<EscalaConfigAutomatica> findByAtivoTrue();
}
