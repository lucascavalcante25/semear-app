package br.com.semear.service;

import br.com.semear.domain.Plano;
import br.com.semear.repository.PlanoRepository;
import br.com.semear.service.dto.MensagensComerciaisDTO;
import br.com.semear.service.dto.PlanoDTO;
import br.com.semear.service.dto.PlanoPublicoDTO;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PlanoComercialService {

    private static final Logger LOG = LoggerFactory.getLogger(PlanoComercialService.class);
    private static final Long PLANO_LANCAMENTO_ID = 1L;
    private static final String ENTITY = "plano";

    private final PlanoRepository planoRepository;

    public PlanoComercialService(PlanoRepository planoRepository) {
        this.planoRepository = planoRepository;
    }

    @Transactional(readOnly = true)
    public PlanoDTO obterPlanoLancamento() {
        return toDto(buscarPlanoLancamento());
    }

    @Transactional(readOnly = true)
    public PlanoPublicoDTO obterPlanoPublico() {
        try {
            Optional<Object[]> opt = planoRepository.findDadosPublicosById(PLANO_LANCAMENTO_ID);
            if (opt.isEmpty()) {
                return planoPublicoPadrao();
            }
            Object[] row = opt.get();
            if (row.length == 1 && row[0] instanceof Object[]) {
                row = (Object[]) row[0];
            }
            if (row.length < 3) {
                LOG.warn("Consulta do plano retornou {} coluna(s) — usando valores padrão", row.length);
                return planoPublicoPadrao();
            }
            return mapearPlanoPublico(row);
        } catch (Exception e) {
            LOG.warn("Falha ao carregar plano público ({}), usando valores padrão", e.getMessage());
            return planoPublicoPadrao();
        }
    }

    private PlanoPublicoDTO mapearPlanoPublico(Object[] row) {
        PlanoPublicoDTO dto = new PlanoPublicoDTO();
        dto.setNome(row[0] != null ? row[0].toString() : "WillIgreja — Plano Completo");
        dto.setDescricao(row[1] != null ? row[1].toString() : null);
        dto.setValorMensal(row[2] != null ? (BigDecimal) row[2] : new BigDecimal("139.90"));
        dto.setValorAnual(row[3] != null ? (BigDecimal) row[3] : new BigDecimal("1510.92"));
        dto.setValorImplantacao(row[4] != null ? (BigDecimal) row[4] : new BigDecimal("700.00"));
        dto.setPromocaoImplantacaoAnual(row[5] != null ? (BigDecimal) row[5] : new BigDecimal("500.00"));
        dto.setDiasTrial(row[6] != null ? ((Number) row[6]).intValue() : 7);
        dto.setDescontoAnualPercentual(row[7] != null ? ((Number) row[7]).intValue() : 10);
        dto.setTextoBotao(row[8] != null ? row[8].toString() : "Começar teste de 7 dias");
        return dto;
    }

    private PlanoPublicoDTO planoPublicoPadrao() {
        PlanoPublicoDTO dto = new PlanoPublicoDTO();
        dto.setNome("WillIgreja — Plano Completo");
        dto.setValorMensal(new BigDecimal("139.90"));
        dto.setValorAnual(new BigDecimal("1510.92"));
        dto.setValorImplantacao(new BigDecimal("700.00"));
        dto.setPromocaoImplantacaoAnual(new BigDecimal("500.00"));
        dto.setDiasTrial(7);
        dto.setDescontoAnualPercentual(10);
        dto.setTextoBotao("Começar teste de 7 dias");
        return dto;
    }

    @Transactional(readOnly = true)
    public MensagensComerciaisDTO obterMensagens() {
        Plano p = buscarPlanoLancamento();
        MensagensComerciaisDTO dto = new MensagensComerciaisDTO();
        dto.setMensagemAbordagem(p.getMensagemAbordagem());
        dto.setMensagemPreco(p.getMensagemPreco());
        dto.setMensagemDemo(p.getMensagemDemo());
        dto.setMensagemFimTeste(p.getMensagemFimTeste());
        dto.setWhatsappContato(p.getWhatsappContato());
        dto.setEmailContato(p.getEmailContato());
        return dto;
    }

    public PlanoDTO atualizarPlanoLancamento(PlanoDTO input) {
        Plano p = buscarPlanoLancamento();
        if (input.getNome() != null) p.setNome(input.getNome());
        if (input.getDescricao() != null) p.setDescricao(input.getDescricao());
        if (input.getValorMensal() != null) p.setValorMensal(input.getValorMensal());
        if (input.getValorAnual() != null) p.setValorAnual(input.getValorAnual());
        if (input.getValorImplantacao() != null) p.setValorImplantacao(input.getValorImplantacao());
        if (input.getDiasTrial() != null) p.setDiasTrial(input.getDiasTrial());
        if (input.getAtivo() != null) p.setAtivo(input.getAtivo());
        if (input.getPromocaoImplantacaoAnual() != null) p.setPromocaoImplantacaoAnual(input.getPromocaoImplantacaoAnual());
        if (input.getDescontoAnualPercentual() != null) p.setDescontoAnualPercentual(input.getDescontoAnualPercentual());
        p.setDataAtualizacao(Instant.now());
        return toDto(planoRepository.save(p));
    }

    public MensagensComerciaisDTO atualizarMensagens(MensagensComerciaisDTO input) {
        Plano p = buscarPlanoLancamento();
        if (input.getMensagemAbordagem() != null) p.setMensagemAbordagem(input.getMensagemAbordagem());
        if (input.getMensagemPreco() != null) p.setMensagemPreco(input.getMensagemPreco());
        if (input.getMensagemDemo() != null) p.setMensagemDemo(input.getMensagemDemo());
        if (input.getMensagemFimTeste() != null) p.setMensagemFimTeste(input.getMensagemFimTeste());
        if (input.getWhatsappContato() != null) p.setWhatsappContato(input.getWhatsappContato());
        if (input.getEmailContato() != null) p.setEmailContato(input.getEmailContato());
        p.setDataAtualizacao(Instant.now());
        planoRepository.save(p);
        return obterMensagens();
    }

    public Plano buscarPlanoLancamento() {
        return planoRepository
            .findById(PLANO_LANCAMENTO_ID)
            .orElseGet(() ->
                planoRepository
                    .findAllByOrderByOrdemExibicaoAscValorMensalAsc()
                    .stream()
                    .findFirst()
                    .orElseThrow(() -> new BadRequestAlertException("Plano de lançamento não encontrado", ENTITY, "planonotfound"))
            );
    }

    public void garantirSeedPlanoLancamento() {
        if (planoRepository.findById(PLANO_LANCAMENTO_ID).isPresent()) {
            return;
        }
        Plano p = new Plano();
        p.setId(PLANO_LANCAMENTO_ID);
        p.setNome("Plano Completo");
        p.setDescricao(
            "Plataforma web completa para igrejas organizarem membros, visitantes, avisos, louvores, devocionais, financeiro, pré-cadastros, ofertas via PIX, identidade visual e suporte."
        );
        p.setValorMensal(new BigDecimal("139.90"));
        p.setValorAnual(new BigDecimal("1510.92"));
        p.setValorImplantacao(new BigDecimal("700.00"));
        p.setPromocaoImplantacaoAnual(new BigDecimal("500.00"));
        p.setDescontoAnualPercentual(10);
        p.setDiasTrial(7);
        p.setAtivo(true);
        p.setDestaque(true);
        p.setTextoBotao("Começar teste de 7 dias");
        p.setOrdemExibicao(1);
        p.setDataCadastro(Instant.now());
        planoRepository.save(p);
    }

    private PlanoDTO toDto(Plano p) {
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
        dto.setPromocaoImplantacaoAnual(p.getPromocaoImplantacaoAnual());
        dto.setDescontoAnualPercentual(p.getDescontoAnualPercentual());
        return dto;
    }
}
