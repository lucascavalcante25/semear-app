package br.com.semear.service;

import br.com.semear.domain.AssinaturaIgreja;
import br.com.semear.domain.Plano;
import br.com.semear.domain.User;
import br.com.semear.domain.enumeration.StatusPagamentoPlataforma;
import br.com.semear.repository.AssinaturaIgrejaRepository;
import br.com.semear.repository.PlanoRepository;
import br.com.semear.repository.UserRepository;
import br.com.semear.service.dto.AdminUsuarioResumoDTO;
import br.com.semear.service.dto.AssinaturaIgrejaDTO;
import br.com.semear.service.dto.FinanceiroPlataformaResumoDTO;
import br.com.semear.service.dto.PlanoDTO;
import br.com.semear.service.dto.PlataformaConfigDTO;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.config.JHipsterProperties;

@Service
@Transactional(readOnly = true)
public class AdminPlataformaService {

    private final PlanoRepository planoRepository;
    private final AssinaturaIgrejaRepository assinaturaIgrejaRepository;
    private final AssinaturaIgrejaService assinaturaIgrejaService;
    private final UserRepository userRepository;
    private final JHipsterProperties jHipsterProperties;

    @Value("${jhipster.clientApp.name:semearApp}")
    private String appName;

    public AdminPlataformaService(
        PlanoRepository planoRepository,
        AssinaturaIgrejaRepository assinaturaIgrejaRepository,
        AssinaturaIgrejaService assinaturaIgrejaService,
        UserRepository userRepository,
        JHipsterProperties jHipsterProperties
    ) {
        this.planoRepository = planoRepository;
        this.assinaturaIgrejaRepository = assinaturaIgrejaRepository;
        this.assinaturaIgrejaService = assinaturaIgrejaService;
        this.userRepository = userRepository;
        this.jHipsterProperties = jHipsterProperties;
    }

    public List<PlanoDTO> listarPlanos() {
        return planoRepository.findAllByOrderByOrdemExibicaoAscValorMensalAsc().stream().map(this::toPlanoDto).toList();
    }

    public List<AssinaturaIgrejaDTO> listarAssinaturas() {
        return assinaturaIgrejaService.listarTodas();
    }

    public FinanceiroPlataformaResumoDTO obterResumoFinanceiro() {
        List<AssinaturaIgreja> assinaturas = assinaturaIgrejaRepository.findAllByOrderByDataCadastroDesc();
        FinanceiroPlataformaResumoDTO dto = new FinanceiroPlataformaResumoDTO();
        dto.setTotalAssinaturas(assinaturas.size());
        dto.setAssinaturasPagas(assinaturas.stream().filter(a -> a.getStatusPagamento() == StatusPagamentoPlataforma.PAGO).count());
        dto.setAssinaturasPendentes(
            assinaturas.stream().filter(a -> a.getStatusPagamento() == StatusPagamentoPlataforma.PENDENTE).count()
        );
        dto.setAssinaturasAtrasadas(
            assinaturas.stream().filter(a -> a.getStatusPagamento() == StatusPagamentoPlataforma.ATRASADO).count()
        );
        BigDecimal prevista = assinaturas
            .stream()
            .map(AssinaturaIgreja::getValorMensal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal recebida = assinaturas
            .stream()
            .filter(a -> a.getStatusPagamento() == StatusPagamentoPlataforma.PAGO)
            .map(AssinaturaIgreja::getValorMensal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setReceitaMensalPrevista(prevista);
        dto.setReceitaMensalRecebida(recebida);
        return dto;
    }

    public List<AdminUsuarioResumoDTO> listarUsuarios() {
        return userRepository
            .findAll()
            .stream()
            .map(this::toUsuarioResumo)
            .sorted((a, b) -> a.getLogin().compareToIgnoreCase(b.getLogin()))
            .toList();
    }

    public PlataformaConfigDTO obterConfiguracao() {
        PlataformaConfigDTO dto = new PlataformaConfigDTO();
        dto.setNomePlataforma("WillSas");
        dto.setVersao(appName);
        dto.setEmailSuporte(jHipsterProperties.getMail().getFrom());
        dto.setUrlBase(jHipsterProperties.getMail().getBaseUrl());
        return dto;
    }

    private PlanoDTO toPlanoDto(Plano p) {
        PlanoDTO dto = new PlanoDTO();
        dto.setId(p.getId());
        dto.setNome(p.getNome());
        dto.setDescricao(p.getDescricao());
        dto.setValorMensal(p.getValorMensal());
        dto.setValorAnual(p.getValorAnual());
        dto.setValorImplantacao(p.getValorImplantacao());
        dto.setDiasTrial(p.getDiasTrial());
        dto.setLimiteMembros(p.getLimiteMembros());
        dto.setDestaque(p.getDestaque());
        dto.setTextoBotao(p.getTextoBotao());
        dto.setOrdemExibicao(p.getOrdemExibicao());
        dto.setAtivo(p.getAtivo());
        dto.setDataCadastro(p.getDataCadastro());
        dto.setDataAtualizacao(p.getDataAtualizacao());
        return dto;
    }

    private AssinaturaIgrejaDTO toAssinaturaDto(AssinaturaIgreja a) {
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
        return dto;
    }

    private AdminUsuarioResumoDTO toUsuarioResumo(User u) {
        AdminUsuarioResumoDTO dto = new AdminUsuarioResumoDTO();
        dto.setId(u.getId());
        dto.setLogin(u.getLogin());
        dto.setFirstName(u.getFirstName());
        dto.setLastName(u.getLastName());
        dto.setEmail(u.getEmail());
        dto.setActivated(u.isActivated());
        if (u.getIgreja() != null) {
            dto.setIgrejaId(u.getIgreja().getId());
            dto.setIgrejaNome(u.getIgreja().getNome());
        }
        dto.setAuthorities(u.getAuthorities().stream().map(a -> a.getName()).collect(java.util.stream.Collectors.toSet()));
        return dto;
    }
}
