package br.com.semear.repository;

import br.com.semear.domain.ComunicadoLeitura;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComunicadoLeituraRepository extends JpaRepository<ComunicadoLeitura, Long> {
    boolean existsByComunicadoIdAndUsuarioId(Long comunicadoId, Long usuarioId);

    List<ComunicadoLeitura> findByComunicadoIdOrderByConfirmadoEmDesc(Long comunicadoId);
}
