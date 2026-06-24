package br.com.semear.service;

import br.com.semear.domain.Informativo;
import br.com.semear.domain.InformativoLeitura;
import br.com.semear.domain.User;
import br.com.semear.domain.enumeration.PublicoAlvoInformativo;
import br.com.semear.repository.InformativoLeituraRepository;
import br.com.semear.repository.InformativoRepository;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.service.dto.InformativoDTO;
import br.com.semear.service.dto.InformativoLeituraDTO;
import br.com.semear.service.mapper.InformativoMapper;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class InformativoService {

    private static final String ENTITY = "informativo";

    private final InformativoRepository informativoRepository;
    private final InformativoLeituraRepository informativoLeituraRepository;
    private final TenantService tenantService;
    private final InformativoMapper informativoMapper;

    public InformativoService(
        InformativoRepository informativoRepository,
        InformativoLeituraRepository informativoLeituraRepository,
        TenantService tenantService,
        InformativoMapper informativoMapper
    ) {
        this.informativoRepository = informativoRepository;
        this.informativoLeituraRepository = informativoLeituraRepository;
        this.tenantService = tenantService;
        this.informativoMapper = informativoMapper;
    }

    @Transactional(readOnly = true)
    public List<InformativoDTO> listarAdmin() {
        validarAdmin();
        Long igrejaId = tenantService.getIgrejaIdAtual();
        return informativoRepository.findByIgrejaIdOrderByCriadoEmDesc(igrejaId).stream().map(informativoMapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<InformativoDTO> listarPendentesLogin() {
        User usuario = tenantService.getUsuarioAtual();
        Long igrejaId = tenantService.getIgrejaIdAtual();
        LocalDate hoje = LocalDate.now();

        return informativoRepository
            .findByIgrejaIdAndAtivoTrueAndExibirNoLoginTrueOrderByPrioridadeDescCriadoEmDesc(igrejaId)
            .stream()
            .filter(i -> estaVigente(i, hoje))
            .filter(i -> atendePublicoAlvo(i, usuario))
            .filter(i -> !informativoLeituraRepository.existsByInformativoIdAndUsuarioId(i.getId(), usuario.getId()))
            .map(i -> informativoMapper.toDto(i, false))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<InformativoLeituraDTO> listarLeituras(Long id) {
        validarAdmin();
        Informativo informativo = obterDaIgreja(id).orElseThrow(() -> naoEncontrado());
        return informativoLeituraRepository
            .findByInformativoIdOrderByConfirmadoEmDesc(informativo.getId())
            .stream()
            .map(informativoMapper::toLeituraDto)
            .toList();
    }

    public InformativoDTO criar(InformativoDTO dto) {
        validarAdmin();
        validarDados(dto);
        User usuario = tenantService.getUsuarioAtual();

        Informativo informativo = new Informativo();
        informativo.setIgreja(tenantService.resolverIgrejaParaCriacao());
        aplicarDados(informativo, dto);
        informativo.setCriadoPor(usuario);
        informativo.setCriadoEm(Instant.now());

        return informativoMapper.toDto(informativoRepository.save(informativo));
    }

    public InformativoDTO atualizar(Long id, InformativoDTO dto) {
        validarAdmin();
        validarDados(dto);
        Informativo informativo = obterDaIgreja(id).orElseThrow(() -> naoEncontrado());
        aplicarDados(informativo, dto);
        informativo.setAtualizadoEm(Instant.now());
        return informativoMapper.toDto(informativoRepository.save(informativo));
    }

    public void excluir(Long id) {
        validarAdmin();
        Informativo informativo = obterDaIgreja(id).orElseThrow(() -> naoEncontrado());
        informativo.setAtivo(false);
        informativo.setAtualizadoEm(Instant.now());
        informativoRepository.save(informativo);
    }

    public InformativoDTO confirmarLeitura(Long id) {
        User usuario = tenantService.getUsuarioAtual();
        Informativo informativo = obterDaIgreja(id).orElseThrow(() -> naoEncontrado());
        if (!Boolean.TRUE.equals(informativo.getAtivo())) {
            throw new BadRequestAlertException("Informativo inativo", ENTITY, "inativo");
        }
        if (!estaVigente(informativo, LocalDate.now())) {
            throw new BadRequestAlertException("Informativo fora da vigência", ENTITY, "foravigencia");
        }
        if (!atendePublicoAlvo(informativo, usuario)) {
            throw new BadRequestAlertException("Informativo não disponível para seu perfil", ENTITY, "publiconegado");
        }

        if (!informativoLeituraRepository.existsByInformativoIdAndUsuarioId(id, usuario.getId())) {
            InformativoLeitura leitura = new InformativoLeitura();
            leitura.setInformativo(informativo);
            leitura.setUsuario(usuario);
            leitura.setConfirmadoEm(Instant.now());
            informativoLeituraRepository.save(leitura);
        }

        return informativoMapper.toDto(informativo, true);
    }

    private Optional<Informativo> obterDaIgreja(Long id) {
        return informativoRepository.findByIdAndIgrejaId(id, tenantService.getIgrejaIdAtual());
    }

    private void aplicarDados(Informativo informativo, InformativoDTO dto) {
        informativo.setTitulo(dto.getTitulo().trim());
        informativo.setConteudo(dto.getConteudo().trim());
        informativo.setTipo(dto.getTipo());
        informativo.setPublicoAlvo(dto.getPublicoAlvo());
        informativo.setPrioridade(dto.getPrioridade() != null ? dto.getPrioridade() : informativo.getPrioridade());
        informativo.setExibirNoLogin(dto.getExibirNoLogin() != null ? dto.getExibirNoLogin() : true);
        informativo.setObrigatorio(dto.getObrigatorio() != null ? dto.getObrigatorio() : false);
        informativo.setAtivo(dto.getAtivo() != null ? dto.getAtivo() : true);
        informativo.setDataInicio(dto.getDataInicio());
        informativo.setDataFim(dto.getDataFim());
        informativo.setCtaRotulo(dto.getCtaRotulo());
        informativo.setCtaRota(dto.getCtaRota());
        informativo.setImagemUrl(dto.getImagemUrl());
    }

    private void validarDados(InformativoDTO dto) {
        if (dto.getTitulo() == null || dto.getTitulo().isBlank()) {
            throw new BadRequestAlertException("Título obrigatório", ENTITY, "tituloobrigatorio");
        }
        if (dto.getConteudo() == null || dto.getConteudo().isBlank()) {
            throw new BadRequestAlertException("Conteúdo obrigatório", ENTITY, "conteudoobrigatorio");
        }
        if (dto.getTipo() == null || dto.getPublicoAlvo() == null) {
            throw new BadRequestAlertException("Tipo e público-alvo obrigatórios", ENTITY, "dadosobrigatorios");
        }
    }

    private boolean estaVigente(Informativo informativo, LocalDate referencia) {
        if (informativo.getDataInicio() != null && referencia.isBefore(informativo.getDataInicio())) {
            return false;
        }
        if (informativo.getDataFim() != null && referencia.isAfter(informativo.getDataFim())) {
            return false;
        }
        return true;
    }

    private boolean atendePublicoAlvo(Informativo informativo, User usuario) {
        PublicoAlvoInformativo publico = informativo.getPublicoAlvo();
        if (publico == PublicoAlvoInformativo.TODOS) {
            return true;
        }
        if (publico == PublicoAlvoInformativo.LIDERANCA) {
            return ehLideranca(usuario);
        }
        if (publico == PublicoAlvoInformativo.NOVOS_USUARIOS) {
            return usuario.getCreatedDate() != null && usuario.getCreatedDate().isAfter(Instant.now().minusSeconds(30L * 24 * 3600));
        }
        if (publico == PublicoAlvoInformativo.MEMBROS) {
            return usuario
                .getAuthorities()
                .stream()
                .anyMatch(a ->
                    AuthoritiesConstants.MEMBRO.equals(a.getName()) ||
                    AuthoritiesConstants.LIDER.equals(a.getName()) ||
                    AuthoritiesConstants.SECRETARIA.equals(a.getName()) ||
                    AuthoritiesConstants.TESOURARIA.equals(a.getName()) ||
                    AuthoritiesConstants.PASTOR.equals(a.getName()) ||
                    AuthoritiesConstants.COPASTOR.equals(a.getName()) ||
                    AuthoritiesConstants.ADMIN_IGREJA.equals(a.getName()) ||
                    AuthoritiesConstants.ADMIN.equals(a.getName())
                );
        }
        return true;
    }

    private boolean ehLideranca(User user) {
        return user
            .getAuthorities()
            .stream()
            .anyMatch(a ->
                AuthoritiesConstants.ADMIN.equals(a.getName()) ||
                AuthoritiesConstants.ADMIN_IGREJA.equals(a.getName()) ||
                AuthoritiesConstants.PASTOR.equals(a.getName()) ||
                AuthoritiesConstants.COPASTOR.equals(a.getName()) ||
                AuthoritiesConstants.LIDER.equals(a.getName()) ||
                AuthoritiesConstants.SECRETARIA.equals(a.getName())
            );
    }

    private void validarAdmin() {
        if (!ehLideranca(tenantService.getUsuarioAtual())) {
            throw new BadRequestAlertException("Acesso restrito à liderança", ENTITY, "acessonegado");
        }
    }

    private BadRequestAlertException naoEncontrado() {
        return new BadRequestAlertException("Informativo não encontrado", ENTITY, "naoencontrado");
    }
}
