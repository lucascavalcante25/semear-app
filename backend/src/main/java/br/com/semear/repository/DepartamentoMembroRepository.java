package br.com.semear.repository;

import br.com.semear.domain.DepartamentoMembro;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartamentoMembroRepository extends JpaRepository<DepartamentoMembro, Long> {
    List<DepartamentoMembro> findByDepartamentoId(Long departamentoId);

    @Query(
        """
        SELECT dm FROM DepartamentoMembro dm
        JOIN FETCH dm.user
        WHERE dm.departamento.id IN :departamentoIds
        """
    )
    List<DepartamentoMembro> findByDepartamentoIdInWithUser(@Param("departamentoIds") Collection<Long> departamentoIds);

    Optional<DepartamentoMembro> findByDepartamentoIdAndUserId(Long departamentoId, Long userId);

    void deleteByDepartamentoIdAndUserId(Long departamentoId, Long userId);
}
