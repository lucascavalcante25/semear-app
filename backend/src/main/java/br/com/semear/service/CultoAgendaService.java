package br.com.semear.service;

import br.com.semear.domain.*;
import br.com.semear.domain.enumeration.DiaSemanaCulto;
import br.com.semear.domain.enumeration.PapelCultoResponsavel;
import br.com.semear.domain.enumeration.TipoCulto;
import br.com.semear.repository.*;
import br.com.semear.service.dto.CultoAgendaItemDTO;
import br.com.semear.service.dto.CultoAgendaListaDTO;
import br.com.semear.service.dto.CultoOcorrenciaSalvarDTO;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CultoAgendaService {

    private static final String ENTITY = "culto";
    private static final ZoneId ZONE = ZoneId.of("America/Fortaleza");
    private static final int DIAS_PASSADOS = 90;
    private static final int DIAS_FUTUROS = 90;

    @PersistenceContext
    private EntityManager entityManager;

    private final CultoRegistroRepository cultoRegistroRepository;
    private final CultoOcorrenciaRepository cultoOcorrenciaRepository;
    private final CultoOcorrenciaLouvorRepository cultoOcorrenciaLouvorRepository;
    private final CultoOcorrenciaResponsavelRepository cultoOcorrenciaResponsavelRepository;
    private final EscalaRepository escalaRepository;
    private final EscalaItemRepository escalaItemRepository;
    private final GrupoLouvorRepository grupoLouvorRepository;
    private final GrupoLouvorItemRepository grupoLouvorItemRepository;
    private final LouvorRepository louvorRepository;
    private final UserRepository userRepository;
    private final TenantService tenantService;

    public CultoAgendaService(
        CultoRegistroRepository cultoRegistroRepository,
        CultoOcorrenciaRepository cultoOcorrenciaRepository,
        CultoOcorrenciaLouvorRepository cultoOcorrenciaLouvorRepository,
        CultoOcorrenciaResponsavelRepository cultoOcorrenciaResponsavelRepository,
        EscalaRepository escalaRepository,
        EscalaItemRepository escalaItemRepository,
        GrupoLouvorRepository grupoLouvorRepository,
        GrupoLouvorItemRepository grupoLouvorItemRepository,
        LouvorRepository louvorRepository,
        UserRepository userRepository,
        TenantService tenantService
    ) {
        this.cultoRegistroRepository = cultoRegistroRepository;
        this.cultoOcorrenciaRepository = cultoOcorrenciaRepository;
        this.cultoOcorrenciaLouvorRepository = cultoOcorrenciaLouvorRepository;
        this.cultoOcorrenciaResponsavelRepository = cultoOcorrenciaResponsavelRepository;
        this.escalaRepository = escalaRepository;
        this.escalaItemRepository = escalaItemRepository;
        this.grupoLouvorRepository = grupoLouvorRepository;
        this.grupoLouvorItemRepository = grupoLouvorItemRepository;
        this.louvorRepository = louvorRepository;
        this.userRepository = userRepository;
        this.tenantService = tenantService;
    }

    @Transactional(readOnly = true)
    public CultoAgendaListaDTO listarAgenda() {
        Long igrejaId = tenantService.getIgrejaIdAtual();
        LocalDate hoje = LocalDate.now(ZONE);
        LocalDate inicio = hoje.minusDays(DIAS_PASSADOS);
        LocalDate fim = hoje.plusDays(DIAS_FUTUROS);

        List<CultoRegistro> cultos = cultoRegistroRepository
            .findByIgrejaIdOrderByNomeAsc(igrejaId)
            .stream()
            .filter(c -> Boolean.TRUE.equals(c.getAtivo()))
            .toList();

        List<Slot> slots = projetarSlots(cultos, inicio, fim);
        Map<String, CultoOcorrencia> ocorrencias = cultoOcorrenciaRepository
            .findByIgrejaIdAndDataEventoBetweenOrderByDataEventoAsc(igrejaId, inicio, fim)
            .stream()
            .collect(Collectors.toMap(o -> chave(o.getCultoRegistro().getId(), o.getDataEvento()), o -> o, (a, b) -> a));

        List<Long> cultoIds = cultos.stream().map(CultoRegistro::getId).toList();
        Map<String, List<Escala>> escalasPorSlot = new HashMap<>();
        Map<Long, List<EscalaItem>> itensPorEscala = new HashMap<>();
        if (!cultoIds.isEmpty()) {
            Instant inicioInst = inicio.atStartOfDay(ZONE).toInstant();
            Instant fimInst = fim.plusDays(1).atStartOfDay(ZONE).toInstant();
            List<Escala> escalas = escalaRepository.findByIgrejaCultosAndPeriodo(igrejaId, cultoIds, inicioInst, fimInst);
            for (Escala e : escalas) {
                if (e.getCultoRegistro() == null || e.getDataEvento() == null) continue;
                LocalDate data = e.getDataEvento().atZone(ZONE).toLocalDate();
                String k = chave(e.getCultoRegistro().getId(), data);
                escalasPorSlot.computeIfAbsent(k, x -> new ArrayList<>()).add(e);
            }
            List<Long> escalaIds = escalas.stream().map(Escala::getId).toList();
            if (!escalaIds.isEmpty()) {
                for (EscalaItem item : escalaItemRepository.findByEscalaIdInWithUser(escalaIds)) {
                    itensPorEscala.computeIfAbsent(item.getEscala().getId(), x -> new ArrayList<>()).add(item);
                }
            }
        }

        List<CultoAgendaItemDTO> todos = new ArrayList<>();
        for (Slot slot : slots) {
            String k = chave(slot.culto.getId(), slot.data);
            CultoOcorrencia oc = ocorrencias.get(k);
            List<Escala> escalasSlot = escalasPorSlot.getOrDefault(k, List.of());
            todos.add(montarItem(slot, oc, escalasSlot, itensPorEscala));
        }

        CultoAgendaListaDTO lista = new CultoAgendaListaDTO();
        lista.setProximos(
            todos.stream().filter(i -> !i.getData().isBefore(hoje)).sorted(Comparator.comparing(CultoAgendaItemDTO::getData)).toList()
        );
        lista.setPassados(
            todos
                .stream()
                .filter(i -> i.getData().isBefore(hoje))
                .sorted(Comparator.comparing(CultoAgendaItemDTO::getData).reversed())
                .toList()
        );
        return lista;
    }

    @Transactional(readOnly = true)
    public CultoAgendaItemDTO obterDetalhe(Long cultoRegistroId, LocalDate data) {
        Long igrejaId = tenantService.getIgrejaIdAtual();
        CultoRegistro culto = cultoRegistroRepository
            .findByIdAndIgrejaId(cultoRegistroId, igrejaId)
            .orElseThrow(() -> new BadRequestAlertException("Culto não encontrado", ENTITY, "notfound"));
        CultoOcorrencia oc = cultoOcorrenciaRepository.findByCultoRegistroIdAndDataEvento(cultoRegistroId, data).orElse(null);
        Instant inicio = data.atStartOfDay(ZONE).toInstant();
        Instant fim = data.plusDays(1).atStartOfDay(ZONE).toInstant();
        List<Escala> escalas = escalaRepository.findByIgrejaCultosAndPeriodo(igrejaId, List.of(cultoRegistroId), inicio, fim);
        Map<Long, List<EscalaItem>> itens = new HashMap<>();
        List<Long> ids = escalas.stream().map(Escala::getId).toList();
        if (!ids.isEmpty()) {
            for (EscalaItem item : escalaItemRepository.findByEscalaIdInWithUser(ids)) {
                itens.computeIfAbsent(item.getEscala().getId(), x -> new ArrayList<>()).add(item);
            }
        }
        return montarItem(new Slot(culto, data), oc, escalas, itens);
    }

    public CultoAgendaItemDTO salvarOcorrencia(CultoOcorrenciaSalvarDTO dto) {
        if (dto.getCultoRegistroId() == null || dto.getData() == null) {
            throw new BadRequestAlertException("Culto e data são obrigatórios", ENTITY, "dadosinvalidos");
        }
        Long igrejaId = tenantService.getIgrejaIdAtual();
        Igreja igreja = tenantService.resolverIgrejaParaCriacao();
        CultoRegistro culto = cultoRegistroRepository
            .findByIdAndIgrejaId(dto.getCultoRegistroId(), igrejaId)
            .orElseThrow(() -> new BadRequestAlertException("Culto não encontrado", ENTITY, "notfound"));

        CultoOcorrencia oc = cultoOcorrenciaRepository
            .findByCultoRegistroIdAndDataEvento(dto.getCultoRegistroId(), dto.getData())
            .orElseGet(() -> {
                CultoOcorrencia nova = new CultoOcorrencia();
                nova.setIgreja(igreja);
                nova.setCultoRegistro(culto);
                nova.setDataEvento(dto.getData());
                nova.setCriadoEm(Instant.now());
                return nova;
            });

        oc.setPregador(trimOrNull(dto.getPregador()));
        oc.setTituloMensagem(trimOrNull(dto.getTituloMensagem()));
        oc.setVersiculoCentral(trimOrNull(dto.getVersiculoCentral()));
        oc.setObservacoes(trimOrNull(dto.getObservacoes()));
        oc.setAtualizadoEm(Instant.now());

        if (dto.getGrupoLouvorOrigemId() != null) {
            GrupoLouvor grupo = grupoLouvorRepository
                .findByIdAndIgrejaId(dto.getGrupoLouvorOrigemId(), igrejaId)
                .orElseThrow(() -> new BadRequestAlertException("Grupo de louvor não encontrado", ENTITY, "gruponotfound"));
            oc.setGrupoLouvorOrigem(grupo);
        } else {
            oc.setGrupoLouvorOrigem(null);
        }

        oc = cultoOcorrenciaRepository.save(oc);

        cultoOcorrenciaLouvorRepository.deleteByCultoOcorrenciaId(oc.getId());
        entityManager.flush();

        List<Long> louvorIds = dto.getLouvorIds() == null
            ? List.of()
            : dto.getLouvorIds().stream().filter(Objects::nonNull).distinct().toList();
        int ordem = 0;
        for (Long louvorId : louvorIds) {
            Louvor louvor = louvorRepository
                .findById(louvorId)
                .filter(l -> l.getIgreja() != null && Objects.equals(l.getIgreja().getId(), igrejaId))
                .orElseThrow(() -> new BadRequestAlertException("Louvor não encontrado", ENTITY, "louvornotfound"));
            CultoOcorrenciaLouvor item = new CultoOcorrenciaLouvor();
            item.setCultoOcorrencia(oc);
            item.setLouvor(louvor);
            item.setOrdem(ordem++);
            cultoOcorrenciaLouvorRepository.save(item);
        }

        if (dto.getResponsaveisManuais() != null) {
            cultoOcorrenciaResponsavelRepository.deleteByCultoOcorrenciaId(oc.getId());
            entityManager.flush();
            for (CultoOcorrenciaSalvarDTO.ResponsavelDTO r : dto.getResponsaveisManuais()) {
                if (r.getPapel() == null || r.getUserId() == null) continue;
                User user = userRepository
                    .findById(r.getUserId())
                    .filter(u -> u.getIgreja() != null && Objects.equals(u.getIgreja().getId(), igrejaId))
                    .orElseThrow(() -> new BadRequestAlertException("Membro não encontrado", ENTITY, "usernotfound"));
                CultoOcorrenciaResponsavel resp = new CultoOcorrenciaResponsavel();
                resp.setCultoOcorrencia(oc);
                resp.setPapel(r.getPapel());
                resp.setUser(user);
                resp.setOrigemManual(true);
                cultoOcorrenciaResponsavelRepository.save(resp);
            }
        }

        return obterDetalhe(dto.getCultoRegistroId(), dto.getData());
    }

    /** Copia louvores do grupo para o payload (sem mutar o grupo). */
    @Transactional(readOnly = true)
    public List<CultoAgendaItemDTO.CultoLouvorItemDTO> previewGrupoLouvor(Long grupoId) {
        Long igrejaId = tenantService.getIgrejaIdAtual();
        grupoLouvorRepository
            .findByIdAndIgrejaId(grupoId, igrejaId)
            .orElseThrow(() -> new BadRequestAlertException("Grupo não encontrado", ENTITY, "gruponotfound"));
        List<Long> ids = grupoLouvorItemRepository.findLouvorIdsByGrupoIdOrderByOrdem(grupoId);
        return montarPreviewLouvores(ids);
    }

    private List<CultoAgendaItemDTO.CultoLouvorItemDTO> montarPreviewLouvores(List<Long> ids) {
        List<CultoAgendaItemDTO.CultoLouvorItemDTO> out = new ArrayList<>();
        int ordem = 0;
        for (Long louvorId : ids) {
            Optional<Louvor> opt = louvorRepository.findById(louvorId);
            if (opt.isEmpty()) continue;
            Louvor l = opt.get();
            CultoAgendaItemDTO.CultoLouvorItemDTO item = new CultoAgendaItemDTO.CultoLouvorItemDTO();
            item.setLouvorId(l.getId());
            item.setTitulo(l.getTitulo());
            item.setArtista(l.getArtista());
            item.setOrdem(ordem++);
            out.add(item);
        }
        return out;
    }

    private CultoAgendaItemDTO montarItem(
        Slot slot,
        CultoOcorrencia oc,
        List<Escala> escalas,
        Map<Long, List<EscalaItem>> itensPorEscala
    ) {
        CultoAgendaItemDTO dto = new CultoAgendaItemDTO();
        dto.setCultoRegistroId(slot.culto.getId());
        dto.setNome(slot.culto.getNome());
        dto.setTipo(slot.culto.getTipo() != null ? slot.culto.getTipo() : TipoCulto.RECORRENTE);
        dto.setData(slot.data);
        dto.setHorario(slot.culto.getHorario());
        dto.setTemEscalaGerada(!escalas.isEmpty());

        if (oc != null) {
            dto.setOcorrenciaId(oc.getId());
            dto.setPregador(oc.getPregador());
            dto.setTituloMensagem(oc.getTituloMensagem());
            dto.setVersiculoCentral(oc.getVersiculoCentral());
            dto.setObservacoes(oc.getObservacoes());
            if (oc.getGrupoLouvorOrigem() != null) {
                dto.setGrupoLouvorOrigemId(oc.getGrupoLouvorOrigem().getId());
                dto.setGrupoLouvorOrigemNome(oc.getGrupoLouvorOrigem().getNome());
            }
            List<CultoAgendaItemDTO.CultoLouvorItemDTO> louvores = new ArrayList<>();
            for (CultoOcorrenciaLouvor item : cultoOcorrenciaLouvorRepository.findByCultoOcorrenciaIdOrderByOrdemAsc(oc.getId())) {
                CultoAgendaItemDTO.CultoLouvorItemDTO l = new CultoAgendaItemDTO.CultoLouvorItemDTO();
                l.setLouvorId(item.getLouvor().getId());
                l.setTitulo(item.getLouvor().getTitulo());
                l.setArtista(item.getLouvor().getArtista());
                l.setOrdem(item.getOrdem());
                louvores.add(l);
            }
            dto.setLouvores(louvores);

            List<CultoOcorrenciaResponsavel> manuais = cultoOcorrenciaResponsavelRepository.findByCultoOcorrenciaId(oc.getId());
            if (!manuais.isEmpty()) {
                dto.setTemOverrideResponsaveis(true);
                dto.setResponsaveis(
                    manuais
                        .stream()
                        .map(r -> {
                            CultoAgendaItemDTO.CultoResponsavelDTO rd = new CultoAgendaItemDTO.CultoResponsavelDTO();
                            rd.setPapel(r.getPapel());
                            rd.setUserId(r.getUser().getId());
                            rd.setNome(nomeUser(r.getUser()));
                            rd.setOrigemManual(true);
                            return rd;
                        })
                        .toList()
                );
            }
        }

        if (!dto.isTemOverrideResponsaveis()) {
            dto.setResponsaveis(responsaveisDaEscala(escalas, itensPorEscala));
        }
        return dto;
    }

    private List<CultoAgendaItemDTO.CultoResponsavelDTO> responsaveisDaEscala(
        List<Escala> escalas,
        Map<Long, List<EscalaItem>> itensPorEscala
    ) {
        List<CultoAgendaItemDTO.CultoResponsavelDTO> out = new ArrayList<>();
        for (Escala e : escalas) {
            PapelCultoResponsavel papel = papelDoDepartamento(e.getDepartamento());
            if (papel == null) continue;
            for (EscalaItem item : itensPorEscala.getOrDefault(e.getId(), List.of())) {
                CultoAgendaItemDTO.CultoResponsavelDTO rd = new CultoAgendaItemDTO.CultoResponsavelDTO();
                rd.setPapel(papel);
                rd.setUserId(item.getUser().getId());
                rd.setNome(nomeUser(item.getUser()));
                rd.setOrigemManual(false);
                out.add(rd);
            }
        }
        return out;
    }

    private PapelCultoResponsavel papelDoDepartamento(Departamento d) {
        if (d == null) return null;
        if (d.getCodigo() != null) {
            return switch (d.getCodigo()) {
                case PORTARIA -> PapelCultoResponsavel.PORTARIA;
                case RECEPCAO -> PapelCultoResponsavel.RECEPCAO;
                case LIMPEZA -> PapelCultoResponsavel.LIMPEZA;
                default -> null;
            };
        }
        String nome = d.getNome() != null ? d.getNome().toLowerCase(Locale.ROOT) : "";
        if (nome.contains("portaria")) return PapelCultoResponsavel.PORTARIA;
        if (nome.contains("recep")) return PapelCultoResponsavel.RECEPCAO;
        if (nome.contains("limpeza")) return PapelCultoResponsavel.LIMPEZA;
        return null;
    }

    private List<Slot> projetarSlots(List<CultoRegistro> cultos, LocalDate inicio, LocalDate fim) {
        List<Slot> slots = new ArrayList<>();
        for (CultoRegistro culto : cultos) {
            TipoCulto tipo = culto.getTipo() != null ? culto.getTipo() : TipoCulto.RECORRENTE;
            if (tipo == TipoCulto.EXTRAORDINARIO) {
                if (culto.getDataEspecifica() != null && !culto.getDataEspecifica().isBefore(inicio) && !culto.getDataEspecifica().isAfter(fim)) {
                    slots.add(new Slot(culto, culto.getDataEspecifica()));
                }
                continue;
            }
            for (LocalDate d = inicio; !d.isAfter(fim); d = d.plusDays(1)) {
                if (diaCompativel(d, culto.getDiaSemana())) {
                    slots.add(new Slot(culto, d));
                }
            }
        }
        return slots;
    }

    private boolean diaCompativel(LocalDate data, DiaSemanaCulto diaSemana) {
        if (diaSemana == null) return false;
        return switch (data.getDayOfWeek()) {
            case SUNDAY -> diaSemana == DiaSemanaCulto.DOMINGO;
            case MONDAY -> diaSemana == DiaSemanaCulto.SEGUNDA;
            case TUESDAY -> diaSemana == DiaSemanaCulto.TERCA;
            case WEDNESDAY -> diaSemana == DiaSemanaCulto.QUARTA;
            case THURSDAY -> diaSemana == DiaSemanaCulto.QUINTA;
            case FRIDAY -> diaSemana == DiaSemanaCulto.SEXTA;
            case SATURDAY -> diaSemana == DiaSemanaCulto.SABADO;
        };
    }

    private String chave(Long cultoId, LocalDate data) {
        return cultoId + "|" + data;
    }

    private String nomeUser(User u) {
        String fn = u.getFirstName() != null ? u.getFirstName() : "";
        String ln = u.getLastName() != null ? u.getLastName() : "";
        String nome = (fn + " " + ln).trim();
        return nome.isEmpty() ? u.getLogin() : nome;
    }

    private String trimOrNull(String v) {
        if (v == null) return null;
        String t = v.trim();
        return t.isEmpty() ? null : t;
    }

    private record Slot(CultoRegistro culto, LocalDate data) {}
}
