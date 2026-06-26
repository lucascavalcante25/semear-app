package br.com.semear.repository;

import br.com.semear.domain.UsuarioDispositivoPush;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioDispositivoPushRepository extends JpaRepository<UsuarioDispositivoPush, Long> {
    List<UsuarioDispositivoPush> findByUserIdAndIgrejaIdAndAtivoTrue(Long userId, Long igrejaId);

    Optional<UsuarioDispositivoPush> findByUserIdAndToken(Long userId, String token);

    List<UsuarioDispositivoPush> findByUserIdAndIgrejaIdAndAtivoTrueOrderByAtualizadoEmDesc(Long userId, Long igrejaId);

    boolean existsByUserIdAndIgrejaIdAndAtivoTrue(Long userId, Long igrejaId);
}
