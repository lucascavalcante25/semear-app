package br.com.semear.repository;

import br.com.semear.domain.InformativoLeitura;
import br.com.semear.domain.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InformativoLeituraRepository extends JpaRepository<InformativoLeitura, Long> {
    boolean existsByInformativoIdAndUsuarioId(Long informativoId, Long usuarioId);

    Optional<InformativoLeitura> findByInformativoIdAndUsuarioId(Long informativoId, Long usuarioId);

    List<InformativoLeitura> findByInformativoIdOrderByConfirmadoEmDesc(Long informativoId);

    List<InformativoLeitura> findByUsuario(User usuario);
}
