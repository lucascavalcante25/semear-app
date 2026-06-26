package br.com.semear.repository;

import br.com.semear.domain.UsuarioPreferenciaNotificacao;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioPreferenciaNotificacaoRepository extends JpaRepository<UsuarioPreferenciaNotificacao, Long> {
    Optional<UsuarioPreferenciaNotificacao> findByUserIdAndIgrejaId(Long userId, Long igrejaId);

    @Query(
        "SELECT p FROM UsuarioPreferenciaNotificacao p JOIN FETCH p.user " +
        "WHERE p.igreja.id = :igrejaId AND p.devocionalAtivo = true AND p.pushAtivo = true"
    )
    List<UsuarioPreferenciaNotificacao> findByIgrejaIdAndDevocionalAtivoTrueAndPushAtivoTrue(@Param("igrejaId") Long igrejaId);
}
