package br.com.semear.web.rest;

import static br.com.semear.domain.PreCadastroAsserts.*;
import static br.com.semear.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import br.com.semear.IntegrationTest;
import br.com.semear.domain.PreCadastro;
import br.com.semear.domain.enumeration.PerfilAcesso;
import br.com.semear.domain.enumeration.PerfilAcesso;
import br.com.semear.domain.enumeration.Sexo;
import br.com.semear.domain.enumeration.StatusCadastro;
import br.com.semear.repository.PreCadastroRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link PreCadastroResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class PreCadastroResourceIT {

    private static final String DEFAULT_NOME_COMPLETO = "AAAAAAAAAA";
    private static final String UPDATED_NOME_COMPLETO = "BBBBBBBBBB";

    private static final String DEFAULT_EMAIL = "AAAAAAAAAA";
    private static final String UPDATED_EMAIL = "BBBBBBBBBB";

    private static final String DEFAULT_TELEFONE = "AAAAAAAAAA";
    private static final String UPDATED_TELEFONE = "BBBBBBBBBB";

    private static final String DEFAULT_TELEFONE_SECUNDARIO = "AAAAAAAAAA";
    private static final String UPDATED_TELEFONE_SECUNDARIO = "BBBBBBBBBB";

    private static final String DEFAULT_TELEFONE_EMERGENCIA = "AAAAAAAAAA";
    private static final String UPDATED_TELEFONE_EMERGENCIA = "BBBBBBBBBB";

    private static final String DEFAULT_NOME_CONTATO_EMERGENCIA = "AAAAAAAAAA";
    private static final String UPDATED_NOME_CONTATO_EMERGENCIA = "BBBBBBBBBB";

    private static final String DEFAULT_CPF = "AAAAAAAAAA";
    private static final String UPDATED_CPF = "BBBBBBBBBB";

    private static final Sexo DEFAULT_SEXO = Sexo.MASCULINO;
    private static final Sexo UPDATED_SEXO = Sexo.FEMININO;

    private static final LocalDate DEFAULT_DATA_NASCIMENTO = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_DATA_NASCIMENTO = LocalDate.now(ZoneId.systemDefault());

    private static final String DEFAULT_LOGIN = "AAAAAAAAAA";
    private static final String UPDATED_LOGIN = "BBBBBBBBBB";

    private static final String DEFAULT_SENHA = "AAAAAAAAAA";
    private static final String UPDATED_SENHA = "BBBBBBBBBB";

    private static final PerfilAcesso DEFAULT_PERFIL_SOLICITADO = PerfilAcesso.ADMIN;
    private static final PerfilAcesso UPDATED_PERFIL_SOLICITADO = PerfilAcesso.PASTOR;

    private static final PerfilAcesso DEFAULT_PERFIL_APROVADO = PerfilAcesso.ADMIN;
    private static final PerfilAcesso UPDATED_PERFIL_APROVADO = PerfilAcesso.PASTOR;

    private static final StatusCadastro DEFAULT_STATUS = StatusCadastro.PRIMEIROACESSO;
    private static final StatusCadastro UPDATED_STATUS = StatusCadastro.PENDENTE;

    private static final String DEFAULT_OBSERVACOES = "AAAAAAAAAA";
    private static final String UPDATED_OBSERVACOES = "BBBBBBBBBB";

    private static final Instant DEFAULT_CRIADO_EM = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CRIADO_EM = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Instant DEFAULT_ATUALIZADO_EM = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_ATUALIZADO_EM = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/pre-cadastros";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private PreCadastroRepository preCadastroRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restPreCadastroMockMvc;

    private PreCadastro preCadastro;

    private PreCadastro insertedPreCadastro;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static PreCadastro createEntity() {
        return new PreCadastro()
            .nomeCompleto(DEFAULT_NOME_COMPLETO)
            .email(DEFAULT_EMAIL)
            .telefone(DEFAULT_TELEFONE)
            .telefoneSecundario(DEFAULT_TELEFONE_SECUNDARIO)
            .telefoneEmergencia(DEFAULT_TELEFONE_EMERGENCIA)
            .nomeContatoEmergencia(DEFAULT_NOME_CONTATO_EMERGENCIA)
            .cpf(DEFAULT_CPF)
            .sexo(DEFAULT_SEXO)
            .dataNascimento(DEFAULT_DATA_NASCIMENTO)
            .login(DEFAULT_LOGIN)
            .senha(DEFAULT_SENHA)
            .perfilSolicitado(DEFAULT_PERFIL_SOLICITADO)
            .perfilAprovado(DEFAULT_PERFIL_APROVADO)
            .status(DEFAULT_STATUS)
            .observacoes(DEFAULT_OBSERVACOES)
            .criadoEm(DEFAULT_CRIADO_EM)
            .atualizadoEm(DEFAULT_ATUALIZADO_EM);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static PreCadastro createUpdatedEntity() {
        return new PreCadastro()
            .nomeCompleto(UPDATED_NOME_COMPLETO)
            .email(UPDATED_EMAIL)
            .telefone(UPDATED_TELEFONE)
            .telefoneSecundario(UPDATED_TELEFONE_SECUNDARIO)
            .telefoneEmergencia(UPDATED_TELEFONE_EMERGENCIA)
            .nomeContatoEmergencia(UPDATED_NOME_CONTATO_EMERGENCIA)
            .cpf(UPDATED_CPF)
            .sexo(UPDATED_SEXO)
            .dataNascimento(UPDATED_DATA_NASCIMENTO)
            .login(UPDATED_LOGIN)
            .senha(UPDATED_SENHA)
            .perfilSolicitado(UPDATED_PERFIL_SOLICITADO)
            .perfilAprovado(UPDATED_PERFIL_APROVADO)
            .status(UPDATED_STATUS)
            .observacoes(UPDATED_OBSERVACOES)
            .criadoEm(UPDATED_CRIADO_EM)
            .atualizadoEm(UPDATED_ATUALIZADO_EM);
    }

    @BeforeEach
    void initTest() {
        preCadastro = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedPreCadastro != null) {
            preCadastroRepository.delete(insertedPreCadastro);
            insertedPreCadastro = null;
        }
    }

    @Test
    @Transactional
    void createPreCadastro() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the PreCadastro
        var returnedPreCadastro = om.readValue(
            restPreCadastroMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(preCadastro)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            PreCadastro.class
        );

        // Validate the PreCadastro in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertPreCadastroUpdatableFieldsEquals(returnedPreCadastro, getPersistedPreCadastro(returnedPreCadastro));

        insertedPreCadastro = returnedPreCadastro;
    }

    @Test
    @Transactional
    void createPreCadastroWithExistingId() throws Exception {
        // Create the PreCadastro with an existing ID
        preCadastro.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restPreCadastroMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(preCadastro)))
            .andExpect(status().isBadRequest());

        // Validate the PreCadastro in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNomeCompletoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        preCadastro.setNomeCompleto(null);

        // Create the PreCadastro, which fails.

        restPreCadastroMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(preCadastro)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkEmailIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        preCadastro.setEmail(null);

        // Create the PreCadastro, which fails.

        restPreCadastroMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(preCadastro)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTelefoneIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        preCadastro.setTelefone(null);

        // Create the PreCadastro, which fails.

        restPreCadastroMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(preCadastro)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTelefoneSecundarioIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        preCadastro.setTelefoneSecundario(null);

        // Create the PreCadastro, which fails.

        restPreCadastroMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(preCadastro)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTelefoneEmergenciaIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        preCadastro.setTelefoneEmergencia(null);

        // Create the PreCadastro, which fails.

        restPreCadastroMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(preCadastro)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkNomeContatoEmergenciaIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        preCadastro.setNomeContatoEmergencia(null);

        // Create the PreCadastro, which fails.

        restPreCadastroMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(preCadastro)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCpfIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        preCadastro.setCpf(null);

        // Create the PreCadastro, which fails.

        restPreCadastroMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(preCadastro)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkSexoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        preCadastro.setSexo(null);

        // Create the PreCadastro, which fails.

        restPreCadastroMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(preCadastro)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkDataNascimentoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        preCadastro.setDataNascimento(null);

        // Create the PreCadastro, which fails.

        restPreCadastroMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(preCadastro)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkLoginIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        preCadastro.setLogin(null);

        // Create the PreCadastro, which fails.

        restPreCadastroMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(preCadastro)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkSenhaIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        preCadastro.setSenha(null);

        // Create the PreCadastro, which fails.

        restPreCadastroMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(preCadastro)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkPerfilSolicitadoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        preCadastro.setPerfilSolicitado(null);

        // Create the PreCadastro, which fails.

        restPreCadastroMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(preCadastro)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStatusIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        preCadastro.setStatus(null);

        // Create the PreCadastro, which fails.

        restPreCadastroMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(preCadastro)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCriadoEmIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        preCadastro.setCriadoEm(null);

        // Create the PreCadastro, which fails.

        restPreCadastroMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(preCadastro)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllPreCadastros() throws Exception {
        // Initialize the database
        insertedPreCadastro = preCadastroRepository.saveAndFlush(preCadastro);

        // Get all the preCadastroList
        restPreCadastroMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(preCadastro.getId().intValue())))
            .andExpect(jsonPath("$.[*].nomeCompleto").value(hasItem(DEFAULT_NOME_COMPLETO)))
            .andExpect(jsonPath("$.[*].email").value(hasItem(DEFAULT_EMAIL)))
            .andExpect(jsonPath("$.[*].telefone").value(hasItem(DEFAULT_TELEFONE)))
            .andExpect(jsonPath("$.[*].telefoneSecundario").value(hasItem(DEFAULT_TELEFONE_SECUNDARIO)))
            .andExpect(jsonPath("$.[*].telefoneEmergencia").value(hasItem(DEFAULT_TELEFONE_EMERGENCIA)))
            .andExpect(jsonPath("$.[*].nomeContatoEmergencia").value(hasItem(DEFAULT_NOME_CONTATO_EMERGENCIA)))
            .andExpect(jsonPath("$.[*].cpf").value(hasItem(DEFAULT_CPF)))
            .andExpect(jsonPath("$.[*].sexo").value(hasItem(DEFAULT_SEXO.toString())))
            .andExpect(jsonPath("$.[*].dataNascimento").value(hasItem(DEFAULT_DATA_NASCIMENTO.toString())))
            .andExpect(jsonPath("$.[*].login").value(hasItem(DEFAULT_LOGIN)))
            .andExpect(jsonPath("$.[*].senha").value(hasItem(DEFAULT_SENHA)))
            .andExpect(jsonPath("$.[*].perfilSolicitado").value(hasItem(DEFAULT_PERFIL_SOLICITADO.toString())))
            .andExpect(jsonPath("$.[*].perfilAprovado").value(hasItem(DEFAULT_PERFIL_APROVADO.toString())))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())))
            .andExpect(jsonPath("$.[*].observacoes").value(hasItem(DEFAULT_OBSERVACOES)))
            .andExpect(jsonPath("$.[*].criadoEm").value(hasItem(DEFAULT_CRIADO_EM.toString())))
            .andExpect(jsonPath("$.[*].atualizadoEm").value(hasItem(DEFAULT_ATUALIZADO_EM.toString())));
    }

    @Test
    @Transactional
    void getPreCadastro() throws Exception {
        // Initialize the database
        insertedPreCadastro = preCadastroRepository.saveAndFlush(preCadastro);

        // Get the preCadastro
        restPreCadastroMockMvc
            .perform(get(ENTITY_API_URL_ID, preCadastro.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(preCadastro.getId().intValue()))
            .andExpect(jsonPath("$.nomeCompleto").value(DEFAULT_NOME_COMPLETO))
            .andExpect(jsonPath("$.email").value(DEFAULT_EMAIL))
            .andExpect(jsonPath("$.telefone").value(DEFAULT_TELEFONE))
            .andExpect(jsonPath("$.telefoneSecundario").value(DEFAULT_TELEFONE_SECUNDARIO))
            .andExpect(jsonPath("$.telefoneEmergencia").value(DEFAULT_TELEFONE_EMERGENCIA))
            .andExpect(jsonPath("$.nomeContatoEmergencia").value(DEFAULT_NOME_CONTATO_EMERGENCIA))
            .andExpect(jsonPath("$.cpf").value(DEFAULT_CPF))
            .andExpect(jsonPath("$.sexo").value(DEFAULT_SEXO.toString()))
            .andExpect(jsonPath("$.dataNascimento").value(DEFAULT_DATA_NASCIMENTO.toString()))
            .andExpect(jsonPath("$.login").value(DEFAULT_LOGIN))
            .andExpect(jsonPath("$.senha").value(DEFAULT_SENHA))
            .andExpect(jsonPath("$.perfilSolicitado").value(DEFAULT_PERFIL_SOLICITADO.toString()))
            .andExpect(jsonPath("$.perfilAprovado").value(DEFAULT_PERFIL_APROVADO.toString()))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS.toString()))
            .andExpect(jsonPath("$.observacoes").value(DEFAULT_OBSERVACOES))
            .andExpect(jsonPath("$.criadoEm").value(DEFAULT_CRIADO_EM.toString()))
            .andExpect(jsonPath("$.atualizadoEm").value(DEFAULT_ATUALIZADO_EM.toString()));
    }

    @Test
    @Transactional
    void getNonExistingPreCadastro() throws Exception {
        // Get the preCadastro
        restPreCadastroMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingPreCadastro() throws Exception {
        // Initialize the database
        insertedPreCadastro = preCadastroRepository.saveAndFlush(preCadastro);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the preCadastro
        PreCadastro updatedPreCadastro = preCadastroRepository.findById(preCadastro.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedPreCadastro are not directly saved in db
        em.detach(updatedPreCadastro);
        updatedPreCadastro
            .nomeCompleto(UPDATED_NOME_COMPLETO)
            .email(UPDATED_EMAIL)
            .telefone(UPDATED_TELEFONE)
            .telefoneSecundario(UPDATED_TELEFONE_SECUNDARIO)
            .telefoneEmergencia(UPDATED_TELEFONE_EMERGENCIA)
            .nomeContatoEmergencia(UPDATED_NOME_CONTATO_EMERGENCIA)
            .cpf(UPDATED_CPF)
            .sexo(UPDATED_SEXO)
            .dataNascimento(UPDATED_DATA_NASCIMENTO)
            .login(UPDATED_LOGIN)
            .senha(UPDATED_SENHA)
            .perfilSolicitado(UPDATED_PERFIL_SOLICITADO)
            .perfilAprovado(UPDATED_PERFIL_APROVADO)
            .status(UPDATED_STATUS)
            .observacoes(UPDATED_OBSERVACOES)
            .criadoEm(UPDATED_CRIADO_EM)
            .atualizadoEm(UPDATED_ATUALIZADO_EM);

        restPreCadastroMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedPreCadastro.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedPreCadastro))
            )
            .andExpect(status().isOk());

        // Validate the PreCadastro in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedPreCadastroToMatchAllProperties(updatedPreCadastro);
    }

    @Test
    @Transactional
    void putNonExistingPreCadastro() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        preCadastro.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPreCadastroMockMvc
            .perform(
                put(ENTITY_API_URL_ID, preCadastro.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(preCadastro))
            )
            .andExpect(status().isBadRequest());

        // Validate the PreCadastro in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchPreCadastro() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        preCadastro.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPreCadastroMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(preCadastro))
            )
            .andExpect(status().isBadRequest());

        // Validate the PreCadastro in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamPreCadastro() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        preCadastro.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPreCadastroMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(preCadastro)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the PreCadastro in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdatePreCadastroWithPatch() throws Exception {
        // Initialize the database
        insertedPreCadastro = preCadastroRepository.saveAndFlush(preCadastro);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the preCadastro using partial update
        PreCadastro partialUpdatedPreCadastro = new PreCadastro();
        partialUpdatedPreCadastro.setId(preCadastro.getId());

        partialUpdatedPreCadastro
            .nomeCompleto(UPDATED_NOME_COMPLETO)
            .telefoneSecundario(UPDATED_TELEFONE_SECUNDARIO)
            .telefoneEmergencia(UPDATED_TELEFONE_EMERGENCIA)
            .nomeContatoEmergencia(UPDATED_NOME_CONTATO_EMERGENCIA)
            .cpf(UPDATED_CPF)
            .login(UPDATED_LOGIN)
            .status(UPDATED_STATUS)
            .observacoes(UPDATED_OBSERVACOES);

        restPreCadastroMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPreCadastro.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPreCadastro))
            )
            .andExpect(status().isOk());

        // Validate the PreCadastro in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPreCadastroUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedPreCadastro, preCadastro),
            getPersistedPreCadastro(preCadastro)
        );
    }

    @Test
    @Transactional
    void fullUpdatePreCadastroWithPatch() throws Exception {
        // Initialize the database
        insertedPreCadastro = preCadastroRepository.saveAndFlush(preCadastro);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the preCadastro using partial update
        PreCadastro partialUpdatedPreCadastro = new PreCadastro();
        partialUpdatedPreCadastro.setId(preCadastro.getId());

        partialUpdatedPreCadastro
            .nomeCompleto(UPDATED_NOME_COMPLETO)
            .email(UPDATED_EMAIL)
            .telefone(UPDATED_TELEFONE)
            .telefoneSecundario(UPDATED_TELEFONE_SECUNDARIO)
            .telefoneEmergencia(UPDATED_TELEFONE_EMERGENCIA)
            .nomeContatoEmergencia(UPDATED_NOME_CONTATO_EMERGENCIA)
            .cpf(UPDATED_CPF)
            .sexo(UPDATED_SEXO)
            .dataNascimento(UPDATED_DATA_NASCIMENTO)
            .login(UPDATED_LOGIN)
            .senha(UPDATED_SENHA)
            .perfilSolicitado(UPDATED_PERFIL_SOLICITADO)
            .perfilAprovado(UPDATED_PERFIL_APROVADO)
            .status(UPDATED_STATUS)
            .observacoes(UPDATED_OBSERVACOES)
            .criadoEm(UPDATED_CRIADO_EM)
            .atualizadoEm(UPDATED_ATUALIZADO_EM);

        restPreCadastroMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPreCadastro.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPreCadastro))
            )
            .andExpect(status().isOk());

        // Validate the PreCadastro in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPreCadastroUpdatableFieldsEquals(partialUpdatedPreCadastro, getPersistedPreCadastro(partialUpdatedPreCadastro));
    }

    @Test
    @Transactional
    void patchNonExistingPreCadastro() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        preCadastro.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPreCadastroMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, preCadastro.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(preCadastro))
            )
            .andExpect(status().isBadRequest());

        // Validate the PreCadastro in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchPreCadastro() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        preCadastro.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPreCadastroMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(preCadastro))
            )
            .andExpect(status().isBadRequest());

        // Validate the PreCadastro in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamPreCadastro() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        preCadastro.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPreCadastroMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(preCadastro)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the PreCadastro in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deletePreCadastro() throws Exception {
        // Initialize the database
        insertedPreCadastro = preCadastroRepository.saveAndFlush(preCadastro);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the preCadastro
        restPreCadastroMockMvc
            .perform(delete(ENTITY_API_URL_ID, preCadastro.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return preCadastroRepository.count();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected PreCadastro getPersistedPreCadastro(PreCadastro preCadastro) {
        return preCadastroRepository.findById(preCadastro.getId()).orElseThrow();
    }

    protected void assertPersistedPreCadastroToMatchAllProperties(PreCadastro expectedPreCadastro) {
        assertPreCadastroAllPropertiesEquals(expectedPreCadastro, getPersistedPreCadastro(expectedPreCadastro));
    }

    protected void assertPersistedPreCadastroToMatchUpdatableProperties(PreCadastro expectedPreCadastro) {
        assertPreCadastroAllUpdatablePropertiesEquals(expectedPreCadastro, getPersistedPreCadastro(expectedPreCadastro));
    }
}
