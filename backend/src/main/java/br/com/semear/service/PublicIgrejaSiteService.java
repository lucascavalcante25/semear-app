package br.com.semear.service;

import br.com.semear.domain.Aviso;
import br.com.semear.domain.Evento;
import br.com.semear.domain.Igreja;
import br.com.semear.domain.enumeration.PublicoEvento;
import br.com.semear.repository.AvisoRepository;
import br.com.semear.repository.EventoRepository;
import br.com.semear.repository.IgrejaRepository;
import br.com.semear.service.dto.EventoDTO;
import br.com.semear.service.dto.IgrejaSitePublicoDTO;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import java.time.Instant;
import java.time.LocalDate;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PublicIgrejaSiteService {

    private static final String ENTITY = "igrejaSitePublico";

    private final IgrejaRepository igrejaRepository;
    private final EventoRepository eventoRepository;
    private final AvisoRepository avisoRepository;

    public PublicIgrejaSiteService(
        IgrejaRepository igrejaRepository,
        EventoRepository eventoRepository,
        AvisoRepository avisoRepository
    ) {
        this.igrejaRepository = igrejaRepository;
        this.eventoRepository = eventoRepository;
        this.avisoRepository = avisoRepository;
    }

    public IgrejaSitePublicoDTO obterPorSlug(String slug) {
        Igreja igreja = igrejaRepository
            .findBySlugAndSiteAtivoTrue(slug)
            .orElseThrow(() -> new BadRequestAlertException("Igreja pública não encontrada", ENTITY, "naoencontrado"));
        return toDto(igreja);
    }

    private IgrejaSitePublicoDTO toDto(Igreja igreja) {
        IgrejaSitePublicoDTO dto = new IgrejaSitePublicoDTO();
        dto.setId(igreja.getId());
        dto.setSlug(igreja.getSlug());
        dto.setNome(igreja.getNome());
        dto.setSubtituloIgreja(igreja.getSubtituloIgreja());
        dto.setDescricaoIgreja(igreja.getDescricaoIgreja());
        dto.setLogoUrl(igreja.getLogoUrl());
        dto.setCorPrimaria(igreja.getCorPrimaria());
        dto.setCorSecundaria(igreja.getCorSecundaria());
        dto.setTextoBoasVindas(igreja.getTextoBoasVindas());
        dto.setHorarioCulto(igreja.getHorarioCulto());
        dto.setExibirAvisosPublicos(igreja.getExibirAvisosPublicos());
        dto.setEmail(igreja.getEmail());
        dto.setTelefone(igreja.getTelefone());
        dto.setEndereco(formatarEndereco(igreja));
        dto.setCidade(igreja.getCidade());
        dto.setEstado(igreja.getEstado());
        dto.setCep(igreja.getCep());

        Instant agora = Instant.now();
        dto.setEventosPublicos(
            eventoRepository
                .findByIgrejaIdAndPublicoAndDataInicioAfterOrderByDataInicioAsc(igreja.getId(), PublicoEvento.PUBLICO, agora)
                .stream()
                .map(this::toEventoDto)
                .toList()
        );

        if (Boolean.TRUE.equals(igreja.getExibirAvisosPublicos())) {
            LocalDate hoje = LocalDate.now();
            dto.setAvisosPublicos(
                avisoRepository
                    .findAllByIgrejaIdAndAtivoIsTrue(PageRequest.of(0, 10), igreja.getId())
                    .getContent()
                    .stream()
                    .filter(a -> avisoVigente(a, hoje))
                    .map(this::toAvisoDto)
                    .toList()
            );
        }

        return dto;
    }

    private EventoDTO toEventoDto(Evento evento) {
        EventoDTO dto = new EventoDTO();
        dto.setId(evento.getId());
        dto.setTitulo(evento.getTitulo());
        dto.setDescricao(evento.getDescricao());
        dto.setDataInicio(evento.getDataInicio());
        dto.setDataFim(evento.getDataFim());
        dto.setLocal(evento.getLocal());
        dto.setPublico(evento.getPublico());
        dto.setInscricoesAbertas(evento.getInscricoesAbertas());
        return dto;
    }

    private IgrejaSitePublicoDTO.AvisoPublicoDTO toAvisoDto(Aviso aviso) {
        IgrejaSitePublicoDTO.AvisoPublicoDTO dto = new IgrejaSitePublicoDTO.AvisoPublicoDTO();
        dto.setId(aviso.getId());
        dto.setTitulo(aviso.getTitulo());
        dto.setConteudo(aviso.getConteudo());
        return dto;
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

    private String formatarEndereco(Igreja igreja) {
        StringBuilder sb = new StringBuilder();
        if (igreja.getEndereco() != null && !igreja.getEndereco().isBlank()) {
            sb.append(igreja.getEndereco().trim());
        }
        if (igreja.getNumero() != null && !igreja.getNumero().isBlank()) {
            if (!sb.isEmpty()) {
                sb.append(", ");
            }
            sb.append(igreja.getNumero().trim());
        }
        if (igreja.getComplemento() != null && !igreja.getComplemento().isBlank()) {
            if (!sb.isEmpty()) {
                sb.append(" - ");
            }
            sb.append(igreja.getComplemento().trim());
        }
        if (igreja.getBairro() != null && !igreja.getBairro().isBlank()) {
            if (!sb.isEmpty()) {
                sb.append(" - ");
            }
            sb.append(igreja.getBairro().trim());
        }
        return sb.isEmpty() ? null : sb.toString();
    }
}
