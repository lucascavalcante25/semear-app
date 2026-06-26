package br.com.semear.service.util;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.semear.domain.Departamento;
import br.com.semear.domain.Escala;
import br.com.semear.domain.enumeration.CodigoDepartamento;
import br.com.semear.domain.enumeration.StatusEscalaPublicacao;
import org.junit.jupiter.api.Test;

class EscalaNotificacaoUtilsTest {

    @Test
    void reconheceDepartamentosOperacionais() {
        assertThat(EscalaNotificacaoUtils.departamentoOperacional(dep("Portaria", CodigoDepartamento.PORTARIA))).isTrue();
        assertThat(EscalaNotificacaoUtils.departamentoOperacional(dep("Recepção", CodigoDepartamento.RECEPCAO))).isTrue();
        assertThat(EscalaNotificacaoUtils.departamentoOperacional(dep("Limpeza", CodigoDepartamento.LIMPEZA))).isTrue();
        assertThat(EscalaNotificacaoUtils.departamentoOperacional(dep("Louvor", CodigoDepartamento.OUTRO))).isFalse();
    }

    @Test
    void escalaPublicadaOperacionalElegivel() {
        Escala escala = new Escala();
        escala.setStatus(StatusEscalaPublicacao.PUBLICADA);
        escala.setDepartamento(dep("Portaria", CodigoDepartamento.PORTARIA));
        assertThat(EscalaNotificacaoUtils.escalaElegivelParaNotificacao(escala)).isTrue();

        escala.setStatus(StatusEscalaPublicacao.RASCUNHO);
        assertThat(EscalaNotificacaoUtils.escalaElegivelParaNotificacao(escala)).isFalse();
    }

    private static Departamento dep(String nome, CodigoDepartamento codigo) {
        Departamento d = new Departamento();
        d.setNome(nome);
        d.setCodigo(codigo);
        return d;
    }
}
