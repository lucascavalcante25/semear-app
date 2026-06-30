package br.com.semear.repository;

import br.com.semear.domain.IgrejaCargo;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IgrejaCargoRepository extends JpaRepository<IgrejaCargo, Long> {
    @EntityGraph(attributePaths = { "modulos" })
    List<IgrejaCargo> findByIgrejaIdOrderByOrdemAscNomeAsc(Long igrejaId);

    @EntityGraph(attributePaths = { "modulos" })
    Optional<IgrejaCargo> findByIdAndIgrejaId(Long id, Long igrejaId);

    Optional<IgrejaCargo> findByIgrejaIdAndCodigo(Long igrejaId, String codigo);

    boolean existsByIgrejaIdAndCodigo(Long igrejaId, String codigo);

    long countByIgrejaId(Long igrejaId);
}
