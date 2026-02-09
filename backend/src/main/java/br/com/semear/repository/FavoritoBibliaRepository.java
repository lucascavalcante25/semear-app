package br.com.semear.repository;

import br.com.semear.domain.FavoritoBiblia;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the FavoritoBiblia entity.
 */
@Repository
public interface FavoritoBibliaRepository extends JpaRepository<FavoritoBiblia, Long> {
    @Query("select favoritoBiblia from FavoritoBiblia favoritoBiblia where favoritoBiblia.usuario.login = ?#{authentication.name}")
    List<FavoritoBiblia> findByUsuarioIsCurrentUser();

    default Optional<FavoritoBiblia> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<FavoritoBiblia> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<FavoritoBiblia> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select favoritoBiblia from FavoritoBiblia favoritoBiblia left join fetch favoritoBiblia.usuario",
        countQuery = "select count(favoritoBiblia) from FavoritoBiblia favoritoBiblia"
    )
    Page<FavoritoBiblia> findAllWithToOneRelationships(Pageable pageable);

    @Query("select favoritoBiblia from FavoritoBiblia favoritoBiblia left join fetch favoritoBiblia.usuario")
    List<FavoritoBiblia> findAllWithToOneRelationships();

    @Query("select favoritoBiblia from FavoritoBiblia favoritoBiblia left join fetch favoritoBiblia.usuario where favoritoBiblia.id =:id")
    Optional<FavoritoBiblia> findOneWithToOneRelationships(@Param("id") Long id);
}
