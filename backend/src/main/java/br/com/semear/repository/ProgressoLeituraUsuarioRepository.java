package br.com.semear.repository;

import br.com.semear.domain.ProgressoLeituraUsuario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the ProgressoLeituraUsuario entity.
 */
@Repository
public interface ProgressoLeituraUsuarioRepository extends JpaRepository<ProgressoLeituraUsuario, Long> {
    @Query(
        "select progressoLeituraUsuario from ProgressoLeituraUsuario progressoLeituraUsuario where progressoLeituraUsuario.usuario.login = ?#{authentication.name}"
    )
    List<ProgressoLeituraUsuario> findByUsuarioIsCurrentUser();

    default Optional<ProgressoLeituraUsuario> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<ProgressoLeituraUsuario> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<ProgressoLeituraUsuario> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select progressoLeituraUsuario from ProgressoLeituraUsuario progressoLeituraUsuario left join fetch progressoLeituraUsuario.usuario",
        countQuery = "select count(progressoLeituraUsuario) from ProgressoLeituraUsuario progressoLeituraUsuario"
    )
    Page<ProgressoLeituraUsuario> findAllWithToOneRelationships(Pageable pageable);

    @Query(
        "select progressoLeituraUsuario from ProgressoLeituraUsuario progressoLeituraUsuario left join fetch progressoLeituraUsuario.usuario"
    )
    List<ProgressoLeituraUsuario> findAllWithToOneRelationships();

    @Query(
        "select progressoLeituraUsuario from ProgressoLeituraUsuario progressoLeituraUsuario left join fetch progressoLeituraUsuario.usuario where progressoLeituraUsuario.id =:id"
    )
    Optional<ProgressoLeituraUsuario> findOneWithToOneRelationships(@Param("id") Long id);
}
