package br.com.semear.repository;

import br.com.semear.domain.PreCadastro;
import br.com.semear.domain.enumeration.StatusCadastro;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the PreCadastro entity.
 */
@SuppressWarnings("unused")
@Repository
public interface PreCadastroRepository extends JpaRepository<PreCadastro, Long> {

    boolean existsByEmailIgnoreCase(String email);
    boolean existsByCpf(String cpf);
    boolean existsByLogin(String login);

    Optional<PreCadastro> findOneByEmailIgnoreCase(String email);
    Optional<PreCadastro> findOneByCpf(String cpf);
    Optional<PreCadastro> findOneByLogin(String login);

    List<PreCadastro> findByStatusIn(List<StatusCadastro> statuses);

    @Query("SELECT p FROM PreCadastro p LEFT JOIN FETCH p.endereco WHERE p.id = :id")
    Optional<PreCadastro> findByIdWithEndereco(@Param("id") Long id);
}
