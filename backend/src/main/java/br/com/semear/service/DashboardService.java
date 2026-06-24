package br.com.semear.service;

import br.com.semear.domain.Aviso;
import br.com.semear.domain.Lancamento;
import br.com.semear.domain.User;
import br.com.semear.domain.enumeration.StatusCadastro;
import br.com.semear.domain.enumeration.StatusPedidoOracao;
import br.com.semear.domain.enumerations.TipoLancamento;
import br.com.semear.repository.AvisoRepository;
import br.com.semear.repository.DocumentoIgrejaRepository;
import br.com.semear.repository.LancamentoRepository;
import br.com.semear.repository.PedidoOracaoRepository;
import br.com.semear.repository.PreCadastroRepository;
import br.com.semear.repository.UserRepository;
import br.com.semear.repository.VisitanteRepository;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.service.dto.DashboardResumoDTO;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private static final List<StatusPedidoOracao> STATUS_PEDIDOS_ABERTOS = List.of(
        StatusPedidoOracao.AGUARDANDO_APROVACAO,
        StatusPedidoOracao.ABERTO,
        StatusPedidoOracao.EM_INTERCESSAO
    );

    private static final List<StatusCadastro> STATUS_PRE_CADASTRO_PENDENTE = List.of(
        StatusCadastro.PRIMEIROACESSO,
        StatusCadastro.PENDENTE
    );

    private final UserRepository userRepository;
    private final VisitanteRepository visitanteRepository;
    private final PedidoOracaoRepository pedidoOracaoRepository;
    private final PreCadastroRepository preCadastroRepository;
    private final LancamentoRepository lancamentoRepository;
    private final AvisoRepository avisoRepository;
    private final DocumentoIgrejaRepository documentoIgrejaRepository;
    private final TenantService tenantService;

    public DashboardService(
        UserRepository userRepository,
        VisitanteRepository visitanteRepository,
        PedidoOracaoRepository pedidoOracaoRepository,
        PreCadastroRepository preCadastroRepository,
        LancamentoRepository lancamentoRepository,
        AvisoRepository avisoRepository,
        DocumentoIgrejaRepository documentoIgrejaRepository,
        TenantService tenantService
    ) {
        this.userRepository = userRepository;
        this.visitanteRepository = visitanteRepository;
        this.pedidoOracaoRepository = pedidoOracaoRepository;
        this.preCadastroRepository = preCadastroRepository;
        this.lancamentoRepository = lancamentoRepository;
        this.avisoRepository = avisoRepository;
        this.documentoIgrejaRepository = documentoIgrejaRepository;
        this.tenantService = tenantService;
    }

    public DashboardResumoDTO obterResumo() {
        Long igrejaId = tenantService.getIgrejaIdAtual();
        User usuario = tenantService.getUsuarioAtual();
        LocalDate hoje = LocalDate.now();
        LocalDate inicioMes = hoje.withDayOfMonth(1);
        LocalDate fimMes = hoje.withDayOfMonth(hoje.lengthOfMonth());

        DashboardResumoDTO dto = new DashboardResumoDTO();
        dto.setTotalMembros(userRepository.countByIgrejaIdAndActivatedIsTrue(igrejaId));
        dto.setTotalVisitantes(visitanteRepository.countByIgrejaId(igrejaId));
        dto.setVisitantesMes(visitanteRepository.countByIgrejaIdAndDataVisitaBetween(igrejaId, inicioMes, fimMes));
        dto.setPedidosOracaoAbertos(pedidoOracaoRepository.countByIgrejaIdAndDeletedAtIsNullAndStatusIn(igrejaId, STATUS_PEDIDOS_ABERTOS));
        dto.setPreCadastrosPendentes(
            preCadastroRepository.countByIgrejaIdAndStatusIn(igrejaId, STATUS_PRE_CADASTRO_PENDENTE)
        );

        if (usuarioTemAcessoFinanceiro(usuario)) {
            dto.setSaldoMes(calcularSaldoMes(igrejaId, inicioMes, fimMes));
        }

        List<User> usuariosAtivos = userRepository.findAllByIgrejaIdAndActivatedIsTrue(igrejaId);
        List<DashboardResumoDTO.AniversarianteResumoDTO> aniversariantes = new java.util.ArrayList<>();

        for (User u : usuariosAtivos) {
            if (dataCoincideHoje(u.getBirthDate(), hoje)) {
                aniversariantes.add(new DashboardResumoDTO.AniversarianteResumoDTO(u.getId(), montarNome(u), "NASCIMENTO"));
            }
            if (dataCoincideHoje(u.getDataBatismo(), hoje)) {
                aniversariantes.add(new DashboardResumoDTO.AniversarianteResumoDTO(u.getId(), montarNome(u), "BATISMO"));
            }
            if (dataCoincideHoje(u.getDataCasamento(), hoje)) {
                aniversariantes.add(new DashboardResumoDTO.AniversarianteResumoDTO(u.getId(), montarNome(u), "CASAMENTO"));
            }
            if (dataCoincideHoje(u.getDataMembroSince(), hoje)) {
                aniversariantes.add(new DashboardResumoDTO.AniversarianteResumoDTO(u.getId(), montarNome(u), "MEMBRO"));
            }
        }

        dto.setAniversariantesHoje(aniversariantes.size());
        dto.setAniversariantes(aniversariantes.stream().limit(10).toList());

        dto.setAvisosAtivos(contarAvisosAtivos(igrejaId, hoje));
        dto.setDocumentosVencendo(
            documentoIgrejaRepository
                .findByIgrejaIdAndAtivoTrueAndDataValidadeBetweenOrderByDataValidadeAsc(igrejaId, hoje, hoje.plusDays(30))
                .size()
        );

        return dto;
    }

    private long contarAvisosAtivos(Long igrejaId, LocalDate hoje) {
        return avisoRepository
            .findAllByIgrejaIdAndAtivoIsTrue(PageRequest.of(0, 500), igrejaId)
            .getContent()
            .stream()
            .filter(a -> avisoVigente(a, hoje))
            .count();
    }

    private boolean avisoVigente(Aviso aviso, LocalDate referencia) {
        if (aviso.getDataInicio() != null && referencia.isBefore(aviso.getDataInicio())) {
            return false;
        }
        if (aviso.getDataFim() != null && referencia.isAfter(aviso.getDataFim())) {
            return false;
        }
        return true;
    }

    private BigDecimal calcularSaldoMes(Long igrejaId, LocalDate inicio, LocalDate fim) {
        List<Lancamento> lancamentos = lancamentoRepository.findByIgrejaIdAndPeriodo(igrejaId, inicio, fim);
        BigDecimal saldo = BigDecimal.ZERO;
        for (Lancamento l : lancamentos) {
            if (l.getTipo() == TipoLancamento.INCOME) {
                saldo = saldo.add(l.getValor());
            } else if (l.getTipo() == TipoLancamento.EXPENSE) {
                saldo = saldo.subtract(l.getValor());
            }
        }
        return saldo;
    }

    private boolean usuarioTemAcessoFinanceiro(User user) {
        return user
            .getAuthorities()
            .stream()
            .anyMatch(a ->
                AuthoritiesConstants.ADMIN.equals(a.getName()) ||
                AuthoritiesConstants.ADMIN_IGREJA.equals(a.getName()) ||
                AuthoritiesConstants.TESOURARIA.equals(a.getName()) ||
                AuthoritiesConstants.PASTOR.equals(a.getName()) ||
                AuthoritiesConstants.SECRETARIA.equals(a.getName())
            );
    }

    private String montarNome(User user) {
        String primeiro = Objects.toString(user.getFirstName(), "").trim();
        String ultimo = Objects.toString(user.getLastName(), "").trim();
        String nome = (primeiro + " " + ultimo).trim();
        return nome.isBlank() ? user.getLogin() : nome;
    }

    private boolean dataCoincideHoje(LocalDate data, LocalDate hoje) {
        if (data == null) {
            return false;
        }
        return LocalDate.of(hoje.getYear(), data.getMonth(), data.getDayOfMonth()).equals(hoje);
    }
}
