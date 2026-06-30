package br.com.semear.repository;

import br.com.semear.domain.MonitoramentoAlertaEnviado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MonitoramentoAlertaEnviadoRepository extends JpaRepository<MonitoramentoAlertaEnviado, String> {}
