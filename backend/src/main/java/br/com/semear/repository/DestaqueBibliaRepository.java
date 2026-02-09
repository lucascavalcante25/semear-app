package br.com.semear.repository;

import br.com.semear.domain.DestaqueBiblia;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the DestaqueBiblia entity.
 */
@Repository
public interface DestaqueBibliaRepository extends JpaRepository<DestaqueBiblia, Long> {
    @Query("select destaqueBiblia from DestaqueBiblia destaqueBiblia where destaqueBiblia.usuario.login = ?#{authentication.name}")
    List<DestaqueBiblia> findByUsuarioIsCurrentUser();

    default Optional<DestaqueBiblia> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<DestaqueBiblia> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<DestaqueBiblia> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select destaqueBiblia from DestaqueBiblia destaqueBiblia left join fetch destaqueBiblia.usuario",
        countQuery = "select count(destaqueBiblia) from DestaqueBiblia destaqueBiblia"
    )
    Page<DestaqueBiblia> findAllWithToOneRelationships(Pageable pageable);

    @Query("select destaqueBiblia from DestaqueBiblia destaqueBiblia left join fetch destaqueBiblia.usuario")
    List<DestaqueBiblia> findAllWithToOneRelationships();

    @Query("select destaqueBiblia from DestaqueBiblia destaqueBiblia left join fetch destaqueBiblia.usuario where destaqueBiblia.id =:id")
    Optional<DestaqueBiblia> findOneWithToOneRelationships(@Param("id") Long id);
}
