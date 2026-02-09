package br.com.semear.repository;

import br.com.semear.domain.HistoricoLeituraBiblia;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the HistoricoLeituraBiblia entity.
 */
@Repository
public interface HistoricoLeituraBibliaRepository extends JpaRepository<HistoricoLeituraBiblia, Long> {
    @Query(
        "select historicoLeituraBiblia from HistoricoLeituraBiblia historicoLeituraBiblia where historicoLeituraBiblia.usuario.login = ?#{authentication.name}"
    )
    List<HistoricoLeituraBiblia> findByUsuarioIsCurrentUser();

    default Optional<HistoricoLeituraBiblia> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<HistoricoLeituraBiblia> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<HistoricoLeituraBiblia> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select historicoLeituraBiblia from HistoricoLeituraBiblia historicoLeituraBiblia left join fetch historicoLeituraBiblia.usuario",
        countQuery = "select count(historicoLeituraBiblia) from HistoricoLeituraBiblia historicoLeituraBiblia"
    )
    Page<HistoricoLeituraBiblia> findAllWithToOneRelationships(Pageable pageable);

    @Query(
        "select historicoLeituraBiblia from HistoricoLeituraBiblia historicoLeituraBiblia left join fetch historicoLeituraBiblia.usuario"
    )
    List<HistoricoLeituraBiblia> findAllWithToOneRelationships();

    @Query(
        "select historicoLeituraBiblia from HistoricoLeituraBiblia historicoLeituraBiblia left join fetch historicoLeituraBiblia.usuario where historicoLeituraBiblia.id =:id"
    )
    Optional<HistoricoLeituraBiblia> findOneWithToOneRelationships(@Param("id") Long id);
}
