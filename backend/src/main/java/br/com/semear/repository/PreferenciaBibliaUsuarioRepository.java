package br.com.semear.repository;

import br.com.semear.domain.PreferenciaBibliaUsuario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the PreferenciaBibliaUsuario entity.
 */
@Repository
public interface PreferenciaBibliaUsuarioRepository extends JpaRepository<PreferenciaBibliaUsuario, Long> {
    @Query(
        "select preferenciaBibliaUsuario from PreferenciaBibliaUsuario preferenciaBibliaUsuario where preferenciaBibliaUsuario.usuario.login = ?#{authentication.name}"
    )
    List<PreferenciaBibliaUsuario> findByUsuarioIsCurrentUser();

    default Optional<PreferenciaBibliaUsuario> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<PreferenciaBibliaUsuario> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<PreferenciaBibliaUsuario> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select preferenciaBibliaUsuario from PreferenciaBibliaUsuario preferenciaBibliaUsuario left join fetch preferenciaBibliaUsuario.usuario",
        countQuery = "select count(preferenciaBibliaUsuario) from PreferenciaBibliaUsuario preferenciaBibliaUsuario"
    )
    Page<PreferenciaBibliaUsuario> findAllWithToOneRelationships(Pageable pageable);

    @Query(
        "select preferenciaBibliaUsuario from PreferenciaBibliaUsuario preferenciaBibliaUsuario left join fetch preferenciaBibliaUsuario.usuario"
    )
    List<PreferenciaBibliaUsuario> findAllWithToOneRelationships();

    @Query(
        "select preferenciaBibliaUsuario from PreferenciaBibliaUsuario preferenciaBibliaUsuario left join fetch preferenciaBibliaUsuario.usuario where preferenciaBibliaUsuario.id =:id"
    )
    Optional<PreferenciaBibliaUsuario> findOneWithToOneRelationships(@Param("id") Long id);
}
