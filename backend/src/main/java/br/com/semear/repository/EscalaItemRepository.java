package br.com.semear.repository;

import br.com.semear.domain.EscalaItem;
import br.com.semear.domain.enumeration.StatusEscalaPublicacao;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EscalaItemRepository extends JpaRepository<EscalaItem, Long> {
    List<EscalaItem> findByEscalaId(Long escalaId);
    Optional<EscalaItem> findByIdAndEscalaId(Long id, Long escalaId);
    List<EscalaItem> findByUserIdAndConfirmadoFalse(Long userId);

    @Query(
        "SELECT ei FROM EscalaItem ei JOIN FETCH ei.user JOIN FETCH ei.escala e " +
        "WHERE e.id IN :escalaIds"
    )
    List<EscalaItem> findByEscalaIdInWithUser(@Param("escalaIds") List<Long> escalaIds);

    @Query(
        "SELECT ei FROM EscalaItem ei JOIN FETCH ei.escala e LEFT JOIN FETCH e.departamento d LEFT JOIN FETCH e.cultoRegistro " +
        "WHERE ei.user.id = :userId AND e.status = :status AND e.dataEvento >= :desde AND e.dataEvento <= :ate"
    )
    List<EscalaItem> findItensUsuarioNoPeriodo(
        @Param("userId") Long userId,
        @Param("status") StatusEscalaPublicacao status,
        @Param("desde") Instant desde,
        @Param("ate") Instant ate
    );

    @Query(
        "SELECT ei FROM EscalaItem ei JOIN FETCH ei.escala e LEFT JOIN FETCH e.departamento d LEFT JOIN FETCH e.cultoRegistro " +
        "WHERE ei.user.id = :userId AND e.status = :status AND (ei.confirmado IS NULL OR ei.confirmado = false) AND e.dataEvento >= :desde " +
        "ORDER BY e.dataEvento ASC"
    )
    List<EscalaItem> findItensUsuarioAguardandoConfirmacao(
        @Param("userId") Long userId,
        @Param("status") StatusEscalaPublicacao status,
        @Param("desde") Instant desde
    );
}
