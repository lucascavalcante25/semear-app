package br.com.semear.service;

import br.com.semear.domain.Comunicado;
import br.com.semear.domain.Evento;
import br.com.semear.domain.Igreja;
import br.com.semear.domain.enumeration.PublicoEvento;
import br.com.semear.repository.ComunicadoRepository;
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
    private final ComunicadoRepository comunicadoRepository;

    public PublicIgrejaSiteService(
        IgrejaRepository igrejaRepository,
        EventoRepository eventoRepository,
        ComunicadoRepository comunicadoRepository
    ) {
        this.igrejaRepository = igrejaRepository;
        this.eventoRepository = eventoRepository;
        this.comunicadoRepository = comunicadoRepository;
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
        dto.setExibirComunicadosPublicos(igreja.getExibirComunicadosPublicos());
        dto.setEmail(igreja.getEmail());
        dto.setTelefone(igreja.getTelefone());
        dto.setEndereco(formatarEndereco(igreja));
        dto.setCidade(igreja.getCidade());
        dto.setEstado(igreja.getEstado());
        dto.setCep(igreja.getCep());

        Instant agora = Instant.now();
        dto.setEventosPublicos(
            eventoRepository
                .findByIgrejaIdAndPublicoAndStatusAndDataInicioAfterOrderByDataInicioAsc(
                    igreja.getId(),
                    PublicoEvento.PUBLICO,
                    br.com.semear.domain.enumeration.StatusEvento.PUBLICADO,
                    agora
                )
                .stream()
                .map(this::toEventoDto)
                .toList()
        );

        if (Boolean.TRUE.equals(igreja.getExibirComunicadosPublicos())) {
            LocalDate hoje = LocalDate.now();
            dto.setComunicadosPublicos(
                comunicadoRepository
                    .findAllByIgrejaIdAndAtivoIsTrue(PageRequest.of(0, 10), igreja.getId())
                    .getContent()
                    .stream()
                    .filter(c -> Boolean.TRUE.equals(c.getExibirNoSitePublico()))
                    .filter(c -> comunicadoVigente(c, hoje))
                    .map(this::toComunicadoDto)
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
        dto.setCategoria(evento.getCategoria());
        dto.setStatus(evento.getStatus());
        dto.setLinkExterno(evento.getLinkExterno());
        dto.setImagemUrl(evento.getImagemUrl());
        return dto;
    }

    private IgrejaSitePublicoDTO.ComunicadoPublicoDTO toComunicadoDto(Comunicado comunicado) {
        IgrejaSitePublicoDTO.ComunicadoPublicoDTO dto = new IgrejaSitePublicoDTO.ComunicadoPublicoDTO();
        dto.setId(comunicado.getId());
        dto.setTitulo(comunicado.getTitulo());
        dto.setConteudo(comunicado.getConteudo());
        return dto;
    }

    private boolean comunicadoVigente(Comunicado comunicado, LocalDate referencia) {
        if (comunicado.getDataInicio() != null && referencia.isBefore(comunicado.getDataInicio())) {
            return false;
        }
        if (comunicado.getDataFim() != null && referencia.isAfter(comunicado.getDataFim())) {
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
