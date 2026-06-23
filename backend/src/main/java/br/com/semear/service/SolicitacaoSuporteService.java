package br.com.semear.service;

import br.com.semear.domain.Igreja;
import br.com.semear.domain.SolicitacaoSuporte;
import br.com.semear.domain.SolicitacaoSuporteAnexo;
import br.com.semear.domain.SolicitacaoSuporteHistorico;
import br.com.semear.domain.SolicitacaoSuporteMensagem;
import br.com.semear.domain.User;
import br.com.semear.domain.enumeration.AcaoSolicitacaoSuporteHistorico;
import br.com.semear.domain.enumeration.PrioridadeSolicitacaoSuporte;
import br.com.semear.domain.enumeration.StatusSolicitacaoSuporte;
import br.com.semear.domain.enumeration.TipoSolicitacaoSuporte;
import br.com.semear.domain.enumeration.TipoSolicitacaoSuporteMensagem;
import br.com.semear.repository.SolicitacaoSuporteAnexoRepository;
import br.com.semear.repository.SolicitacaoSuporteHistoricoRepository;
import br.com.semear.repository.SolicitacaoSuporteMensagemRepository;
import br.com.semear.repository.SolicitacaoSuporteRepository;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.security.SecurityUtils;
import br.com.semear.service.dto.AtualizarStatusSolicitacaoSuporteDTO;
import br.com.semear.service.dto.ResponderSolicitacaoSuporteDTO;
import br.com.semear.service.dto.SolicitacaoSuporteAnexoDTO;
import br.com.semear.service.dto.SolicitacaoSuporteDTO;
import br.com.semear.service.dto.SolicitacaoSuporteHistoricoDTO;
import br.com.semear.service.dto.SolicitacaoSuporteMensagemDTO;
import br.com.semear.service.dto.SuporteResumoDTO;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashSet;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class SolicitacaoSuporteService {

    private static final Logger LOG = LoggerFactory.getLogger(SolicitacaoSuporteService.class);
    private static final String ENTITY = "solicitacaoSuporte";
    private static final long MAX_ANEXO_BYTES = 5L * 1024 * 1024;
    private static final int MAX_ANEXOS = 5;
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
        "image/png",
        "image/jpeg",
        "image/jpg",
        "application/pdf"
    );
    private static final Set<String> BLOCKED_EXTENSIONS = Set.of(".exe", ".bat", ".sh", ".cmd", ".msi", ".dll", ".js", ".html");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final List<StatusSolicitacaoSuporte> STATUS_ENCERRADOS = List.of(
        StatusSolicitacaoSuporte.FINALIZADA,
        StatusSolicitacaoSuporte.CANCELADA
    );

    private final SolicitacaoSuporteRepository solicitacaoSuporteRepository;
    private final SolicitacaoSuporteAnexoRepository anexoRepository;
    private final SolicitacaoSuporteHistoricoRepository historicoRepository;
    private final SolicitacaoSuporteMensagemRepository mensagemRepository;
    private final TenantService tenantService;
    private final NotificacaoService notificacaoService;

    @Value("${semear.upload-dir:${user.home}/semear-app/uploads}")
    private String uploadDir;

    public SolicitacaoSuporteService(
        SolicitacaoSuporteRepository solicitacaoSuporteRepository,
        SolicitacaoSuporteAnexoRepository anexoRepository,
        SolicitacaoSuporteHistoricoRepository historicoRepository,
        SolicitacaoSuporteMensagemRepository mensagemRepository,
        TenantService tenantService,
        NotificacaoService notificacaoService
    ) {
        this.solicitacaoSuporteRepository = solicitacaoSuporteRepository;
        this.anexoRepository = anexoRepository;
        this.historicoRepository = historicoRepository;
        this.mensagemRepository = mensagemRepository;
        this.tenantService = tenantService;
        this.notificacaoService = notificacaoService;
    }

    public SolicitacaoSuporteDTO criar(SolicitacaoSuporteDTO dto, List<MultipartFile> anexos) {
        validarCamposCriacao(dto);

        User usuario = tenantService.getUsuarioAtual();
        Igreja igreja = tenantService.resolverIgrejaParaCriacao();

        SolicitacaoSuporte s = new SolicitacaoSuporte();
        s.setIgreja(igreja);
        s.setUsuarioSolicitante(usuario);
        preencherDadosSolicitante(s, dto, usuario);
        s.setTipo(dto.getTipo());
        s.setPrioridade(PrioridadeSolicitacaoSuporte.MEDIA);
        s.setTitulo(dto.getTitulo().trim());
        s.setDescricao(dto.getDescricao().trim());
        s.setStatus(StatusSolicitacaoSuporte.ABERTA);
        s.setLidaPeloCliente(true);
        s.setLidaPeloSuporte(false);

        s = solicitacaoSuporteRepository.save(s);
        registrarHistorico(s, usuario, AcaoSolicitacaoSuporteHistorico.CRIADA, null, StatusSolicitacaoSuporte.ABERTA, "Solicitação aberta", true);
        registrarMensagem(s, usuario, TipoSolicitacaoSuporteMensagem.MENSAGEM_CLIENTE, s.getDescricao());

        List<MultipartFile> arquivos = anexos != null
            ? anexos.stream().filter(f -> f != null && !f.isEmpty()).toList()
            : List.of();
        if (arquivos.size() > MAX_ANEXOS) {
            throw new BadRequestAlertException("Máximo de " + MAX_ANEXOS + " anexos por solicitação", ENTITY, "limiteanexo");
        }
        for (MultipartFile arquivo : arquivos) {
            salvarAnexo(s, arquivo, usuario);
        }

        return toDto(s, false, true);
    }

    @Transactional(readOnly = true)
    public List<SolicitacaoSuporteDTO> listarDaIgreja(
        StatusSolicitacaoSuporte status,
        TipoSolicitacaoSuporte tipo,
        String busca,
        LocalDate dataInicio,
        LocalDate dataFim
    ) {
        Long igrejaId = tenantService.getIgrejaIdAtual();
        User usuario = tenantService.getUsuarioAtual();
        Instant inicio = dataInicio != null ? dataInicio.atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
        Instant fim = dataFim != null ? dataFim.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant() : null;
        String buscaNorm = normalizarBusca(busca);

        Specification<SolicitacaoSuporte> spec = Specification.where((root, query, cb) ->
            cb.equal(root.get("igreja").get("id"), igrejaId)
        );
        if (!ehAdminIgreja()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("usuarioSolicitante").get("id"), usuario.getId()));
        }
        spec = aplicarFiltrosComuns(spec, status, tipo, inicio, fim, buscaNorm);

        return solicitacaoSuporteRepository
            .findAll(spec, Sort.by(Sort.Direction.DESC, "createdDate"))
            .stream()
            .map(s -> toDto(s, false, false))
            .toList();
    }

    @Transactional(readOnly = true)
    public Optional<SolicitacaoSuporteDTO> obterDaIgreja(Long id) {
        return solicitacaoSuporteRepository
            .findById(id)
            .map(s -> {
                tenantService.validarMesmaIgreja(s.getIgreja());
                validarProprietarioOuAdminIgreja(s);
                return toDto(s, false, true);
            });
    }

    public void marcarComoLidaPeloCliente(Long id) {
        SolicitacaoSuporte s = obterOuFalhar(id);
        tenantService.validarMesmaIgreja(s.getIgreja());
        validarProprietarioOuAdminIgreja(s);
        s.setLidaPeloCliente(true);
        solicitacaoSuporteRepository.save(s);
    }

    public void marcarComoLidaPeloSuporte(Long id) {
        SolicitacaoSuporte s = obterOuFalhar(id);
        s.setLidaPeloSuporte(true);
        solicitacaoSuporteRepository.save(s);
    }

    public SolicitacaoSuporteDTO enviarMensagemCliente(Long id, String texto) {
        SolicitacaoSuporte s = obterOuFalhar(id);
        tenantService.validarMesmaIgreja(s.getIgreja());
        validarProprietarioOuAdminIgreja(s);
        validarPodeEnviarMensagemCliente(s);
        validarTextoMensagem(texto);

        User usuario = tenantService.getUsuarioAtual();
        StatusSolicitacaoSuporte anterior = s.getStatus();
        registrarMensagem(s, usuario, TipoSolicitacaoSuporteMensagem.MENSAGEM_CLIENTE, texto.trim());

        if (anterior == StatusSolicitacaoSuporte.RESPONDIDA || anterior == StatusSolicitacaoSuporte.RESOLVIDA) {
            s.setStatus(StatusSolicitacaoSuporte.EM_ANALISE);
            registrarHistorico(s, usuario, AcaoSolicitacaoSuporteHistorico.STATUS_ALTERADO, anterior, StatusSolicitacaoSuporte.EM_ANALISE, "Cliente enviou nova mensagem", true);
        }
        s.setLidaPeloSuporte(false);
        s.setLidaPeloCliente(true);
        s = solicitacaoSuporteRepository.save(s);
        return toDto(s, false, true);
    }

    public SolicitacaoSuporteDTO cancelarCliente(Long id, String motivo) {
        SolicitacaoSuporte s = obterOuFalhar(id);
        tenantService.validarMesmaIgreja(s.getIgreja());
        validarProprietarioOuAdminIgreja(s);
        if (s.getStatus() != StatusSolicitacaoSuporte.ABERTA && s.getStatus() != StatusSolicitacaoSuporte.EM_ANALISE) {
            throw new BadRequestAlertException("Só é possível cancelar solicitações abertas ou em análise", ENTITY, "cancelamentoinvalido");
        }

        User usuario = tenantService.getUsuarioAtual();
        StatusSolicitacaoSuporte anterior = s.getStatus();
        s.setStatus(StatusSolicitacaoSuporte.CANCELADA);
        String msg = motivo != null && !motivo.isBlank() ? motivo.trim() : "Solicitação cancelada pelo cliente.";
        registrarMensagem(s, usuario, TipoSolicitacaoSuporteMensagem.SISTEMA, msg);
        registrarHistorico(s, usuario, AcaoSolicitacaoSuporteHistorico.STATUS_ALTERADO, anterior, StatusSolicitacaoSuporte.CANCELADA, msg, true);
        s.setLidaPeloSuporte(true);
        s = solicitacaoSuporteRepository.save(s);
        return toDto(s, false, true);
    }

    public SolicitacaoSuporteDTO enviarMensagemSuporte(Long id, String texto) {
        SolicitacaoSuporte s = obterOuFalhar(id);
        validarTextoMensagem(texto);
        if (STATUS_ENCERRADOS.contains(s.getStatus())) {
            throw new BadRequestAlertException("Solicitação encerrada", ENTITY, "encerrada");
        }

        User admin = tenantService.getUsuarioAtual();
        StatusSolicitacaoSuporte anterior = s.getStatus();
        String mensagem = texto.trim();
        registrarMensagem(s, admin, TipoSolicitacaoSuporteMensagem.MENSAGEM_SUPORTE, mensagem);

        s.setRespostaAdmin(mensagem);
        s.setDataResposta(Instant.now());
        s.setRespondidoPor(admin);

        if (anterior == StatusSolicitacaoSuporte.ABERTA || anterior == StatusSolicitacaoSuporte.EM_ANALISE) {
            s.setStatus(StatusSolicitacaoSuporte.RESPONDIDA);
        }
        registrarHistorico(s, admin, AcaoSolicitacaoSuporteHistorico.RESPONDIDA, anterior, s.getStatus(), mensagem, true);
        marcarPendenteParaCliente(s);
        s.setLidaPeloSuporte(true);
        s = solicitacaoSuporteRepository.save(s);
        return toDto(s, true, true);
    }

    public SolicitacaoSuporteDTO marcarResolvidaAdmin(Long id, String mensagemOpcional) {
        SolicitacaoSuporte s = obterOuFalhar(id);
        if (STATUS_ENCERRADOS.contains(s.getStatus())) {
            throw new BadRequestAlertException("Solicitação encerrada", ENTITY, "encerrada");
        }

        User admin = tenantService.getUsuarioAtual();
        StatusSolicitacaoSuporte anterior = s.getStatus();
        s.setStatus(StatusSolicitacaoSuporte.RESOLVIDA);
        aplicarDatasPorStatus(s, StatusSolicitacaoSuporte.RESOLVIDA);

        if (mensagemOpcional != null && !mensagemOpcional.isBlank()) {
            registrarMensagem(s, admin, TipoSolicitacaoSuporteMensagem.MENSAGEM_SUPORTE, mensagemOpcional.trim());
            s.setRespostaAdmin(mensagemOpcional.trim());
            s.setRespondidoPor(admin);
            s.setDataResposta(Instant.now());
        } else {
            registrarMensagem(s, null, TipoSolicitacaoSuporteMensagem.SISTEMA, "Solicitação marcada como resolvida.");
        }

        registrarHistorico(s, admin, AcaoSolicitacaoSuporteHistorico.STATUS_ALTERADO, anterior, StatusSolicitacaoSuporte.RESOLVIDA, "Marcada como resolvida", true);
        marcarPendenteParaCliente(s);
        s.setLidaPeloSuporte(true);
        s = solicitacaoSuporteRepository.save(s);
        return toDto(s, true, true);
    }

    public SolicitacaoSuporteDTO finalizarAdmin(Long id, String mensagemOpcional) {
        SolicitacaoSuporte s = obterOuFalhar(id);
        if (s.getStatus() != StatusSolicitacaoSuporte.RESOLVIDA) {
            throw new BadRequestAlertException("Só é possível finalizar solicitações resolvidas", ENTITY, "finalizarinvalido");
        }

        User admin = tenantService.getUsuarioAtual();
        StatusSolicitacaoSuporte anterior = s.getStatus();
        s.setStatus(StatusSolicitacaoSuporte.FINALIZADA);
        aplicarDatasPorStatus(s, StatusSolicitacaoSuporte.FINALIZADA);

        String msg = mensagemOpcional != null && !mensagemOpcional.isBlank() ? mensagemOpcional.trim() : "Solicitação finalizada.";
        registrarMensagem(s, admin, TipoSolicitacaoSuporteMensagem.SISTEMA, msg);
        registrarHistorico(s, admin, AcaoSolicitacaoSuporteHistorico.STATUS_ALTERADO, anterior, StatusSolicitacaoSuporte.FINALIZADA, msg, true);
        marcarPendenteParaCliente(s);
        s.setLidaPeloSuporte(true);
        s = solicitacaoSuporteRepository.save(s);
        return toDto(s, true, true);
    }

    @Transactional(readOnly = true)
    public List<SolicitacaoSuporteDTO> listarAdmin(
        Long igrejaId,
        StatusSolicitacaoSuporte status,
        TipoSolicitacaoSuporte tipo,
        PrioridadeSolicitacaoSuporte prioridade,
        String busca
    ) {
        String buscaNorm = normalizarBusca(busca);

        Specification<SolicitacaoSuporte> spec = Specification.where(null);
        if (igrejaId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("igreja").get("id"), igrejaId));
        }
        spec = aplicarFiltrosComuns(spec, status, tipo, null, null, null);
        if (prioridade != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("prioridade"), prioridade));
        }
        if (buscaNorm != null) {
            String termo = "%" + buscaNorm.toLowerCase() + "%";
            spec = spec.and((root, query, cb) ->
                cb.or(
                    cb.like(cb.lower(root.get("titulo")), termo),
                    cb.like(cb.lower(root.get("nomeSolicitante")), termo)
                )
            );
        }

        return solicitacaoSuporteRepository
            .findAll(spec, Sort.by(Sort.Direction.DESC, "createdDate"))
            .stream()
            .map(s -> toDto(s, true, false))
            .toList();
    }

    @Transactional(readOnly = true)
    public Optional<SolicitacaoSuporteDTO> obterAdmin(Long id) {
        return solicitacaoSuporteRepository.findById(id).map(s -> toDto(s, true, true));
    }

    public SolicitacaoSuporteDTO atualizarStatusAdmin(Long id, AtualizarStatusSolicitacaoSuporteDTO dto) {
        SolicitacaoSuporte s = obterOuFalhar(id);
        StatusSolicitacaoSuporte statusAnterior = s.getStatus();

        if (dto.getStatus() != null) {
            if (dto.getStatus() == StatusSolicitacaoSuporte.FINALIZADA && s.getStatus() != StatusSolicitacaoSuporte.RESOLVIDA) {
                throw new BadRequestAlertException("Finalize apenas solicitações resolvidas", ENTITY, "finalizarinvalido");
            }
            s.setStatus(dto.getStatus());
            aplicarDatasPorStatus(s, dto.getStatus());
        }
        if (dto.getPrioridade() != null) {
            s.setPrioridade(dto.getPrioridade());
        }
        if (dto.getObservacaoInternaAdmin() != null) {
            s.setObservacaoInternaAdmin(dto.getObservacaoInternaAdmin().trim());
            registrarHistorico(
                s,
                tenantService.getUsuarioAtual(),
                AcaoSolicitacaoSuporteHistorico.STATUS_ALTERADO,
                statusAnterior,
                s.getStatus(),
                "Observação interna atualizada",
                false
            );
        }

        if (dto.getStatus() != null && !dto.getStatus().equals(statusAnterior)) {
            registrarHistorico(
                s,
                tenantService.getUsuarioAtual(),
                AcaoSolicitacaoSuporteHistorico.STATUS_ALTERADO,
                statusAnterior,
                dto.getStatus(),
                "Status alterado",
                true
            );
        }

        if (dto.getStatus() != null && deveNotificarCliente(statusAnterior, dto.getStatus())) {
            marcarPendenteParaCliente(s);
        }

        s = solicitacaoSuporteRepository.save(s);
        return toDto(s, true, true);
    }

    public SolicitacaoSuporteDTO responderAdmin(Long id, ResponderSolicitacaoSuporteDTO dto) {
        SolicitacaoSuporte s = obterOuFalhar(id);
        if (dto.getObservacaoInternaAdmin() != null) {
            s.setObservacaoInternaAdmin(dto.getObservacaoInternaAdmin().trim());
            solicitacaoSuporteRepository.save(s);
        }

        String resposta = dto.getRespostaAdmin() != null ? dto.getRespostaAdmin().trim() : "";
        StatusSolicitacaoSuporte novoStatus = dto.getStatus() != null ? dto.getStatus() : StatusSolicitacaoSuporte.RESPONDIDA;

        if (novoStatus == StatusSolicitacaoSuporte.FINALIZADA) {
            return finalizarAdmin(id, resposta.isBlank() ? null : resposta);
        }
        if (novoStatus == StatusSolicitacaoSuporte.RESOLVIDA) {
            return marcarResolvidaAdmin(id, resposta.isBlank() ? null : resposta);
        }
        if (!resposta.isBlank()) {
            return enviarMensagemSuporte(id, resposta);
        }
        if (novoStatus != s.getStatus()) {
            AtualizarStatusSolicitacaoSuporteDTO statusDto = new AtualizarStatusSolicitacaoSuporteDTO();
            statusDto.setStatus(novoStatus);
            return atualizarStatusAdmin(id, statusDto);
        }
        return toDto(s, true, true);
    }

    @Transactional(readOnly = true)
    public SuporteResumoDTO obterResumoAdmin() {
        SuporteResumoDTO resumo = new SuporteResumoDTO();
        resumo.setAbertas(solicitacaoSuporteRepository.countByStatus(StatusSolicitacaoSuporte.ABERTA));
        resumo.setEmAnalise(solicitacaoSuporteRepository.countByStatus(StatusSolicitacaoSuporte.EM_ANALISE));
        resumo.setRespondidas(solicitacaoSuporteRepository.countByStatus(StatusSolicitacaoSuporte.RESPONDIDA));
        resumo.setResolvidas(solicitacaoSuporteRepository.countByStatus(StatusSolicitacaoSuporte.RESOLVIDA));
        resumo.setFinalizadas(solicitacaoSuporteRepository.countByStatus(StatusSolicitacaoSuporte.FINALIZADA));
        resumo.setCanceladas(solicitacaoSuporteRepository.countByStatus(StatusSolicitacaoSuporte.CANCELADA));
        resumo.setAguardandoRespostaSuporte(
            solicitacaoSuporteRepository.countByLidaPeloSuporteFalseAndStatusNotIn(STATUS_ENCERRADOS)
        );

        List<SuporteResumoDTO.UltimaSolicitacaoDTO> ultimas = solicitacaoSuporteRepository
            .findTop5ByOrderByCreatedDateDesc()
            .stream()
            .map(s -> {
                SuporteResumoDTO.UltimaSolicitacaoDTO u = new SuporteResumoDTO.UltimaSolicitacaoDTO();
                u.setId(s.getId());
                u.setIgrejaNome(s.getIgreja() != null ? s.getIgreja().getNome() : null);
                u.setTipo(s.getTipo() != null ? s.getTipo().name() : null);
                u.setTitulo(s.getTitulo());
                u.setStatus(s.getStatus() != null ? s.getStatus().name() : null);
                u.setCreatedDate(s.getCreatedDate() != null ? s.getCreatedDate().toString() : null);
                return u;
            })
            .toList();
        resumo.setUltimas(ultimas);
        return resumo;
    }

    @Transactional(readOnly = true)
    public Optional<AnexoDownload> obterAnexo(Long solicitacaoId, Long anexoId, boolean admin) {
        Optional<SolicitacaoSuporteAnexo> anexoOpt = anexoRepository.findByIdAndSolicitacaoSuporteId(anexoId, solicitacaoId);
        if (anexoOpt.isEmpty()) {
            return Optional.empty();
        }
        SolicitacaoSuporteAnexo anexo = anexoOpt.get();
        SolicitacaoSuporte s = anexo.getSolicitacaoSuporte();
        if (!admin) {
            tenantService.validarMesmaIgreja(s.getIgreja());
            validarProprietarioOuAdminIgreja(s);
        }

        Path path = Paths.get(uploadDir, anexo.getCaminhoArmazenamento()).toAbsolutePath().normalize();
        try {
            if (!Files.exists(path)) {
                return Optional.empty();
            }
            byte[] bytes = Files.readAllBytes(path);
            return Optional.of(new AnexoDownload(bytes, anexo.getTipoArquivo(), anexo.getNomeArquivo()));
        } catch (IOException e) {
            LOG.error("Erro ao ler anexo {} da solicitação {}", anexoId, solicitacaoId, e);
            return Optional.empty();
        }
    }

    public record AnexoDownload(byte[] bytes, String contentType, String fileName) {}

    @Transactional(readOnly = true)
    public Optional<AnexoDownload> obterZipAnexos(Long solicitacaoId, boolean admin) {
        SolicitacaoSuporte s = obterOuFalhar(solicitacaoId);
        if (!admin) {
            tenantService.validarMesmaIgreja(s.getIgreja());
            validarProprietarioOuAdminIgreja(s);
        }

        List<SolicitacaoSuporteAnexo> anexos = anexoRepository.findAllBySolicitacaoSuporteId(solicitacaoId);
        if (anexos.isEmpty()) {
            return Optional.empty();
        }

        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        Set<String> nomesUsados = new HashSet<>();
        try (ZipOutputStream zip = new ZipOutputStream(buffer)) {
            for (SolicitacaoSuporteAnexo anexo : anexos) {
                Path path = Paths.get(uploadDir, anexo.getCaminhoArmazenamento()).toAbsolutePath().normalize();
                if (!Files.exists(path)) {
                    continue;
                }
                String nomeEntrada = nomeUnicoZip(anexo.getNomeArquivo(), nomesUsados);
                zip.putNextEntry(new ZipEntry(nomeEntrada));
                zip.write(Files.readAllBytes(path));
                zip.closeEntry();
            }
        } catch (IOException e) {
            LOG.error("Erro ao gerar zip dos anexos da solicitação {}", solicitacaoId, e);
            return Optional.empty();
        }

        if (buffer.size() == 0) {
            return Optional.empty();
        }
        String zipName = "anexos-solicitacao-" + solicitacaoId + ".zip";
        return Optional.of(new AnexoDownload(buffer.toByteArray(), "application/zip", zipName));
    }

    private String nomeUnicoZip(String nomeOriginal, Set<String> nomesUsados) {
        String base = sanitizarNomeArquivo(nomeOriginal);
        if (base.isBlank()) {
            base = "anexo";
        }
        String candidato = base;
        int sufixo = 1;
        while (!nomesUsados.add(candidato)) {
            int ponto = base.lastIndexOf('.');
            if (ponto > 0) {
                candidato = base.substring(0, ponto) + "-" + sufixo + base.substring(ponto);
            } else {
                candidato = base + "-" + sufixo;
            }
            sufixo++;
        }
        return candidato;
    }

    private void salvarAnexo(SolicitacaoSuporte s, MultipartFile file, User usuario) {
        if (anexoRepository.countBySolicitacaoSuporteId(s.getId()) >= MAX_ANEXOS) {
            throw new BadRequestAlertException("Limite de anexos atingido", ENTITY, "limiteanexo");
        }
        validarArquivo(file);

        String originalName = Objects.requireNonNullElse(file.getOriginalFilename(), "anexo");
        String ext = getExtension(originalName).toLowerCase();
        if (BLOCKED_EXTENSIONS.contains(ext)) {
            throw new BadRequestAlertException("Tipo de arquivo não permitido", ENTITY, "arquivoinvalido");
        }

        String storedRelative = "suporte/" + s.getId() + "/" + UUID.randomUUID() + ext;
        Path targetPath = Paths.get(uploadDir, storedRelative).toAbsolutePath().normalize();
        String contentType = file.getContentType();

        try {
            Files.createDirectories(targetPath.getParent());
            byte[] bytes = file.getBytes();
            Files.write(targetPath, bytes);

            SolicitacaoSuporteAnexo anexo = new SolicitacaoSuporteAnexo();
            anexo.setSolicitacaoSuporte(s);
            anexo.setNomeArquivo(sanitizarNomeArquivo(originalName));
            anexo.setTipoArquivo(contentType);
            anexo.setTamanhoArquivo((long) bytes.length);
            anexo.setCaminhoArmazenamento(storedRelative);
            anexo.setDataUpload(Instant.now());
            anexo.setEnviadoPor(usuario);
            anexoRepository.save(anexo);
            registrarHistorico(
                s,
                usuario,
                AcaoSolicitacaoSuporteHistorico.ANEXO_ADICIONADO,
                null,
                null,
                "Anexo: " + anexo.getNomeArquivo(),
                true
            );
        } catch (IOException e) {
            LOG.error("Erro ao salvar anexo da solicitação {}", s.getId(), e);
            throw new BadRequestAlertException("Erro ao salvar anexo", ENTITY, "erroanexo");
        }
    }

    private void validarArquivo(MultipartFile file) {
        if (file.getSize() > MAX_ANEXO_BYTES) {
            throw new BadRequestAlertException("Arquivo excede 5 MB", ENTITY, "arquivogrande");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestAlertException("Tipo de arquivo não permitido. Use PNG, JPG ou PDF.", ENTITY, "tipoinvalido");
        }
    }

    private void validarCamposCriacao(SolicitacaoSuporteDTO dto) {
        if (dto.getTipo() == null) {
            throw new BadRequestAlertException("Tipo obrigatório", ENTITY, "tipoobrigatorio");
        }
        if (dto.getTitulo() == null || dto.getTitulo().trim().length() < 5) {
            throw new BadRequestAlertException("Título deve ter ao menos 5 caracteres", ENTITY, "titulocurto");
        }
        if (dto.getTitulo().trim().length() > 120) {
            throw new BadRequestAlertException("Título muito longo", ENTITY, "titulolongo");
        }
        if (dto.getDescricao() == null || dto.getDescricao().trim().length() < 10) {
            throw new BadRequestAlertException("Descrição deve ter ao menos 10 caracteres", ENTITY, "descricaocurta");
        }
        if (dto.getDescricao().trim().length() > 2000) {
            throw new BadRequestAlertException("Descrição muito longa", ENTITY, "descricaolonga");
        }
        if (dto.getEmailSolicitante() != null && !dto.getEmailSolicitante().isBlank()) {
            if (!EMAIL_PATTERN.matcher(dto.getEmailSolicitante().trim()).matches()) {
                throw new BadRequestAlertException("E-mail inválido", ENTITY, "emailinvalido");
            }
        }
        if (dto.getTelefoneSolicitante() != null && !dto.getTelefoneSolicitante().isBlank()) {
            String tel = apenasDigitos(dto.getTelefoneSolicitante());
            if (tel.length() < 10 || tel.length() > 11) {
                throw new BadRequestAlertException("Telefone inválido", ENTITY, "telefoneinvalido");
            }
        }
    }

    private void preencherDadosSolicitante(SolicitacaoSuporte s, SolicitacaoSuporteDTO dto, User usuario) {
        String nome = montarNome(usuario);
        if (dto.getNomeSolicitante() != null && !dto.getNomeSolicitante().isBlank()) {
            nome = dto.getNomeSolicitante().trim();
        }
        s.setNomeSolicitante(nome);

        String email = usuario.getEmail();
        if (dto.getEmailSolicitante() != null && !dto.getEmailSolicitante().isBlank()) {
            email = dto.getEmailSolicitante().trim().toLowerCase();
        }
        s.setEmailSolicitante(email != null ? email : "");

        String telefone = usuario.getPhone();
        if (dto.getTelefoneSolicitante() != null && !dto.getTelefoneSolicitante().isBlank()) {
            telefone = apenasDigitos(dto.getTelefoneSolicitante());
        } else if (telefone != null) {
            telefone = apenasDigitos(telefone);
        }
        s.setTelefoneSolicitante(telefone);
    }

    private void aplicarDatasPorStatus(SolicitacaoSuporte s, StatusSolicitacaoSuporte status) {
        if (status == StatusSolicitacaoSuporte.RESPONDIDA && s.getDataResposta() == null) {
            s.setDataResposta(Instant.now());
        }
        if ((status == StatusSolicitacaoSuporte.RESOLVIDA || status == StatusSolicitacaoSuporte.FINALIZADA) && s.getDataFinalizacao() == null) {
            s.setDataFinalizacao(Instant.now());
        }
    }

    private boolean deveNotificarCliente(StatusSolicitacaoSuporte anterior, StatusSolicitacaoSuporte novo) {
        return novo == StatusSolicitacaoSuporte.EM_ANALISE
            || novo == StatusSolicitacaoSuporte.RESPONDIDA
            || novo == StatusSolicitacaoSuporte.RESOLVIDA
            || novo == StatusSolicitacaoSuporte.FINALIZADA;
    }

    private void marcarPendenteParaCliente(SolicitacaoSuporte s) {
        s.setLidaPeloCliente(false);
        notificacaoService.resetarNotificacaoSuporte(s.getUsuarioSolicitante(), s.getId());
    }

    private SolicitacaoSuporte obterOuFalhar(Long id) {
        return solicitacaoSuporteRepository
            .findById(id)
            .orElseThrow(() -> new BadRequestAlertException("Solicitação não encontrada", ENTITY, "naoencontrada"));
    }

    private boolean ehAdminIgreja() {
        return SecurityUtils.hasCurrentUserAnyOfAuthorities(
            AuthoritiesConstants.ADMIN_IGREJA,
            AuthoritiesConstants.ADMIN
        );
    }

    private void validarProprietarioOuAdminIgreja(SolicitacaoSuporte s) {
        if (ehAdminIgreja()) {
            return;
        }
        User atual = tenantService.getUsuarioAtual();
        if (
            s.getUsuarioSolicitante() == null ||
            atual.getId() == null ||
            !Objects.equals(s.getUsuarioSolicitante().getId(), atual.getId())
        ) {
            throw new BadRequestAlertException("Acesso negado", ENTITY, "acessonegado");
        }
    }

    private void validarPodeEnviarMensagemCliente(SolicitacaoSuporte s) {
        if (STATUS_ENCERRADOS.contains(s.getStatus())) {
            throw new BadRequestAlertException("Solicitação encerrada", ENTITY, "encerrada");
        }
    }

    private void validarTextoMensagem(String texto) {
        if (texto == null || texto.trim().length() < 2) {
            throw new BadRequestAlertException("Mensagem muito curta", ENTITY, "mensagemcurta");
        }
        if (texto.trim().length() > 2000) {
            throw new BadRequestAlertException("Mensagem muito longa", ENTITY, "mensagemlonga");
        }
    }

    private void registrarMensagem(SolicitacaoSuporte s, User usuario, TipoSolicitacaoSuporteMensagem tipo, String texto) {
        SolicitacaoSuporteMensagem m = new SolicitacaoSuporteMensagem();
        m.setSolicitacaoSuporte(s);
        m.setUsuario(usuario);
        m.setTipo(tipo);
        m.setTexto(texto);
        m.setDataEnvio(Instant.now());
        if (usuario != null) {
            m.setUsuarioNome(montarNome(usuario));
        } else if (tipo == TipoSolicitacaoSuporteMensagem.SISTEMA) {
            m.setUsuarioNome("Sistema");
        }
        mensagemRepository.save(m);
    }

    private void registrarHistorico(
        SolicitacaoSuporte s,
        User usuario,
        AcaoSolicitacaoSuporteHistorico acao,
        StatusSolicitacaoSuporte statusAnterior,
        StatusSolicitacaoSuporte statusNovo,
        String mensagem,
        boolean visivelCliente
    ) {
        SolicitacaoSuporteHistorico h = new SolicitacaoSuporteHistorico();
        h.setSolicitacaoSuporte(s);
        h.setUsuario(usuario);
        h.setAcao(acao);
        h.setStatusAnterior(statusAnterior);
        h.setStatusNovo(statusNovo);
        h.setMensagem(mensagem);
        h.setDataAcao(Instant.now());
        h.setVisivelParaCliente(visivelCliente);
        h.setUsuarioNome(usuario != null ? montarNome(usuario) : "Sistema");
        historicoRepository.save(h);
    }

    private SolicitacaoSuporteDTO toDto(SolicitacaoSuporte s, boolean incluirObsInterna, boolean comHistorico) {
        SolicitacaoSuporteDTO dto = new SolicitacaoSuporteDTO();
        dto.setId(s.getId());
        if (s.getIgreja() != null) {
            dto.setIgrejaId(s.getIgreja().getId());
            dto.setIgrejaNome(s.getIgreja().getNome());
        }
        if (s.getUsuarioSolicitante() != null) {
            dto.setUsuarioSolicitanteId(s.getUsuarioSolicitante().getId());
        }
        dto.setNomeSolicitante(s.getNomeSolicitante());
        dto.setEmailSolicitante(s.getEmailSolicitante());
        dto.setTelefoneSolicitante(s.getTelefoneSolicitante());
        dto.setTipo(s.getTipo());
        dto.setPrioridade(s.getPrioridade());
        dto.setTitulo(s.getTitulo());
        dto.setDescricao(s.getDescricao());
        dto.setStatus(s.getStatus());
        dto.setRespostaAdmin(s.getRespostaAdmin());
        if (s.getRespondidoPor() != null) {
            dto.setRespondidoPorId(s.getRespondidoPor().getId());
            dto.setRespondidoPorNome(montarNome(s.getRespondidoPor()));
        }
        if (incluirObsInterna) {
            dto.setObservacaoInternaAdmin(s.getObservacaoInternaAdmin());
        }
        dto.setLidaPeloCliente(s.getLidaPeloCliente());
        if (incluirObsInterna) {
            dto.setLidaPeloSuporte(s.getLidaPeloSuporte());
        }
        dto.setDataResposta(s.getDataResposta());
        dto.setDataFinalizacao(s.getDataFinalizacao());
        dto.setCreatedDate(s.getCreatedDate());
        dto.setLastModifiedDate(s.getLastModifiedDate());

        long quantidadeAnexos = anexoRepository.countBySolicitacaoSuporteId(s.getId());
        dto.setQuantidadeAnexos((int) quantidadeAnexos);
        dto.setTemAnexo(quantidadeAnexos > 0);
        if (comHistorico) {
            List<SolicitacaoSuporteAnexo> anexos = anexoRepository.findAllBySolicitacaoSuporteId(s.getId());
            dto.setAnexos(anexos.stream().map(this::toAnexoDto).toList());
        }

        if (comHistorico) {
            List<SolicitacaoSuporteHistorico> registros = incluirObsInterna
                ? historicoRepository.findAllBySolicitacaoSuporteIdOrderByDataAcaoAsc(s.getId())
                : historicoRepository.findAllBySolicitacaoSuporteIdAndVisivelParaClienteTrueOrderByDataAcaoAsc(s.getId());
            dto.setHistorico(registros.stream().map(this::toHistoricoDto).toList());
            dto.setMensagens(
                mensagemRepository.findAllBySolicitacaoSuporteIdOrderByDataEnvioAsc(s.getId()).stream().map(this::toMensagemDto).toList()
            );
        }

        return dto;
    }

    private SolicitacaoSuporteMensagemDTO toMensagemDto(SolicitacaoSuporteMensagem m) {
        SolicitacaoSuporteMensagemDTO dto = new SolicitacaoSuporteMensagemDTO();
        dto.setId(m.getId());
        dto.setTipo(m.getTipo());
        dto.setTexto(m.getTexto());
        dto.setDataEnvio(m.getDataEnvio());
        dto.setUsuarioNome(m.getUsuarioNome());
        if (m.getUsuario() != null) {
            dto.setUsuarioId(m.getUsuario().getId());
        }
        return dto;
    }

    private SolicitacaoSuporteHistoricoDTO toHistoricoDto(SolicitacaoSuporteHistorico h) {
        SolicitacaoSuporteHistoricoDTO dto = new SolicitacaoSuporteHistoricoDTO();
        dto.setId(h.getId());
        dto.setAcao(h.getAcao());
        dto.setStatusAnterior(h.getStatusAnterior());
        dto.setStatusNovo(h.getStatusNovo());
        dto.setMensagem(h.getMensagem());
        dto.setDataAcao(h.getDataAcao());
        dto.setUsuarioNome(h.getUsuarioNome());
        dto.setVisivelParaCliente(h.getVisivelParaCliente());
        return dto;
    }

    private SolicitacaoSuporteAnexoDTO toAnexoDto(SolicitacaoSuporteAnexo a) {
        SolicitacaoSuporteAnexoDTO dto = new SolicitacaoSuporteAnexoDTO();
        dto.setId(a.getId());
        dto.setNomeArquivo(a.getNomeArquivo());
        dto.setTipoArquivo(a.getTipoArquivo());
        dto.setTamanhoArquivo(a.getTamanhoArquivo());
        dto.setDataUpload(a.getDataUpload());
        return dto;
    }

    private String montarNome(User u) {
        String name = (Objects.toString(u.getFirstName(), "") + " " + Objects.toString(u.getLastName(), "")).trim();
        return name.isBlank() ? u.getLogin() : name;
    }

    private String apenasDigitos(String v) {
        return v.replaceAll("\\D", "");
    }

    private String normalizarBusca(String busca) {
        if (busca == null || busca.isBlank()) {
            return null;
        }
        return busca.trim();
    }

    private Specification<SolicitacaoSuporte> aplicarFiltrosComuns(
        Specification<SolicitacaoSuporte> spec,
        StatusSolicitacaoSuporte status,
        TipoSolicitacaoSuporte tipo,
        Instant dataInicio,
        Instant dataFim,
        String busca
    ) {
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (tipo != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("tipo"), tipo));
        }
        if (dataInicio != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdDate"), dataInicio));
        }
        if (dataFim != null) {
            spec = spec.and((root, query, cb) -> cb.lessThan(root.get("createdDate"), dataFim));
        }
        if (busca != null) {
            String termo = "%" + busca.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("titulo")), termo));
        }
        return spec;
    }

    private String getExtension(String filename) {
        int idx = filename.lastIndexOf('.');
        return idx >= 0 ? filename.substring(idx) : "";
    }

    private String sanitizarNomeArquivo(String name) {
        return name.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
