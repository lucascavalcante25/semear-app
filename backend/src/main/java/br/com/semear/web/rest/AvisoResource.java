package br.com.semear.web.rest;

import br.com.semear.domain.Aviso;
import br.com.semear.domain.User;
import br.com.semear.repository.AvisoRepository;
import br.com.semear.repository.UserRepository;
import br.com.semear.service.UserService;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import jakarta.annotation.security.RolesAllowed;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

@RestController
@RequestMapping("/api/avisos")
@Transactional
public class AvisoResource {

    private static final Logger LOG = LoggerFactory.getLogger(AvisoResource.class);
    private static final String ENTITY_NAME = "aviso";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final AvisoRepository avisoRepository;
    private final UserService userService;
    private final UserRepository userRepository;

    public AvisoResource(AvisoRepository avisoRepository, UserService userService, UserRepository userRepository) {
        this.avisoRepository = avisoRepository;
        this.userService = userService;
        this.userRepository = userRepository;
    }

    private static String obterNomeCompleto(User user) {
        if (user == null) return "Sistema";
        String first = user.getFirstName() != null ? user.getFirstName().trim() : "";
        String last = user.getLastName() != null ? user.getLastName().trim() : "";
        String nome = (first + " " + last).trim();
        return nome.isEmpty() ? user.getLogin() : nome;
    }

    /**
     * Resolve criadoPor para nome completo quando o valor armazenado for CPF (login com 11 dígitos).
     */
    private String resolverCriadoPorDisplayName(String criadoPor) {
        if (criadoPor == null || criadoPor.isBlank()) {
            return "Sistema";
        }
        String apenasDigitos = criadoPor.replaceAll("\\D", "");
        if (apenasDigitos.length() == 11) {
            return userRepository.findOneByLogin(apenasDigitos)
                .map(AvisoResource::obterNomeCompleto)
                .orElse(criadoPor);
        }
        return criadoPor;
    }

    private AvisoResponseDTO toResponseDTO(Aviso aviso) {
        return AvisoResponseDTO.from(aviso, resolverCriadoPorDisplayName(aviso.getCriadoPor()));
    }

    @PostMapping("")
    @RolesAllowed({"ROLE_ADMIN", "ROLE_PASTOR", "ROLE_COPASTOR", "ROLE_LIDER", "ROLE_SECRETARIA"})
    public ResponseEntity<AvisoResponseDTO> createAviso(@RequestBody Aviso aviso) throws URISyntaxException {
        LOG.debug("REST request to save Aviso : {}", aviso);
        if (aviso.getId() != null) {
            throw new BadRequestAlertException("A new aviso cannot already have an ID", ENTITY_NAME, "idexists");
        }
        if (aviso.getTitulo() == null || aviso.getTitulo().isBlank()) {
            throw new BadRequestAlertException("Título é obrigatório.", ENTITY_NAME, "tituloobrigatorio");
        }
        if (aviso.getConteudo() == null || aviso.getConteudo().isBlank()) {
            throw new BadRequestAlertException("Conteúdo é obrigatório.", ENTITY_NAME, "conteudoobrigatorio");
        }
        if (aviso.getDataInicio() == null) {
            throw new BadRequestAlertException("Data início é obrigatória.", ENTITY_NAME, "datainicioobrigatoria");
        }
        if (aviso.getCriadoEm() == null) {
            aviso.setCriadoEm(Instant.now());
        }
        if (aviso.getCriadoPor() == null || aviso.getCriadoPor().isBlank()) {
            String nomeCriador = userService.getUserWithAuthorities()
                .map(AvisoResource::obterNomeCompleto)
                .orElse("Sistema");
            aviso.setCriadoPor(nomeCriador);
        }
        Aviso result = avisoRepository.save(aviso);
        return ResponseEntity.created(new URI("/api/avisos/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(toResponseDTO(result));
    }

    @PutMapping("/{id}")
    @RolesAllowed({"ROLE_ADMIN", "ROLE_PASTOR", "ROLE_COPASTOR", "ROLE_LIDER", "ROLE_SECRETARIA"})
    public ResponseEntity<AvisoResponseDTO> updateAviso(@PathVariable("id") final Long id, @RequestBody Aviso aviso)
        throws URISyntaxException {
        LOG.debug("REST request to update Aviso : {}, {}", id, aviso);
        if (aviso.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, aviso.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }
        Optional<Aviso> existenteOpt = avisoRepository.findById(id);
        if (existenteOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        if (aviso.getTitulo() == null || aviso.getTitulo().isBlank()) {
            throw new BadRequestAlertException("Título é obrigatório.", ENTITY_NAME, "tituloobrigatorio");
        }
        if (aviso.getConteudo() == null || aviso.getConteudo().isBlank()) {
            throw new BadRequestAlertException("Conteúdo é obrigatório.", ENTITY_NAME, "conteudoobrigatorio");
        }
        if (aviso.getDataInicio() == null) {
            throw new BadRequestAlertException("Data início é obrigatória.", ENTITY_NAME, "datainicioobrigatoria");
        }

        Aviso existente = existenteOpt.get();
        existente.setTitulo(aviso.getTitulo());
        existente.setConteudo(aviso.getConteudo());
        existente.setTipo(aviso.getTipo());
        existente.setDataInicio(aviso.getDataInicio());
        existente.setDataFim(aviso.getDataFim());
        existente.setAtivo(aviso.getAtivo());
        existente.setAtualizadoEm(Instant.now());
        existente.setAtualizadoPor(userService.getUserWithAuthorities()
            .map(AvisoResource::obterNomeCompleto)
            .orElse("Sistema"));

        Aviso result = avisoRepository.save(existente);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(toResponseDTO(result));
    }

    @GetMapping("")
    public ResponseEntity<List<AvisoResponseDTO>> getAllAvisos(
        @RequestParam(name = "ativos", required = false, defaultValue = "true") boolean ativos,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get a page of Avisos");
        Page<Aviso> page = ativos ? avisoRepository.findAllByAtivoIsTrue(pageable) : avisoRepository.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        List<AvisoResponseDTO> body = page.getContent().stream().map(this::toResponseDTO).collect(Collectors.toList());
        return ResponseEntity.ok().headers(headers).body(body);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AvisoResponseDTO> getAviso(@PathVariable("id") final Long id) {
        LOG.debug("REST request to get Aviso : {}", id);
        Optional<Aviso> aviso = avisoRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(aviso.map(this::toResponseDTO));
    }

    @DeleteMapping("/{id}")
    @RolesAllowed({"ROLE_ADMIN", "ROLE_PASTOR", "ROLE_COPASTOR", "ROLE_LIDER", "ROLE_SECRETARIA"})
    public ResponseEntity<Void> deleteAviso(@PathVariable("id") final Long id) {
        LOG.debug("REST request to delete Aviso : {}", id);
        avisoRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}

