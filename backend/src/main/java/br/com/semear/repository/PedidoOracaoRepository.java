package br.com.semear.repository;

import br.com.semear.domain.PedidoOracao;
import br.com.semear.domain.enumeration.CategoriaPedidoOracao;
import br.com.semear.domain.enumeration.StatusPedidoOracao;
import br.com.semear.domain.enumeration.VisibilidadePedidoOracao;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PedidoOracaoRepository extends JpaRepository<PedidoOracao, Long> {
    Optional<PedidoOracao> findByIdAndIgrejaIdAndDeletedAtIsNull(Long id, Long igrejaId);

    List<PedidoOracao> findByIgrejaIdAndDeletedAtIsNullOrderByCriadoEmDesc(Long igrejaId);

    Page<PedidoOracao> findByIgrejaIdAndUsuarioIdAndDeletedAtIsNullOrderByCriadoEmDesc(Long igrejaId, Long usuarioId, Pageable pageable);

    @Query(
        """
        SELECT p FROM PedidoOracao p
        WHERE p.igreja.id = :igrejaId
        AND p.deletedAt IS NULL
        AND (:categoria IS NULL OR p.categoria = :categoria)
        AND (:status IS NULL OR p.status = :status)
        ORDER BY p.criadoEm DESC
        """
    )
    Page<PedidoOracao> findLideranca(
        @Param("igrejaId") Long igrejaId,
        @Param("categoria") CategoriaPedidoOracao categoria,
        @Param("status") StatusPedidoOracao status,
        Pageable pageable
    );

    @Query(
        """
        SELECT p FROM PedidoOracao p
        WHERE p.igreja.id = :igrejaId
        AND p.deletedAt IS NULL
        AND p.visibilidade = :visibilidade
        AND p.status IN :statuses
        AND (p.aprovado = true OR p.requerAprovacao = false)
        AND (:categoria IS NULL OR p.categoria = :categoria)
        AND (:status IS NULL OR p.status = :status)
        ORDER BY p.criadoEm DESC
        """
    )
    Page<PedidoOracao> findMural(
        @Param("igrejaId") Long igrejaId,
        @Param("visibilidade") VisibilidadePedidoOracao visibilidade,
        @Param("statuses") List<StatusPedidoOracao> statuses,
        @Param("categoria") CategoriaPedidoOracao categoria,
        @Param("status") StatusPedidoOracao status,
        Pageable pageable
    );

    long countByIgrejaIdAndDeletedAtIsNullAndStatusIn(Long igrejaId, List<StatusPedidoOracao> statuses);

    @Query(
        """
        SELECT p FROM PedidoOracao p
        WHERE p.igreja.id = :igrejaId
        AND p.deletedAt IS NULL
        AND (p.visibilidade = br.com.semear.domain.enumeration.VisibilidadePedidoOracao.PRIVADA
             OR p.status = br.com.semear.domain.enumeration.StatusPedidoOracao.AGUARDANDO_APROVACAO)
        ORDER BY p.criadoEm DESC
        """
    )
    List<PedidoOracao> findPendentesNotificacaoLideranca(@Param("igrejaId") Long igrejaId);
}
