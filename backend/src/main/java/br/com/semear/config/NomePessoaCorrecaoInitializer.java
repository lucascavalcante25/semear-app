package br.com.semear.config;

import br.com.semear.service.NomePessoaCorrecaoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Corrige nomes em caixa alta já persistidos (ex.: pré-cadastros antigos em produção).
 * Idempotente: só atualiza registros que ainda precisam de normalização.
 */
@Component
@Order(Integer.MAX_VALUE - 10)
public class NomePessoaCorrecaoInitializer implements ApplicationRunner {

    private static final Logger LOG = LoggerFactory.getLogger(NomePessoaCorrecaoInitializer.class);

    private final NomePessoaCorrecaoService nomePessoaCorrecaoService;

    public NomePessoaCorrecaoInitializer(NomePessoaCorrecaoService nomePessoaCorrecaoService) {
        this.nomePessoaCorrecaoService = nomePessoaCorrecaoService;
    }

    @Override
    public void run(ApplicationArguments args) {
        try {
            int usuarios = nomePessoaCorrecaoService.corrigirUsuariosExistentes();
            int preCadastros = nomePessoaCorrecaoService.corrigirPreCadastrosExistentes();
            if (usuarios > 0 || preCadastros > 0) {
                LOG.info("Nomes de pessoas normalizados na subida: {} usuário(s), {} pré-cadastro(s)", usuarios, preCadastros);
            }
        } catch (Exception e) {
            LOG.error("Falha ao normalizar nomes existentes: {}", e.getMessage(), e);
        }
    }
}
