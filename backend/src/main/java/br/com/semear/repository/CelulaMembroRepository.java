package br.com.semear.repository;

import br.com.semear.domain.CelulaMembro;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CelulaMembroRepository extends JpaRepository<CelulaMembro, Long> {
    List<CelulaMembro> findByCelulaId(Long celulaId);
    Optional<CelulaMembro> findByCelulaIdAndUserId(Long celulaId, Long userId);
    void deleteByCelulaIdAndUserId(Long celulaId, Long userId);
}
