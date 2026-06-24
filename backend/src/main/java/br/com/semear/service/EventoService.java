package br.com.semear.service;

import br.com.semear.domain.Evento;
import br.com.semear.domain.EventoInscricao;
import br.com.semear.domain.User;
import br.com.semear.repository.EventoInscricaoRepository;
import br.com.semear.repository.EventoRepository;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.service.dto.EventoDTO;
import br.com.semear.service.dto.EventoInscricaoDTO;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EventoService {

    private static final String ENTITY = "evento";

    private final EventoRepository eventoRepository;
    private final EventoInscricaoRepository eventoInscricaoRepository;
    private final TenantService tenantService;

    public EventoService(EventoRepository eventoRepository, EventoInscricaoRepository eventoInscricaoRepository, TenantService tenantService) {
        this.eventoRepository = eventoRepository;
        this.eventoInscricaoRepository = eventoInscricaoRepository;
        this.tenantService = tenantService;
    }

    @Transactional(readOnly = true)
    public List<EventoDTO> listar() {
        User usuario = tenantService.getUsuarioAtual();
        return eventoRepository
            .findByIgrejaIdOrderByDataInicioDesc(tenantService.getIgrejaIdAtual())
            .stream()
            .map(e -> toDtoResumo(e, usuario))
            .toList();
    }

    @Transactional(readOnly = true)
    public Optional<EventoDTO> obter(Long id) {
        User usuario = tenantService.getUsuarioAtual();
        return obterEntidade(id).map(e -> toDtoComInscricoes(e, usuario));
    }

    public EventoDTO criar(EventoDTO dto) {
        validarDados(dto);
        Evento entity = new Evento();
        entity.setIgreja(tenantService.resolverIgrejaParaCriacao());
        aplicarDados(entity, dto);
        entity.setCriadoEm(Instant.now());
        return toDtoComInscricoes(eventoRepository.save(entity), tenantService.getUsuarioAtual());
    }

    public EventoDTO atualizar(Long id, EventoDTO dto) {
        validarDados(dto);
        Evento entity = obterEntidade(id).orElseThrow(this::naoEncontrado);
        aplicarDados(entity, dto);
        return toDtoComInscricoes(eventoRepository.save(entity), tenantService.getUsuarioAtual());
    }

    public void excluir(Long id) {
        Evento entity = obterEntidade(id).orElseThrow(this::naoEncontrado);
        eventoInscricaoRepository.findByEventoId(entity.getId()).forEach(eventoInscricaoRepository::delete);
        eventoRepository.delete(entity);
    }

    public EventoInscricaoDTO inscrever(Long id) {
        Evento evento = obterEntidade(id).orElseThrow(this::naoEncontrado);
        if (!Boolean.TRUE.equals(evento.getInscricoesAbertas())) {
            throw new BadRequestAlertException("Inscrições estão fechadas para este evento", ENTITY, "inscricoesfechadas");
        }
        validarCapacidade(evento);
        User user = tenantService.getUsuarioAtual();
        Optional<EventoInscricao> existente = eventoInscricaoRepository.findByEventoIdAndUserId(evento.getId(), user.getId());
        if (existente.isPresent()) {
            return toInscricaoDto(existente.get());
        }
        EventoInscricao inscricao = new EventoInscricao();
        inscricao.setEvento(evento);
        inscricao.setUser(user);
        inscricao.setConfirmado(false);
        inscricao.setCriadoEm(Instant.now());
        return toInscricaoDto(eventoInscricaoRepository.save(inscricao));
    }

    public void desinscrever(Long id) {
        Evento evento = obterEntidade(id).orElseThrow(this::naoEncontrado);
        User user = tenantService.getUsuarioAtual();
        eventoInscricaoRepository.deleteByEventoIdAndUserId(evento.getId(), user.getId());
    }

    public EventoInscricaoDTO checkIn(Long eventoId, Long inscricaoId) {
        validarLideranca();
        Evento evento = obterEntidade(eventoId).orElseThrow(this::naoEncontrado);
        EventoInscricao inscricao = eventoInscricaoRepository
            .findByIdAndEventoId(inscricaoId, evento.getId())
            .orElseThrow(() -> new BadRequestAlertException("Inscrição não encontrada", ENTITY, "inscricaonaoencontrada"));
        inscricao.setConfirmado(true);
        return toInscricaoDto(eventoInscricaoRepository.save(inscricao));
    }

    private void validarCapacidade(Evento evento) {
        if (evento.getCapacidade() == null) {
            return;
        }
        long total = eventoInscricaoRepository.countByEventoId(evento.getId());
        if (total >= evento.getCapacidade()) {
            throw new BadRequestAlertException("Capacidade máxima do evento atingida", ENTITY, "capacidadeesgotada");
        }
    }

    private void aplicarDados(Evento entity, EventoDTO dto) {
        entity.setTitulo(dto.getTitulo().trim());
        entity.setDescricao(dto.getDescricao());
        entity.setDataInicio(dto.getDataInicio());
        entity.setDataFim(dto.getDataFim());
        entity.setLocal(dto.getLocal());
        entity.setPublico(dto.getPublico());
        entity.setInscricoesAbertas(dto.getInscricoesAbertas() != null ? dto.getInscricoesAbertas() : false);
        entity.setCapacidade(dto.getCapacidade());
    }

    private void validarDados(EventoDTO dto) {
        if (dto.getTitulo() == null || dto.getTitulo().isBlank()) {
            throw new BadRequestAlertException("Título do evento é obrigatório", ENTITY, "tituloobrigatorio");
        }
        if (dto.getDataInicio() == null) {
            throw new BadRequestAlertException("Data de início é obrigatória", ENTITY, "datainicioobrigatoria");
        }
        if (dto.getPublico() == null) {
            throw new BadRequestAlertException("Público do evento é obrigatório", ENTITY, "publicoobrigatorio");
        }
    }

    private Optional<Evento> obterEntidade(Long id) {
        return eventoRepository.findByIdAndIgrejaId(id, tenantService.getIgrejaIdAtual());
    }

    private EventoDTO toDtoResumo(Evento entity, User usuario) {
        EventoDTO dto = preencherDtoBase(entity);
        long total = eventoInscricaoRepository.countByEventoId(entity.getId());
        dto.setTotalInscritos((int) total);
        dto.setInscrito(eventoInscricaoRepository.findByEventoIdAndUserId(entity.getId(), usuario.getId()).isPresent());
        return dto;
    }

    private EventoDTO toDtoComInscricoes(Evento entity, User usuario) {
        EventoDTO dto = toDtoResumo(entity, usuario);
        dto.setInscricoes(eventoInscricaoRepository.findByEventoId(entity.getId()).stream().map(this::toInscricaoDto).toList());
        return dto;
    }

    private EventoDTO preencherDtoBase(Evento entity) {
        EventoDTO dto = new EventoDTO();
        dto.setId(entity.getId());
        if (entity.getIgreja() != null) {
            dto.setIgrejaId(entity.getIgreja().getId());
        }
        dto.setTitulo(entity.getTitulo());
        dto.setDescricao(entity.getDescricao());
        dto.setDataInicio(entity.getDataInicio());
        dto.setDataFim(entity.getDataFim());
        dto.setLocal(entity.getLocal());
        dto.setPublico(entity.getPublico());
        dto.setInscricoesAbertas(entity.getInscricoesAbertas());
        dto.setCapacidade(entity.getCapacidade());
        dto.setCriadoEm(entity.getCriadoEm());
        return dto;
    }

    private EventoInscricaoDTO toInscricaoDto(EventoInscricao entity) {
        EventoInscricaoDTO dto = new EventoInscricaoDTO();
        dto.setId(entity.getId());
        if (entity.getEvento() != null) {
            dto.setEventoId(entity.getEvento().getId());
        }
        if (entity.getUser() != null) {
            dto.setUserId(entity.getUser().getId());
            dto.setUserNome(montarNome(entity.getUser()));
        }
        dto.setConfirmado(entity.getConfirmado());
        dto.setCriadoEm(entity.getCriadoEm());
        return dto;
    }

    private void validarLideranca() {
        User user = tenantService.getUsuarioAtual();
        if (!ehLideranca(user)) {
            throw new BadRequestAlertException("Acesso restrito à liderança", ENTITY, "acessonegado");
        }
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

    private String montarNome(User user) {
        String nome = (Objects.toString(user.getFirstName(), "") + " " + Objects.toString(user.getLastName(), "")).trim();
        return nome.isBlank() ? user.getLogin() : nome;
    }

    private BadRequestAlertException naoEncontrado() {
        return new BadRequestAlertException("Evento não encontrado", ENTITY, "naoencontrado");
    }
}
