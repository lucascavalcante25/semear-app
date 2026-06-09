package br.com.semear.repository;

import br.com.semear.domain.RecuperacaoSenha;
import br.com.semear.domain.User;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecuperacaoSenhaRepository extends JpaRepository<RecuperacaoSenha, Long> {
    Optional<RecuperacaoSenha> findFirstByUserAndUsadoIsFalseAndExpiraEmAfterOrderByCriadoEmDesc(User user, Instant agora);

    List<RecuperacaoSenha> findAllByUserAndUsadoIsFalse(User user);

    long countByUserAndCriadoEmAfter(User user, Instant desde);
}
