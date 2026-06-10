package br.com.semear.repository;

import br.com.semear.domain.Plano;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PlanoRepository extends JpaRepository<Plano, Long> {
    List<Plano> findAllByOrderByOrdemExibicaoAscValorMensalAsc();

    /** Consulta direta ao banco (evita cache de entidade com schema antigo). */
    @Query(
        value = """
        SELECT nome, descricao, valor_mensal, valor_anual, valor_implantacao,
               promocao_implantacao_anual, dias_trial, desconto_anual_percentual, texto_botao
        FROM plano WHERE id = ?1
        """,
        nativeQuery = true
    )
    Optional<Object[]> findDadosPublicosById(Long id);
}
