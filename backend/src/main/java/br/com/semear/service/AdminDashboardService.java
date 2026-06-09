package br.com.semear.service;

import br.com.semear.domain.enumeration.StatusIgreja;
import br.com.semear.domain.enumeration.StatusSolicitacaoAcesso;
import br.com.semear.repository.IgrejaRepository;
import br.com.semear.repository.SolicitacaoAcessoRepository;
import br.com.semear.repository.UserRepository;
import br.com.semear.service.dto.AdminDashboardDTO;
import java.math.BigDecimal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AdminDashboardService {

    private final IgrejaRepository igrejaRepository;
    private final UserRepository userRepository;
    private final SolicitacaoAcessoRepository solicitacaoAcessoRepository;

    public AdminDashboardService(
        IgrejaRepository igrejaRepository,
        UserRepository userRepository,
        SolicitacaoAcessoRepository solicitacaoAcessoRepository
    ) {
        this.igrejaRepository = igrejaRepository;
        this.userRepository = userRepository;
        this.solicitacaoAcessoRepository = solicitacaoAcessoRepository;
    }

    public AdminDashboardDTO obterEstatisticas() {
        AdminDashboardDTO dto = new AdminDashboardDTO();
        dto.setTotalIgrejas(igrejaRepository.count());
        dto.setIgrejasAtivas(igrejaRepository.countByStatus(StatusIgreja.ATIVA));
        dto.setIgrejasEmTeste(igrejaRepository.countByStatus(StatusIgreja.EM_TESTE));
        dto.setIgrejasInativas(igrejaRepository.countByStatus(StatusIgreja.INATIVA));
        dto.setTotalUsuarios(userRepository.count());
        dto.setSolicitacoesPendentes(solicitacaoAcessoRepository.countByStatus(StatusSolicitacaoAcesso.PENDENTE));
        dto.setReceitaMensalPrevista(BigDecimal.valueOf(99.90).multiply(BigDecimal.valueOf(dto.getIgrejasAtivas())));
        return dto;
    }
}
