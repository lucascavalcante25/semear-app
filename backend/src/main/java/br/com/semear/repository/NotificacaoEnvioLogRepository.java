package br.com.semear.repository;

import br.com.semear.domain.NotificacaoEnvioLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificacaoEnvioLogRepository extends JpaRepository<NotificacaoEnvioLog, Long> {
    boolean existsByChaveDeduplicacao(String chaveDeduplicacao);
}
