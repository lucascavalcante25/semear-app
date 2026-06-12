package br.com.semear.repository;

import br.com.semear.domain.UsuarioNotificacaoVista;
import br.com.semear.domain.User;
import java.util.Optional;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioNotificacaoVistaRepository extends JpaRepository<UsuarioNotificacaoVista, Long> {

    @Query("SELECT n.referenciaId FROM UsuarioNotificacaoVista n WHERE n.user = :user AND n.tipo = :tipo")
    Set<Long> findReferenciaIdsByUserAndTipo(@Param("user") User user, @Param("tipo") String tipo);

    Optional<UsuarioNotificacaoVista> findByUserAndTipoAndReferenciaId(User user, String tipo, Long referenciaId);

    @Modifying
    @Query("DELETE FROM UsuarioNotificacaoVista n WHERE n.tipo = :tipo AND n.referenciaId = :referenciaId")
    void deleteAllByTipoAndReferenciaId(@Param("tipo") String tipo, @Param("referenciaId") Long referenciaId);
}
