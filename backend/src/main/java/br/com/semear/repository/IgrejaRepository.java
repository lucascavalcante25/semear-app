package br.com.semear.repository;

import br.com.semear.domain.Igreja;
import br.com.semear.domain.enumeration.StatusIgreja;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface IgrejaRepository extends JpaRepository<Igreja, Long> {

    Optional<Igreja> findFirstByStatusOrderByIdAsc(StatusIgreja status);

    @Query(
        """
        SELECT i FROM Igreja i WHERE
        (:nome IS NULL OR LOWER(i.nome) LIKE LOWER(CONCAT('%', :nome, '%')) OR LOWER(i.nomeFantasia) LIKE LOWER(CONCAT('%', :nome, '%')))
        AND (:cnpj IS NULL OR i.cnpj LIKE CONCAT('%', :cnpj, '%'))
        AND (:cidade IS NULL OR LOWER(i.cidade) LIKE LOWER(CONCAT('%', :cidade, '%')))
        AND (:status IS NULL OR i.status = :status)
        ORDER BY i.nome ASC
        """
    )
    List<Igreja> buscarComFiltros(
        @Param("nome") String nome,
        @Param("cnpj") String cnpj,
        @Param("cidade") String cidade,
        @Param("status") StatusIgreja status
    );

    long countByStatus(StatusIgreja status);
}
