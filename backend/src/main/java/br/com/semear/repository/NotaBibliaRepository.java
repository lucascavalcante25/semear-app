package br.com.semear.repository;

import br.com.semear.domain.NotaBiblia;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the NotaBiblia entity.
 */
@Repository
public interface NotaBibliaRepository extends JpaRepository<NotaBiblia, Long> {
    @Query("select notaBiblia from NotaBiblia notaBiblia where notaBiblia.usuario.login = ?#{authentication.name}")
    List<NotaBiblia> findByUsuarioIsCurrentUser();

    default Optional<NotaBiblia> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<NotaBiblia> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<NotaBiblia> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select notaBiblia from NotaBiblia notaBiblia left join fetch notaBiblia.usuario",
        countQuery = "select count(notaBiblia) from NotaBiblia notaBiblia"
    )
    Page<NotaBiblia> findAllWithToOneRelationships(Pageable pageable);

    @Query("select notaBiblia from NotaBiblia notaBiblia left join fetch notaBiblia.usuario")
    List<NotaBiblia> findAllWithToOneRelationships();

    @Query("select notaBiblia from NotaBiblia notaBiblia left join fetch notaBiblia.usuario where notaBiblia.id =:id")
    Optional<NotaBiblia> findOneWithToOneRelationships(@Param("id") Long id);
}
