package br.com.semear.repository;

import br.com.semear.domain.NotificacaoUsuario;
import br.com.semear.domain.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificacaoUsuarioRepository extends JpaRepository<NotificacaoUsuario, Long> {
    List<NotificacaoUsuario> findByUserAndLidaFalseOrderByCriadoEmDesc(User user);
    Optional<NotificacaoUsuario> findByIdAndUserId(Long id, Long userId);
    boolean existsByUserIdAndTipoAndMensagemAndLidaFalse(Long userId, String tipo, String mensagem);
}
