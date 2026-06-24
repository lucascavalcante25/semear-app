package br.com.semear.repository;

import br.com.semear.domain.DepartamentoMembro;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartamentoMembroRepository extends JpaRepository<DepartamentoMembro, Long> {
    List<DepartamentoMembro> findByDepartamentoId(Long departamentoId);
    Optional<DepartamentoMembro> findByDepartamentoIdAndUserId(Long departamentoId, Long userId);
    void deleteByDepartamentoIdAndUserId(Long departamentoId, Long userId);
}
