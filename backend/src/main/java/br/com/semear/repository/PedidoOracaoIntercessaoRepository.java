package br.com.semear.repository;

import br.com.semear.domain.PedidoOracaoIntercessao;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PedidoOracaoIntercessaoRepository extends JpaRepository<PedidoOracaoIntercessao, Long> {
    boolean existsByPedidoOracaoIdAndUsuarioId(Long pedidoOracaoId, Long usuarioId);

    Optional<PedidoOracaoIntercessao> findByPedidoOracaoIdAndUsuarioId(Long pedidoOracaoId, Long usuarioId);

    long countByPedidoOracaoId(Long pedidoOracaoId);

    void deleteByPedidoOracaoIdAndUsuarioId(Long pedidoOracaoId, Long usuarioId);
}
