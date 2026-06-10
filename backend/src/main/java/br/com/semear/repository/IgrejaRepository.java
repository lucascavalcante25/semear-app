package br.com.semear.repository;

import br.com.semear.domain.Igreja;
import br.com.semear.domain.enumeration.StatusIgreja;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface IgrejaRepository extends JpaRepository<Igreja, Long>, JpaSpecificationExecutor<Igreja> {

    Optional<Igreja> findFirstByStatusOrderByIdAsc(StatusIgreja status);

    List<Igreja> findByStatusIn(List<StatusIgreja> statuses, Sort sort);

    long countByStatus(StatusIgreja status);
}
