package br.com.semear.service.util;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.semear.domain.Departamento;
import br.com.semear.domain.Escala;
import br.com.semear.domain.enumeration.CodigoDepartamento;
import br.com.semear.domain.enumeration.StatusEscalaPublicacao;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import org.junit.jupiter.api.Test;

class EscalaNotificacaoUtilsTest {

    private static final ZoneId ZONE_BR = ZoneId.of("America/Sao_Paulo");

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

    @Test
    void janelaLembretesPeriodicosLimitaAntecedencia() {
        LocalDate hoje = LocalDate.of(2026, 6, 26);
        Escala escala = escalaComData(hoje.plusDays(30));
        assertThat(EscalaNotificacaoUtils.escalaDentroDaJanelaLembretesPeriodicos(escala, hoje)).isFalse();

        escala = escalaComData(hoje.plusDays(15));
        assertThat(EscalaNotificacaoUtils.escalaDentroDaJanelaLembretesPeriodicos(escala, hoje)).isTrue();

        escala = escalaComData(hoje.plusDays(3));
        assertThat(EscalaNotificacaoUtils.escalaDentroDaJanelaLembretesPeriodicos(escala, hoje)).isTrue();
    }

    private static Escala escalaComData(LocalDate data) {
        Escala escala = new Escala();
        escala.setStatus(StatusEscalaPublicacao.PUBLICADA);
        escala.setDepartamento(dep("Portaria", CodigoDepartamento.PORTARIA));
        escala.setDataEvento(data.atStartOfDay(ZONE_BR).plusHours(10).toInstant());
        return escala;
    }

    private static Departamento dep(String nome, CodigoDepartamento codigo) {
        Departamento d = new Departamento();
        d.setNome(nome);
        d.setCodigo(codigo);
        return d;
    }
}
