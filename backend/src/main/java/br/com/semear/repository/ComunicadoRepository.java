package br.com.semear.repository;

import br.com.semear.domain.Comunicado;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComunicadoRepository extends JpaRepository<Comunicado, Long> {
    Page<Comunicado> findAllByIgrejaId(Pageable pageable, Long igrejaId);

    Page<Comunicado> findAllByIgrejaIdAndAtivoIsTrue(Pageable pageable, Long igrejaId);

    List<Comunicado> findByIgrejaIdOrderByCriadoEmDesc(Long igrejaId);

    Optional<Comunicado> findByIdAndIgrejaId(Long id, Long igrejaId);

    List<Comunicado> findByIgrejaIdAndAtivoTrueAndExibirNoLoginTrueOrderByPrioridadeDescCriadoEmDesc(Long igrejaId);
}
