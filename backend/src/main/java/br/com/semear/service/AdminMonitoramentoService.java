package br.com.semear.service;

import br.com.semear.domain.enumeration.StatusIgreja;
import br.com.semear.repository.ComunicadoRepository;
import br.com.semear.repository.EventoRepository;
import br.com.semear.repository.IgrejaRepository;
import br.com.semear.repository.NotificacaoEnvioLogRepository;
import br.com.semear.repository.UserRepository;
import br.com.semear.repository.UsuarioDispositivoPushRepository;
import br.com.semear.repository.MonitoramentoSnapshotRepository;
import br.com.semear.domain.MonitoramentoSnapshot;
import br.com.semear.service.dto.AdminMonitoramentoDTO;
import br.com.semear.service.dto.MonitoramentoSnapshotDTO;
import br.com.semear.service.dto.AdminMonitoramentoDTO.IgrejaUsoDTO;
import br.com.semear.service.dto.AdminMonitoramentoDTO.ServicoStatusDTO;
import br.com.semear.service.dto.AdminMonitoramentoDTO.TabelaVolumeDTO;
import com.zaxxer.hikari.HikariDataSource;
import com.zaxxer.hikari.HikariPoolMXBean;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.search.Search;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.ThreadMXBean;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.HealthComponent;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.boot.actuate.health.Status;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AdminMonitoramentoService {

    @PersistenceContext
    private EntityManager entityManager;

    private final HealthEndpoint healthEndpoint;
    private final MeterRegistry meterRegistry;
    private final DataSource dataSource;
    private final IgrejaRepository igrejaRepository;
    private final UserRepository userRepository;
    private final ComunicadoRepository comunicadoRepository;
    private final EventoRepository eventoRepository;
    private final UsuarioDispositivoPushRepository dispositivoPushRepository;
    private final NotificacaoEnvioLogRepository envioLogRepository;
    private final MonitoramentoSnapshotRepository snapshotRepository;

    @Value("${semear.push.enabled:false}")
    private boolean pushHabilitado;

    public AdminMonitoramentoService(
        HealthEndpoint healthEndpoint,
        MeterRegistry meterRegistry,
        DataSource dataSource,
        IgrejaRepository igrejaRepository,
        UserRepository userRepository,
        ComunicadoRepository comunicadoRepository,
        EventoRepository eventoRepository,
        UsuarioDispositivoPushRepository dispositivoPushRepository,
        NotificacaoEnvioLogRepository envioLogRepository,
        MonitoramentoSnapshotRepository snapshotRepository
    ) {
        this.healthEndpoint = healthEndpoint;
        this.meterRegistry = meterRegistry;
        this.dataSource = dataSource;
        this.igrejaRepository = igrejaRepository;
        this.userRepository = userRepository;
        this.comunicadoRepository = comunicadoRepository;
        this.eventoRepository = eventoRepository;
        this.dispositivoPushRepository = dispositivoPushRepository;
        this.envioLogRepository = envioLogRepository;
        this.snapshotRepository = snapshotRepository;
    }

    public AdminMonitoramentoDTO coletar() {
        AdminMonitoramentoDTO dto = new AdminMonitoramentoDTO();
        dto.setColetadoEm(Instant.now());
        dto.setUptimeSegundos(ManagementFactory.getRuntimeMXBean().getUptime() / 1000);

        preencherSaude(dto);
        preencherJvm(dto);
        preencherPoolConexoes(dto);
        preencherHttp(dto);
        preencherPlataforma(dto);
        preencherTopIgrejas(dto);
        preencherVolumesTabela(dto);
        preencherServicos(dto);
        preencherAlertas(dto);

        return dto;
    }

    @Transactional(readOnly = false)
    public void salvarSnapshot(AdminMonitoramentoDTO dto) {
        MonitoramentoSnapshot snap = new MonitoramentoSnapshot();
        snap.setColetadoEm(dto.getColetadoEm() != null ? dto.getColetadoEm() : Instant.now());
        snap.setStatusGeral(dto.getStatusGeral());
        snap.setStatusBanco(dto.getStatusBanco());
        snap.setMemoriaPercentual(dto.getMemoriaPercentual());
        snap.setCpuPercentual(dto.getCpuPercentual());
        snap.setConexoesAtivas(dto.getConexoesAtivas());
        snap.setConexoesMax(dto.getConexoesMax());
        snap.setRequisicoesPorMinuto(dto.getRequisicoesPorMinuto());
        snap.setLatenciaMediaMs(dto.getLatenciaMediaMs());
        snap.setTotalUsuarios(dto.getTotalUsuarios());
        snap.setTotalIgrejas(dto.getTotalIgrejas());
        snapshotRepository.save(snap);
    }

    public List<MonitoramentoSnapshotDTO> obterHistorico(int horas) {
        int horasLimitadas = Math.min(Math.max(horas, 1), 168);
        Instant desde = Instant.now().minus(horasLimitadas, ChronoUnit.HOURS);
        return snapshotRepository.findByColetadoEmAfterOrderByColetadoEmAsc(desde).stream().map(this::toDto).toList();
    }

    private MonitoramentoSnapshotDTO toDto(MonitoramentoSnapshot snap) {
        MonitoramentoSnapshotDTO dto = new MonitoramentoSnapshotDTO();
        dto.setColetadoEm(snap.getColetadoEm());
        dto.setStatusGeral(snap.getStatusGeral());
        dto.setStatusBanco(snap.getStatusBanco());
        dto.setMemoriaPercentual(snap.getMemoriaPercentual() != null ? snap.getMemoriaPercentual() : 0);
        dto.setCpuPercentual(snap.getCpuPercentual() != null ? snap.getCpuPercentual() : 0);
        dto.setConexoesAtivas(snap.getConexoesAtivas() != null ? snap.getConexoesAtivas() : 0);
        dto.setConexoesMax(snap.getConexoesMax() != null ? snap.getConexoesMax() : 0);
        dto.setRequisicoesPorMinuto(snap.getRequisicoesPorMinuto() != null ? snap.getRequisicoesPorMinuto() : 0);
        dto.setLatenciaMediaMs(snap.getLatenciaMediaMs() != null ? snap.getLatenciaMediaMs() : 0);
        dto.setTotalUsuarios(snap.getTotalUsuarios() != null ? snap.getTotalUsuarios() : 0);
        dto.setTotalIgrejas(snap.getTotalIgrejas() != null ? snap.getTotalIgrejas() : 0);
        return dto;
    }

    private void preencherSaude(AdminMonitoramentoDTO dto) {
        HealthComponent health = healthEndpoint.health();
        dto.setStatusGeral(health.getStatus().getCode());

        if (health instanceof org.springframework.boot.actuate.health.CompositeHealth composite) {
            Map<String, HealthComponent> components = composite.getComponents();
            dto.setStatusBanco(extrairStatus(components.get("db")));
            dto.setStatusDisco(extrairStatus(components.get("diskSpace")));
        } else {
            dto.setStatusBanco(dto.getStatusGeral());
            dto.setStatusDisco("UNKNOWN");
        }
    }

    private String extrairStatus(HealthComponent component) {
        return component != null ? component.getStatus().getCode() : "UNKNOWN";
    }

    private void preencherJvm(AdminMonitoramentoDTO dto) {
        MemoryMXBean memory = ManagementFactory.getMemoryMXBean();
        long usado = memory.getHeapMemoryUsage().getUsed();
        long max = memory.getHeapMemoryUsage().getMax();
        dto.setMemoriaUsadaMb(bytesParaMb(usado));
        dto.setMemoriaMaxMb(bytesParaMb(max > 0 ? max : usado));
        dto.setMemoriaPercentual(max > 0 ? (int) Math.round((usado * 100.0) / max) : 0);

        Double cpu = meterRegistry.find("process.cpu.usage").gauge() != null
            ? meterRegistry.get("process.cpu.usage").gauge().value() * 100
            : null;
        dto.setCpuPercentual(cpu != null ? Math.round(cpu * 10.0) / 10.0 : 0);

        ThreadMXBean threads = ManagementFactory.getThreadMXBean();
        dto.setThreadsAtivas(threads.getThreadCount());
    }

    private void preencherPoolConexoes(AdminMonitoramentoDTO dto) {
        if (dataSource instanceof HikariDataSource hikari) {
            HikariPoolMXBean pool = hikari.getHikariPoolMXBean();
            if (pool != null) {
                dto.setConexoesAtivas(pool.getActiveConnections());
                dto.setConexoesIdle(pool.getIdleConnections());
                dto.setConexoesMax(hikari.getMaximumPoolSize());
                dto.setConexoesPendentes(pool.getThreadsAwaitingConnection());
            }
        }
    }

    private void preencherHttp(AdminMonitoramentoDTO dto) {
        Search search = meterRegistry.find("http.server.requests");
        var timer = search.timer();
        if (timer != null) {
            dto.setTotalRequisicoes((long) timer.count());
            dto.setLatenciaMediaMs(Math.round(timer.mean(java.util.concurrent.TimeUnit.MILLISECONDS) * 10.0) / 10.0);
            double count = timer.count();
            double uptimeMin = Math.max(dto.getUptimeSegundos() / 60.0, 1);
            dto.setRequisicoesPorMinuto(Math.round((count / uptimeMin) * 10.0) / 10.0);
        }
    }

    private void preencherPlataforma(AdminMonitoramentoDTO dto) {
        dto.setTotalIgrejas(igrejaRepository.count());
        dto.setIgrejasAtivas(igrejaRepository.countByStatus(StatusIgreja.ATIVA));
        dto.setTotalUsuarios(userRepository.count());
        dto.setUsuariosAtivos(userRepository.findAllByIdNotNullAndActivatedIsTrue(PageRequest.of(0, 1)).getTotalElements());
        dto.setTotalComunicados(comunicadoRepository.count());
        dto.setTotalEventos(eventoRepository.count());
        dto.setDispositivosPushAtivos(dispositivoPushRepository.countByAtivoTrue());
        dto.setNotificacoesEnviadas24h(envioLogRepository.countByCriadoEmAfter(Instant.now().minus(24, ChronoUnit.HOURS)));
        dto.setPushHabilitado(pushHabilitado);
    }

    private void preencherTopIgrejas(AdminMonitoramentoDTO dto) {
        List<IgrejaUsoDTO> top = new ArrayList<>();
        for (Object[] row : userRepository.findTopIgrejasPorUsuariosAtivos(PageRequest.of(0, 8))) {
            IgrejaUsoDTO item = new IgrejaUsoDTO();
            item.setIgrejaId((Long) row[0]);
            item.setNome((String) row[1]);
            item.setUsuariosAtivos((Long) row[2]);
            top.add(item);
        }
        dto.setTopIgrejasPorUsuarios(top);
    }

    @SuppressWarnings("unchecked")
    private void preencherVolumesTabela(AdminMonitoramentoDTO dto) {
        try {
            List<Object[]> rows = entityManager
                .createNativeQuery(
                    """
                    SELECT relname, COALESCE(n_live_tup, 0)
                    FROM pg_stat_user_tables
                    WHERE schemaname = 'public'
                    ORDER BY n_live_tup DESC
                    LIMIT 10
                    """
                )
                .getResultList();
            List<TabelaVolumeDTO> volumes = new ArrayList<>();
            for (Object[] row : rows) {
                TabelaVolumeDTO vol = new TabelaVolumeDTO();
                vol.setTabela(String.valueOf(row[0]));
                vol.setRegistrosEstimados(((Number) row[1]).longValue());
                volumes.add(vol);
            }
            dto.setVolumesTabela(volumes);
        } catch (Exception ignored) {
            dto.setVolumesTabela(List.of());
        }
    }

    private void preencherServicos(AdminMonitoramentoDTO dto) {
        List<ServicoStatusDTO> servicos = new ArrayList<>();
        servicos.add(new ServicoStatusDTO("Backend (Spring Boot)", dto.getStatusGeral(), "API principal"));
        servicos.add(new ServicoStatusDTO("PostgreSQL", dto.getStatusBanco(), "Banco de dados Supabase/Neon"));
        servicos.add(new ServicoStatusDTO("Armazenamento", dto.getStatusDisco(), "Disco do servidor"));
        servicos.add(
            new ServicoStatusDTO(
                "Push (Firebase)",
                pushHabilitado ? "UP" : "DISABLED",
                pushHabilitado
                    ? dto.getDispositivosPushAtivos() + " dispositivo(s) ativo(s)"
                    : "Desabilitado — ative via SEMEAR_PUSH_ENABLED"
            )
        );
        dto.setServicos(servicos);
    }

    private void preencherAlertas(AdminMonitoramentoDTO dto) {
        List<String> alertas = new ArrayList<>();
        if (dto.getMemoriaPercentual() >= 85) {
            alertas.add("Memória JVM acima de 85% — considere aumentar recursos do backend.");
        }
        if (dto.getConexoesMax() > 0 && dto.getConexoesAtivas() >= dto.getConexoesMax() * 0.9) {
            alertas.add("Pool de conexões quase esgotado — verifique limites do Supabase.");
        }
        if (!Status.UP.getCode().equals(dto.getStatusBanco())) {
            alertas.add("Banco de dados com status " + dto.getStatusBanco() + ".");
        }
        if (dto.getRequisicoesPorMinuto() > 120) {
            alertas.add("Alto volume de requisições (" + dto.getRequisicoesPorMinuto() + "/min) — monitore banda do Render/Vercel.");
        }
        if (!pushHabilitado && dto.getDispositivosPushAtivos() > 0) {
            alertas.add("Há dispositivos push registrados, mas o envio está desabilitado.");
        }
        dto.setAlertas(alertas);
    }

    private static double bytesParaMb(long bytes) {
        return Math.round((bytes / 1024.0 / 1024.0) * 10.0) / 10.0;
    }
}
