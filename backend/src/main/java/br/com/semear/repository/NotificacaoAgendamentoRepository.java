package br.com.semear.repository;

import br.com.semear.domain.NotificacaoAgendamento;
import br.com.semear.domain.enumeration.StatusNotificacaoAgendamento;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificacaoAgendamentoRepository extends JpaRepository<NotificacaoAgendamento, Long> {
    List<NotificacaoAgendamento> findByEntidadeTipoAndEntidadeIdAndStatus(
        String entidadeTipo,
        Long entidadeId,
        StatusNotificacaoAgendamento status
    );

    List<NotificacaoAgendamento> findByEntidadeTipoAndEntidadeId(String entidadeTipo, Long entidadeId);

    List<NotificacaoAgendamento> findByStatusAndAgendadoParaLessThanEqual(
        StatusNotificacaoAgendamento status,
        Instant limite
    );
}
