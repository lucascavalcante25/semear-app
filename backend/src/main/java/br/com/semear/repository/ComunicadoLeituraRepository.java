package br.com.semear.repository;

import br.com.semear.domain.ComunicadoLeitura;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ComunicadoLeituraRepository extends JpaRepository<ComunicadoLeitura, Long> {
    boolean existsByComunicadoIdAndUsuarioId(Long comunicadoId, Long usuarioId);

    List<ComunicadoLeitura> findByComunicadoIdOrderByConfirmadoEmDesc(Long comunicadoId);

    @Modifying
    @Query("DELETE FROM ComunicadoLeitura cl WHERE cl.comunicado.id = :comunicadoId")
    void deleteByComunicadoId(@Param("comunicadoId") Long comunicadoId);
}
