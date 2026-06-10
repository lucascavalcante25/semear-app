package br.com.semear.service;

import br.com.semear.domain.AssinaturaIgreja;
import br.com.semear.domain.Igreja;
import br.com.semear.domain.PagamentoPlataforma;
import br.com.semear.domain.Plano;
import br.com.semear.domain.enumeration.FormaPagamentoPlataforma;
import br.com.semear.domain.enumeration.StatusAssinatura;
import br.com.semear.domain.enumeration.StatusIgreja;
import br.com.semear.domain.enumeration.StatusPagamentoPlataforma;
import br.com.semear.domain.enumeration.TipoPagamentoPlataforma;
import br.com.semear.repository.AssinaturaIgrejaRepository;
import br.com.semear.repository.PagamentoPlataformaRepository;
import br.com.semear.repository.PlanoRepository;
import br.com.semear.security.SecurityUtils;
import br.com.semear.service.dto.AssinaturaAcessoDTO;
import br.com.semear.service.dto.AssinaturaIgrejaDTO;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AssinaturaIgrejaService {

    private static final String ENTITY = "assinaturaIgreja";
    private static final Long PLANO_LANCAMENTO_ID = 1L;

    private final AssinaturaIgrejaRepository assinaturaIgrejaRepository;
    private final PagamentoPlataformaRepository pagamentoPlataformaRepository;
    private final PlanoRepository planoRepository;
    private final NotificacaoService notificacaoService;

    public AssinaturaIgrejaService(
        AssinaturaIgrejaRepository assinaturaIgrejaRepository,
        PagamentoPlataformaRepository pagamentoPlataformaRepository,
        PlanoRepository planoRepository,
        NotificacaoService notificacaoService
    ) {
        this.assinaturaIgrejaRepository = assinaturaIgrejaRepository;
        this.pagamentoPlataformaRepository = pagamentoPlataformaRepository;
        this.planoRepository = planoRepository;
        this.notificacaoService = notificacaoService;
    }

    public AssinaturaIgreja iniciarTesteGratis(Igreja igreja, String responsavelNome) {
        Optional<AssinaturaIgreja> existente = assinaturaIgrejaRepository.findFirstByIgrejaIdOrderByDataCadastroDesc(igreja.getId());
        if (existente.isPresent()) {
            return existente.orElseThrow();
        }

        Plano plano = planoRepository
            .findById(PLANO_LANCAMENTO_ID)
            .orElseGet(() -> planoRepository.findAllByOrderByOrdemExibicaoAscValorMensalAsc().stream().findFirst().orElseThrow());

        LocalDate hoje = LocalDate.now();
        int diasTrial = plano.getDiasTrial() != null ? plano.getDiasTrial() : 7;

        AssinaturaIgreja assinatura = new AssinaturaIgreja();
        assinatura.setIgreja(igreja);
        assinatura.setPlano(plano);
        assinatura.setValorMensal(plano.getValorMensal());
        assinatura.setStatusPagamento(StatusPagamentoPlataforma.PENDENTE);
        assinatura.setStatusAssinatura(StatusAssinatura.EM_TESTE);
        assinatura.setDataInicioTeste(hoje);
        assinatura.setDataFimTeste(hoje.plusDays(diasTrial));
        assinatura.setValorImplantacaoContratado(plano.getValorImplantacao());
        assinatura.setValorMensalContratado(plano.getValorMensal());
        assinatura.setValorAnualContratado(plano.getValorAnual());
        assinatura.setStatusImplantacao(StatusPagamentoPlataforma.PENDENTE);
        assinatura.setStatusMensalidade(StatusPagamentoPlataforma.PENDENTE);
        assinatura.setResponsavelNome(responsavelNome);
        assinatura.setDataCadastro(Instant.now());
        assinatura = assinaturaIgrejaRepository.save(assinatura);

        criarPagamentoPendente(assinatura, TipoPagamentoPlataforma.IMPLANTACAO, plano.getValorImplantacao(), null);

        notificacaoService.notificarTesteIniciado(igreja, assinatura);
        return assinatura;
    }

    @Transactional(readOnly = true)
    public List<AssinaturaIgrejaDTO> listarTodas() {
        sincronizarVencimentos();
        return assinaturaIgrejaRepository.findAllByOrderByDataCadastroDesc().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public Optional<AssinaturaIgrejaDTO> buscarPorIgreja(Long igrejaId) {
        sincronizarVencimentos();
        return assinaturaIgrejaRepository.findFirstByIgrejaIdOrderByDataCadastroDesc(igrejaId).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public AssinaturaAcessoDTO verificarAcesso(Long igrejaId) {
        sincronizarVencimentos();
        AssinaturaAcessoDTO dto = new AssinaturaAcessoDTO();
        dto.setIgrejaId(igrejaId);

        Optional<AssinaturaIgreja> opt = assinaturaIgrejaRepository.findFirstByIgrejaIdOrderByDataCadastroDesc(igrejaId);
        if (opt.isEmpty()) {
            dto.setAcessoPermitido(true);
            dto.setMensagem(null);
            return dto;
        }

        AssinaturaIgreja a = opt.orElseThrow();
        int diasRestantes = calcularDiasRestantes(a);
        dto.setStatusAssinatura(a.getStatusAssinatura());
        dto.setDiasRestantesTeste(diasRestantes);
        dto.setDataFimTeste(a.getDataFimTeste());
        dto.setAcessoPermitido(podeAcessar(a));
        if (!dto.isAcessoPermitido()) {
            dto.setMensagem(
                "O período de teste da sua igreja terminou. Para continuar usando a plataforma, entre em contato com o suporte e ative sua assinatura."
            );
        } else if (a.getStatusAssinatura() == StatusAssinatura.EM_TESTE && diasRestantes >= 0) {
            dto.setMensagem("Seu teste grátis termina em " + diasRestantes + (diasRestantes == 1 ? " dia." : " dias."));
        }
        return dto;
    }

    public AssinaturaIgrejaDTO ativar(Long id) {
        AssinaturaIgreja a = buscar(id);
        a.setStatusAssinatura(StatusAssinatura.ATIVA);
        a.setDataAtivacao(LocalDate.now());
        a.setStatusPagamento(StatusPagamentoPlataforma.PAGO);
        a.setStatusMensalidade(StatusPagamentoPlataforma.PAGO);
        a.setProximoVencimento(LocalDate.now().plusMonths(1));
        a.setDataAtualizacao(Instant.now());
        if (a.getIgreja() != null) {
            a.getIgreja().setStatus(StatusIgreja.ATIVA);
        }
        notificacaoService.notificarAssinaturaAtivada(a.getIgreja());
        return toDto(assinaturaIgrejaRepository.save(a));
    }

    public AssinaturaIgrejaDTO prorrogarTeste(Long id, int dias) {
        if (dias < 1 || dias > 30) {
            throw new BadRequestAlertException("Dias de prorrogação inválidos (1-30)", ENTITY, "diasinvalidos");
        }
        AssinaturaIgreja a = buscar(id);
        LocalDate base = a.getDataFimTeste() != null && a.getDataFimTeste().isAfter(LocalDate.now())
            ? a.getDataFimTeste()
            : LocalDate.now();
        a.setDataFimTeste(base.plusDays(dias));
        a.setStatusAssinatura(StatusAssinatura.EM_TESTE);
        a.setDataAtualizacao(Instant.now());
        if (a.getIgreja() != null) {
            a.getIgreja().setStatus(StatusIgreja.EM_TESTE);
        }
        return toDto(assinaturaIgrejaRepository.save(a));
    }

    public AssinaturaIgrejaDTO suspender(Long id, String motivo) {
        AssinaturaIgreja a = buscar(id);
        a.setStatusAssinatura(StatusAssinatura.SUSPENSA);
        a.setDataSuspensao(LocalDate.now());
        a.setMotivoSuspensao(motivo);
        a.setDataAtualizacao(Instant.now());
        if (a.getIgreja() != null) {
            a.getIgreja().setStatus(StatusIgreja.INATIVA);
        }
        notificacaoService.notificarAcessoSuspenso(a.getIgreja());
        return toDto(assinaturaIgrejaRepository.save(a));
    }

    public AssinaturaIgrejaDTO reativar(Long id) {
        AssinaturaIgreja a = buscar(id);
        a.setStatusAssinatura(StatusAssinatura.ATIVA);
        a.setDataSuspensao(null);
        a.setMotivoSuspensao(null);
        a.setDataAtualizacao(Instant.now());
        if (a.getIgreja() != null) {
            a.getIgreja().setStatus(StatusIgreja.ATIVA);
        }
        notificacaoService.notificarAcessoReativado(a.getIgreja());
        return toDto(assinaturaIgrejaRepository.save(a));
    }

    public AssinaturaIgrejaDTO cancelar(Long id) {
        AssinaturaIgreja a = buscar(id);
        a.setStatusAssinatura(StatusAssinatura.CANCELADA);
        a.setStatusPagamento(StatusPagamentoPlataforma.CANCELADO);
        a.setDataAtualizacao(Instant.now());
        if (a.getIgreja() != null) {
            a.getIgreja().setStatus(StatusIgreja.INATIVA);
        }
        return toDto(assinaturaIgrejaRepository.save(a));
    }

    public AssinaturaIgrejaDTO marcarImplantacaoPaga(Long id, FormaPagamentoPlataforma forma) {
        AssinaturaIgreja a = buscar(id);
        a.setStatusImplantacao(StatusPagamentoPlataforma.PAGO);
        a.setFormaPagamento(forma);
        a.setDataAtualizacao(Instant.now());
        registrarPagamentoRecebido(a, TipoPagamentoPlataforma.IMPLANTACAO, a.getValorImplantacaoContratado(), forma);
        return toDto(assinaturaIgrejaRepository.save(a));
    }

    public AssinaturaIgrejaDTO marcarMensalidadePaga(Long id, FormaPagamentoPlataforma forma) {
        AssinaturaIgreja a = buscar(id);
        a.setStatusMensalidade(StatusPagamentoPlataforma.PAGO);
        a.setStatusPagamento(StatusPagamentoPlataforma.PAGO);
        a.setDataPagamento(LocalDate.now());
        a.setFormaPagamento(forma);
        a.setProximoVencimento(LocalDate.now().plusMonths(1));
        a.setDataAtualizacao(Instant.now());
        registrarPagamentoRecebido(a, TipoPagamentoPlataforma.MENSALIDADE, a.getValorMensalContratado(), forma);
        return toDto(assinaturaIgrejaRepository.save(a));
    }

    public AssinaturaIgrejaDTO registrarPagamentoAnual(Long id, FormaPagamentoPlataforma forma) {
        AssinaturaIgreja a = buscar(id);
        a.setStatusAssinatura(StatusAssinatura.ATIVA);
        a.setStatusMensalidade(StatusPagamentoPlataforma.PAGO);
        a.setStatusPagamento(StatusPagamentoPlataforma.PAGO);
        a.setDataAtivacao(LocalDate.now());
        a.setDataPagamento(LocalDate.now());
        a.setFormaPagamento(forma);
        a.setProximoVencimento(LocalDate.now().plusYears(1));
        if (a.getValorImplantacaoContratado() != null && a.getPlano() != null && a.getPlano().getPromocaoImplantacaoAnual() != null) {
            a.setValorImplantacaoContratado(a.getPlano().getPromocaoImplantacaoAnual());
        }
        a.setDataAtualizacao(Instant.now());
        if (a.getIgreja() != null) {
            a.getIgreja().setStatus(StatusIgreja.ATIVA);
        }
        registrarPagamentoRecebido(a, TipoPagamentoPlataforma.ANUALIDADE, a.getValorAnualContratado(), forma);
        notificacaoService.notificarAssinaturaAtivada(a.getIgreja());
        return toDto(assinaturaIgrejaRepository.save(a));
    }

    public AssinaturaIgrejaDTO atualizarObservacao(Long id, String observacao) {
        AssinaturaIgreja a = buscar(id);
        a.setObservacao(observacao);
        a.setDataAtualizacao(Instant.now());
        return toDto(assinaturaIgrejaRepository.save(a));
    }

    public AssinaturaIgrejaDTO atualizarVencimento(Long id, LocalDate vencimento) {
        AssinaturaIgreja a = buscar(id);
        a.setProximoVencimento(vencimento);
        a.setDataVencimento(vencimento);
        a.setDataAtualizacao(Instant.now());
        return toDto(assinaturaIgrejaRepository.save(a));
    }

    public void sincronizarVencimentos() {
        LocalDate hoje = LocalDate.now();
        List<AssinaturaIgreja> emTeste = assinaturaIgrejaRepository.findByStatusAssinatura(StatusAssinatura.EM_TESTE);
        for (AssinaturaIgreja a : emTeste) {
            if (a.getDataFimTeste() != null && a.getDataFimTeste().isBefore(hoje)) {
                a.setStatusAssinatura(StatusAssinatura.PENDENTE_PAGAMENTO);
                a.setStatusPagamento(StatusPagamentoPlataforma.PENDENTE);
                a.setDataAtualizacao(Instant.now());
                if (a.getIgreja() != null) {
                    a.getIgreja().setStatus(StatusIgreja.INATIVA);
                }
                assinaturaIgrejaRepository.save(a);
                notificacaoService.notificarTesteVencido(a.getIgreja());
            } else if (a.getDataFimTeste() != null) {
                long dias = ChronoUnit.DAYS.between(hoje, a.getDataFimTeste());
                if (dias <= 3) {
                    notificacaoService.notificarTesteVencendo(a.getIgreja(), (int) dias);
                }
            }
        }
    }

    public int calcularDiasRestantes(AssinaturaIgreja a) {
        if (a.getDataFimTeste() == null) {
            return 0;
        }
        return (int) ChronoUnit.DAYS.between(LocalDate.now(), a.getDataFimTeste());
    }

    public boolean podeAcessar(AssinaturaIgreja a) {
        if (a.getStatusAssinatura() == StatusAssinatura.ATIVA) {
            return true;
        }
        if (a.getStatusAssinatura() == StatusAssinatura.EM_TESTE) {
            return a.getDataFimTeste() == null || !a.getDataFimTeste().isBefore(LocalDate.now());
        }
        return false;
    }

    private AssinaturaIgreja buscar(Long id) {
        return assinaturaIgrejaRepository
            .findById(id)
            .orElseThrow(() -> new BadRequestAlertException("Assinatura não encontrada", ENTITY, "idnotfound"));
    }

    private void criarPagamentoPendente(AssinaturaIgreja assinatura, TipoPagamentoPlataforma tipo, BigDecimal valor, LocalDate vencimento) {
        if (valor == null) {
            return;
        }
        PagamentoPlataforma p = new PagamentoPlataforma();
        p.setIgreja(assinatura.getIgreja());
        p.setAssinatura(assinatura);
        p.setTipoPagamento(tipo);
        p.setValor(valor);
        p.setStatus(StatusPagamentoPlataforma.PENDENTE);
        p.setDataVencimento(vencimento);
        p.setDataCadastro(Instant.now());
        pagamentoPlataformaRepository.save(p);
    }

    private void registrarPagamentoRecebido(
        AssinaturaIgreja assinatura,
        TipoPagamentoPlataforma tipo,
        BigDecimal valor,
        FormaPagamentoPlataforma forma
    ) {
        PagamentoPlataforma p = new PagamentoPlataforma();
        p.setIgreja(assinatura.getIgreja());
        p.setAssinatura(assinatura);
        p.setTipoPagamento(tipo);
        p.setValor(valor != null ? valor : BigDecimal.ZERO);
        p.setStatus(StatusPagamentoPlataforma.PAGO);
        p.setFormaPagamento(forma);
        p.setDataPagamento(LocalDate.now());
        p.setRegistradoPor(SecurityUtils.getCurrentUserLogin().orElse("system"));
        p.setDataCadastro(Instant.now());
        pagamentoPlataformaRepository.save(p);
        notificacaoService.notificarPagamentoRecebido(assinatura.getIgreja(), tipo);
    }

    public AssinaturaIgrejaDTO toDto(AssinaturaIgreja a) {
        AssinaturaIgrejaDTO dto = new AssinaturaIgrejaDTO();
        dto.setId(a.getId());
        if (a.getIgreja() != null) {
            dto.setIgrejaId(a.getIgreja().getId());
            dto.setIgrejaNome(a.getIgreja().getNome());
        }
        if (a.getPlano() != null) {
            dto.setPlanoId(a.getPlano().getId());
            dto.setPlanoNome(a.getPlano().getNome());
        }
        dto.setValorMensal(a.getValorMensal());
        dto.setDataVencimento(a.getDataVencimento());
        dto.setStatusPagamento(a.getStatusPagamento());
        dto.setDataPagamento(a.getDataPagamento());
        dto.setObservacao(a.getObservacao());
        dto.setDataCadastro(a.getDataCadastro());
        dto.setStatusAssinatura(a.getStatusAssinatura());
        dto.setDataInicioTeste(a.getDataInicioTeste());
        dto.setDataFimTeste(a.getDataFimTeste());
        dto.setDataAtivacao(a.getDataAtivacao());
        dto.setDataSuspensao(a.getDataSuspensao());
        dto.setMotivoSuspensao(a.getMotivoSuspensao());
        dto.setValorImplantacaoContratado(a.getValorImplantacaoContratado());
        dto.setValorMensalContratado(a.getValorMensalContratado());
        dto.setValorAnualContratado(a.getValorAnualContratado());
        dto.setStatusImplantacao(a.getStatusImplantacao());
        dto.setStatusMensalidade(a.getStatusMensalidade());
        dto.setFormaPagamento(a.getFormaPagamento());
        dto.setProximoVencimento(a.getProximoVencimento());
        dto.setResponsavelNome(a.getResponsavelNome());
        dto.setDiasRestantesTeste(calcularDiasRestantes(a));
        dto.setAcessoPermitido(podeAcessar(a));
        return dto;
    }
}
