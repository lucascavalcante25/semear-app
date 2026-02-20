package br.com.semear.web.rest;

import br.com.semear.domain.PreCadastro;
import br.com.semear.domain.enumeration.PerfilAcesso;
import br.com.semear.domain.enumeration.StatusCadastro;
import br.com.semear.domain.Endereco;
import br.com.semear.repository.EnderecoRepository;
import br.com.semear.repository.PreCadastroRepository;
import br.com.semear.repository.UserRepository;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.service.PreCadastroService;
import br.com.semear.web.rest.vm.AprovarPreCadastroVM;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link br.com.semear.domain.PreCadastro}.
 */
@RestController
@RequestMapping("/api/pre-cadastros")
@Transactional
public class PreCadastroResource {

    private static final Logger LOG = LoggerFactory.getLogger(PreCadastroResource.class);

    private static final String ENTITY_NAME = "preCadastro";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final PreCadastroRepository preCadastroRepository;
    private final PreCadastroService preCadastroService;
    private final UserRepository userRepository;
    private final EnderecoRepository enderecoRepository;

    public PreCadastroResource(
        PreCadastroRepository preCadastroRepository,
        PreCadastroService preCadastroService,
        UserRepository userRepository,
        EnderecoRepository enderecoRepository
    ) {
        this.preCadastroRepository = preCadastroRepository;
        this.preCadastroService = preCadastroService;
        this.userRepository = userRepository;
        this.enderecoRepository = enderecoRepository;
    }

    /**
     * {@code POST  /pre-cadastros} : Create a new preCadastro.
     *
     * @param preCadastro the preCadastro to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new preCadastro, or with status {@code 400 (Bad Request)} if the preCadastro has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<PreCadastro> createPreCadastro(@Valid @RequestBody PreCadastro preCadastro) throws URISyntaxException {
        LOG.debug("REST request to save PreCadastro : {}", preCadastro);
        if (preCadastro.getId() != null) {
            throw new BadRequestAlertException("A new preCadastro cannot already have an ID", ENTITY_NAME, "idexists");
        }
        if (StringUtils.isNotBlank(preCadastro.getEmail())) {
            preCadastro.setEmail(preCadastro.getEmail().trim().toLowerCase());
        }
        if (StringUtils.isNotBlank(preCadastro.getCpf())) {
            preCadastro.setCpf(preCadastro.getCpf().replaceAll("\\D", ""));
        }
        if (StringUtils.isNotBlank(preCadastro.getLogin())) {
            preCadastro.setLogin(preCadastro.getLogin().trim());
        }

        // Se já existe usuário (já aprovado em algum momento), não faz sentido criar pré-cadastro de novo.
        if (preCadastro.getLogin() != null && userRepository.findOneByLogin(preCadastro.getLogin()).isPresent()) {
            throw new BadRequestAlertException("Você já possui acesso. Faça login.", ENTITY_NAME, "userexists");
        }
        if (preCadastro.getEmail() != null && userRepository.findOneByEmailIgnoreCase(preCadastro.getEmail()).isPresent()) {
            throw new BadRequestAlertException("Você já possui acesso. Faça login.", ENTITY_NAME, "userexists");
        }

        // Se já existe pré-cadastro, decide conforme status (permite reenviar se foi REJEITADO).
        Optional<PreCadastro> existente = Optional.empty();
        if (preCadastro.getLogin() != null) {
            existente = preCadastroRepository.findOneByLogin(preCadastro.getLogin());
        }
        if (existente.isEmpty() && preCadastro.getCpf() != null) {
            existente = preCadastroRepository.findOneByCpf(preCadastro.getCpf());
        }
        if (existente.isEmpty() && preCadastro.getEmail() != null) {
            existente = preCadastroRepository.findOneByEmailIgnoreCase(preCadastro.getEmail());
        }

        if (existente.isPresent()) {
            PreCadastro atual = preCadastroRepository.findByIdWithEndereco(existente.get().getId()).orElse(existente.get());
            if (atual.getStatus() == StatusCadastro.REJEITADO) {
                // Reenvio: atualiza o registro rejeitado e volta para PRIMEIROACESSO.
                atual.setNomeCompleto(preCadastro.getNomeCompleto());
                atual.setEmail(preCadastro.getEmail());
                atual.setTelefone(preCadastro.getTelefone());
                atual.setTelefoneSecundario(preCadastro.getTelefoneSecundario());
                atual.setTelefoneEmergencia(preCadastro.getTelefoneEmergencia());
                atual.setNomeContatoEmergencia(preCadastro.getNomeContatoEmergencia());
                atual.setCpf(preCadastro.getCpf());
                atual.setSexo(preCadastro.getSexo());
                atual.setDataNascimento(preCadastro.getDataNascimento());
                atual.setLogin(preCadastro.getLogin());
                atual.setSenha(preCadastro.getSenha());
                atual.setObservacoes(preCadastro.getObservacoes());
                atual.setAtualizadoEm(Instant.now());

                // Regra do negócio: todo pré-cadastro entra como MEMBRO; admin define o perfil na aprovação.
                atual.setPerfilSolicitado(PerfilAcesso.MEMBRO);
                atual.setPerfilAprovado(null);
                atual.setStatus(StatusCadastro.PRIMEIROACESSO);

                Endereco novoEnd = preCadastro.getEndereco();
                if (novoEnd != null) {
                    Endereco endAtual = atual.getEndereco();
                    if (endAtual == null) {
                        Endereco saved = enderecoRepository.save(novoEnd);
                        atual.setEndereco(saved);
                    } else {
                        endAtual.setLogradouro(novoEnd.getLogradouro());
                        endAtual.setNumero(novoEnd.getNumero());
                        endAtual.setComplemento(novoEnd.getComplemento());
                        endAtual.setBairro(novoEnd.getBairro());
                        endAtual.setCidade(novoEnd.getCidade());
                        endAtual.setEstado(novoEnd.getEstado());
                        endAtual.setCep(novoEnd.getCep());
                    }
                }

                PreCadastro salvo = preCadastroRepository.saveAndFlush(atual);
                return ResponseEntity.ok().body(salvo);
            }

            if (atual.getStatus() == StatusCadastro.APROVADO) {
                throw new BadRequestAlertException("Solicitação já aprovada. Faça login.", ENTITY_NAME, "alreadyapproved");
            }
            throw new BadRequestAlertException("Já existe uma solicitação em análise para estes dados.", ENTITY_NAME, "alreadyexists");
        }
        // Regra do negócio: todo pré-cadastro entra como MEMBRO; admin define o perfil na aprovação.
        preCadastro.setPerfilSolicitado(PerfilAcesso.MEMBRO);
        preCadastro.setPerfilAprovado(null);
        preCadastro.setStatus(StatusCadastro.PRIMEIROACESSO);
        if (preCadastro.getCriadoEm() == null) {
            preCadastro.setCriadoEm(Instant.now());
        }
        preCadastro = preCadastroRepository.saveAndFlush(preCadastro);
        return ResponseEntity.created(new URI("/api/pre-cadastros/" + preCadastro.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, preCadastro.getId().toString()))
            .body(preCadastro);
    }

    /**
     * {@code POST  /pre-cadastros/:id/aprovar} : Aprova um pré-cadastro e cria o usuário.
     */
    @PostMapping("/{id}/aprovar")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<PreCadastro> aprovarPreCadastro(
        @PathVariable Long id,
        @Valid @RequestBody AprovarPreCadastroVM body
    ) {
        LOG.debug("REST request to approve PreCadastro : {}", id);
        PerfilAcesso perfil = PerfilAcesso.valueOf(body.getPerfilAprovado());
        PreCadastro preCadastro = preCadastroService.aprovar(id, perfil, body.getModules());
        return ResponseEntity.ok().body(preCadastro);
    }

    /**
     * {@code PUT  /pre-cadastros/:id} : Updates an existing preCadastro.
     *
     * @param id the id of the preCadastro to save.
     * @param preCadastro the preCadastro to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated preCadastro,
     * or with status {@code 400 (Bad Request)} if the preCadastro is not valid,
     * or with status {@code 500 (Internal Server Error)} if the preCadastro couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<PreCadastro> updatePreCadastro(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody PreCadastro preCadastro
    ) throws URISyntaxException {
        LOG.debug("REST request to update PreCadastro : {}, {}", id, preCadastro);
        if (preCadastro.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, preCadastro.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!preCadastroRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        preCadastro = preCadastroRepository.save(preCadastro);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, preCadastro.getId().toString()))
            .body(preCadastro);
    }

    /**
     * {@code PATCH  /pre-cadastros/:id} : Partial updates given fields of an existing preCadastro, field will ignore if it is null
     *
     * @param id the id of the preCadastro to save.
     * @param preCadastro the preCadastro to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated preCadastro,
     * or with status {@code 400 (Bad Request)} if the preCadastro is not valid,
     * or with status {@code 404 (Not Found)} if the preCadastro is not found,
     * or with status {@code 500 (Internal Server Error)} if the preCadastro couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<PreCadastro> partialUpdatePreCadastro(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody PreCadastro preCadastro
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update PreCadastro partially : {}, {}", id, preCadastro);
        if (preCadastro.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, preCadastro.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!preCadastroRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<PreCadastro> result = preCadastroRepository
            .findById(preCadastro.getId())
            .map(existingPreCadastro -> {
                if (preCadastro.getNomeCompleto() != null) {
                    existingPreCadastro.setNomeCompleto(preCadastro.getNomeCompleto());
                }
                if (preCadastro.getEmail() != null) {
                    existingPreCadastro.setEmail(preCadastro.getEmail());
                }
                if (preCadastro.getTelefone() != null) {
                    existingPreCadastro.setTelefone(preCadastro.getTelefone());
                }
                if (preCadastro.getTelefoneSecundario() != null) {
                    existingPreCadastro.setTelefoneSecundario(preCadastro.getTelefoneSecundario());
                }
                if (preCadastro.getTelefoneEmergencia() != null) {
                    existingPreCadastro.setTelefoneEmergencia(preCadastro.getTelefoneEmergencia());
                }
                if (preCadastro.getNomeContatoEmergencia() != null) {
                    existingPreCadastro.setNomeContatoEmergencia(preCadastro.getNomeContatoEmergencia());
                }
                if (preCadastro.getCpf() != null) {
                    existingPreCadastro.setCpf(preCadastro.getCpf());
                }
                if (preCadastro.getSexo() != null) {
                    existingPreCadastro.setSexo(preCadastro.getSexo());
                }
                if (preCadastro.getDataNascimento() != null) {
                    existingPreCadastro.setDataNascimento(preCadastro.getDataNascimento());
                }
                if (preCadastro.getLogin() != null) {
                    existingPreCadastro.setLogin(preCadastro.getLogin());
                }
                if (preCadastro.getSenha() != null) {
                    existingPreCadastro.setSenha(preCadastro.getSenha());
                }
                if (preCadastro.getPerfilSolicitado() != null) {
                    existingPreCadastro.setPerfilSolicitado(preCadastro.getPerfilSolicitado());
                }
                if (preCadastro.getPerfilAprovado() != null) {
                    existingPreCadastro.setPerfilAprovado(preCadastro.getPerfilAprovado());
                }
                if (preCadastro.getStatus() != null) {
                    existingPreCadastro.setStatus(preCadastro.getStatus());
                }
                if (preCadastro.getObservacoes() != null) {
                    existingPreCadastro.setObservacoes(preCadastro.getObservacoes());
                }
                if (preCadastro.getCriadoEm() != null) {
                    existingPreCadastro.setCriadoEm(preCadastro.getCriadoEm());
                }
                if (preCadastro.getAtualizadoEm() != null) {
                    existingPreCadastro.setAtualizadoEm(preCadastro.getAtualizadoEm());
                }

                return existingPreCadastro;
            })
            .map(preCadastroRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, preCadastro.getId().toString())
        );
    }

    /**
     * {@code GET  /pre-cadastros/pendentes} : get preCadastros pending approval (PRIMEIROACESSO, PENDENTE).
     */
    @GetMapping("/pendentes")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<List<PreCadastro>> getPreCadastrosPendentes() {
        LOG.debug("REST request to get pending PreCadastros");
        List<PreCadastro> list = preCadastroRepository.findByStatusIn(
            List.of(StatusCadastro.PRIMEIROACESSO, StatusCadastro.PENDENTE)
        );
        return ResponseEntity.ok().body(list);
    }

    /**
     * {@code GET  /pre-cadastros} : get all the preCadastros.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of preCadastros in body.
     */
    @GetMapping("")
    public ResponseEntity<List<PreCadastro>> getAllPreCadastros(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of PreCadastros");
        Page<PreCadastro> page = preCadastroRepository.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /pre-cadastros/:id} : get the "id" preCadastro.
     *
     * @param id the id of the preCadastro to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the preCadastro, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id:\\d+}")
    public ResponseEntity<PreCadastro> getPreCadastro(@PathVariable("id") Long id) {
        LOG.debug("REST request to get PreCadastro : {}", id);
        Optional<PreCadastro> preCadastro = preCadastroRepository.findByIdWithEndereco(id);
        return ResponseUtil.wrapOrNotFound(preCadastro);
    }

    /**
     * {@code DELETE  /pre-cadastros/:id} : delete the "id" preCadastro.
     *
     * @param id the id of the preCadastro to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<Void> deletePreCadastro(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete PreCadastro : {}", id);
        preCadastroRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
