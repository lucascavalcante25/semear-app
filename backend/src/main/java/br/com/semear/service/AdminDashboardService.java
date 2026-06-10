package br.com.semear.service;

import br.com.semear.domain.enumeration.StatusAssinatura;
import br.com.semear.domain.enumeration.StatusIgreja;
import br.com.semear.domain.enumeration.StatusPagamentoPlataforma;
import br.com.semear.domain.enumeration.StatusSolicitacaoAcesso;
import br.com.semear.domain.enumeration.StatusSolicitacaoSuporte;
import br.com.semear.domain.enumeration.TipoPagamentoPlataforma;
import br.com.semear.repository.AssinaturaIgrejaRepository;
import br.com.semear.repository.IgrejaRepository;
import br.com.semear.repository.PagamentoPlataformaRepository;
import br.com.semear.repository.SolicitacaoAcessoRepository;
import br.com.semear.repository.SolicitacaoSuporteRepository;
import br.com.semear.repository.UserRepository;
import br.com.semear.service.dto.AdminDashboardDTO;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AdminDashboardService {

    private final IgrejaRepository igrejaRepository;
    private final UserRepository userRepository;
    private final SolicitacaoAcessoRepository solicitacaoAcessoRepository;
    private final SolicitacaoSuporteRepository solicitacaoSuporteRepository;
    private final AssinaturaIgrejaRepository assinaturaIgrejaRepository;
    private final PagamentoPlataformaRepository pagamentoPlataformaRepository;

    public AdminDashboardService(
        IgrejaRepository igrejaRepository,
        UserRepository userRepository,
        SolicitacaoAcessoRepository solicitacaoAcessoRepository,
        SolicitacaoSuporteRepository solicitacaoSuporteRepository,
        AssinaturaIgrejaRepository assinaturaIgrejaRepository,
        PagamentoPlataformaRepository pagamentoPlataformaRepository
    ) {
        this.igrejaRepository = igrejaRepository;
        this.userRepository = userRepository;
        this.solicitacaoAcessoRepository = solicitacaoAcessoRepository;
        this.solicitacaoSuporteRepository = solicitacaoSuporteRepository;
        this.assinaturaIgrejaRepository = assinaturaIgrejaRepository;
        this.pagamentoPlataformaRepository = pagamentoPlataformaRepository;
    }

    public AdminDashboardDTO obterEstatisticas() {
        AdminDashboardDTO dto = new AdminDashboardDTO();
        dto.setTotalIgrejas(igrejaRepository.count());
        dto.setIgrejasAtivas(igrejaRepository.countByStatus(StatusIgreja.ATIVA));
        dto.setIgrejasEmTeste(igrejaRepository.countByStatus(StatusIgreja.EM_TESTE));
        dto.setIgrejasInativas(igrejaRepository.countByStatus(StatusIgreja.INATIVA));
        dto.setTotalUsuarios(userRepository.count());
        dto.setSolicitacoesPendentes(solicitacaoAcessoRepository.countByStatus(StatusSolicitacaoAcesso.PENDENTE));
        dto.setSuporteAbertas(solicitacaoSuporteRepository.countByStatus(StatusSolicitacaoSuporte.ABERTA));
        dto.setSuporteEmAnalise(solicitacaoSuporteRepository.countByStatus(StatusSolicitacaoSuporte.EM_ANALISE));
        dto.setSuporteEmAberto(dto.getSuporteAbertas() + dto.getSuporteEmAnalise());

        LocalDate hoje = LocalDate.now();
        dto.setTestesVencendoEm3Dias(
            assinaturaIgrejaRepository.countByStatusAssinaturaAndDataFimTesteBetween(
                StatusAssinatura.EM_TESTE,
                hoje,
                hoje.plusDays(3)
            )
        );
        dto.setTestesVencidos(
            assinaturaIgrejaRepository.countByStatusAssinaturaAndDataFimTesteBefore(StatusAssinatura.EM_TESTE, hoje) +
            assinaturaIgrejaRepository.countByStatusAssinatura(StatusAssinatura.PENDENTE_PAGAMENTO)
        );
        dto.setPagamentosPendentes(pagamentoPlataformaRepository.countByStatus(StatusPagamentoPlataforma.PENDENTE));
        dto.setPagamentosAtrasados(pagamentoPlataformaRepository.countByStatus(StatusPagamentoPlataforma.ATRASADO));
        dto.setImplantacoesPendentes(
            pagamentoPlataformaRepository.countByTipoPagamentoAndStatus(
                TipoPagamentoPlataforma.IMPLANTACAO,
                StatusPagamentoPlataforma.PENDENTE
            )
        );

        BigDecimal receitaMensal = assinaturaIgrejaRepository
            .findAllByOrderByDataCadastroDesc()
            .stream()
            .filter(a -> a.getStatusAssinatura() == StatusAssinatura.ATIVA || a.getStatusAssinatura() == StatusAssinatura.EM_TESTE)
            .map(a -> a.getValorMensalContratado() != null ? a.getValorMensalContratado() : a.getValorMensal())
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal receitaAnual = assinaturaIgrejaRepository
            .findAllByOrderByDataCadastroDesc()
            .stream()
            .filter(a -> a.getStatusAssinatura() == StatusAssinatura.ATIVA)
            .map(a -> a.getValorAnualContratado() != null ? a.getValorAnualContratado() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setReceitaMensalPrevista(receitaMensal);
        dto.setReceitaAnualPrevista(receitaAnual);
        return dto;
    }
}
