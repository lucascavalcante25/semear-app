package br.com.semear.web.rest;

import static br.com.semear.domain.DestaqueBibliaAsserts.*;
import static br.com.semear.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import br.com.semear.IntegrationTest;
import br.com.semear.domain.DestaqueBiblia;
import br.com.semear.domain.enumeration.CorDestaque;
import br.com.semear.domain.enumeration.VersaoBiblia;
import br.com.semear.repository.DestaqueBibliaRepository;
import br.com.semear.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link DestaqueBibliaResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class DestaqueBibliaResourceIT {

    private static final String DEFAULT_CHAVE_REFERENCIA = "AAAAAAAAAA";
    private static final String UPDATED_CHAVE_REFERENCIA = "BBBBBBBBBB";

    private static final String DEFAULT_LIVRO_ID = "AAAAAAAAAA";
    private static final String UPDATED_LIVRO_ID = "BBBBBBBBBB";

    private static final String DEFAULT_LIVRO_NOME = "AAAAAAAAAA";
    private static final String UPDATED_LIVRO_NOME = "BBBBBBBBBB";

    private static final Integer DEFAULT_CAPITULO = 1;
    private static final Integer UPDATED_CAPITULO = 2;

    private static final Integer DEFAULT_VERSICULO_INICIO = 1;
    private static final Integer UPDATED_VERSICULO_INICIO = 2;

    private static final Integer DEFAULT_VERSICULO_FIM = 1;
    private static final Integer UPDATED_VERSICULO_FIM = 2;

    private static final VersaoBiblia DEFAULT_VERSAO = VersaoBiblia.ALMEIDA;
    private static final VersaoBiblia UPDATED_VERSAO = VersaoBiblia.KJV;

    private static final CorDestaque DEFAULT_COR = CorDestaque.AMARELO;
    private static final CorDestaque UPDATED_COR = CorDestaque.VERDE;

    private static final Instant DEFAULT_CRIADO_EM = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CRIADO_EM = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Instant DEFAULT_ATUALIZADO_EM = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_ATUALIZADO_EM = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/destaque-biblias";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private DestaqueBibliaRepository destaqueBibliaRepository;

    @Autowired
    private UserRepository userRepository;

    @Mock
    private DestaqueBibliaRepository destaqueBibliaRepositoryMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restDestaqueBibliaMockMvc;

    private DestaqueBiblia destaqueBiblia;

    private DestaqueBiblia insertedDestaqueBiblia;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static DestaqueBiblia createEntity() {
        return new DestaqueBiblia()
            .chaveReferencia(DEFAULT_CHAVE_REFERENCIA)
            .livroId(DEFAULT_LIVRO_ID)
            .livroNome(DEFAULT_LIVRO_NOME)
            .capitulo(DEFAULT_CAPITULO)
            .versiculoInicio(DEFAULT_VERSICULO_INICIO)
            .versiculoFim(DEFAULT_VERSICULO_FIM)
            .versao(DEFAULT_VERSAO)
            .cor(DEFAULT_COR)
            .criadoEm(DEFAULT_CRIADO_EM)
            .atualizadoEm(DEFAULT_ATUALIZADO_EM);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static DestaqueBiblia createUpdatedEntity() {
        return new DestaqueBiblia()
            .chaveReferencia(UPDATED_CHAVE_REFERENCIA)
            .livroId(UPDATED_LIVRO_ID)
            .livroNome(UPDATED_LIVRO_NOME)
            .capitulo(UPDATED_CAPITULO)
            .versiculoInicio(UPDATED_VERSICULO_INICIO)
            .versiculoFim(UPDATED_VERSICULO_FIM)
            .versao(UPDATED_VERSAO)
            .cor(UPDATED_COR)
            .criadoEm(UPDATED_CRIADO_EM)
            .atualizadoEm(UPDATED_ATUALIZADO_EM);
    }

    @BeforeEach
    void initTest() {
        destaqueBiblia = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedDestaqueBiblia != null) {
            destaqueBibliaRepository.delete(insertedDestaqueBiblia);
            insertedDestaqueBiblia = null;
        }
    }

    @Test
    @Transactional
    void createDestaqueBiblia() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the DestaqueBiblia
        var returnedDestaqueBiblia = om.readValue(
            restDestaqueBibliaMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(destaqueBiblia)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            DestaqueBiblia.class
        );

        // Validate the DestaqueBiblia in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertDestaqueBibliaUpdatableFieldsEquals(returnedDestaqueBiblia, getPersistedDestaqueBiblia(returnedDestaqueBiblia));

        insertedDestaqueBiblia = returnedDestaqueBiblia;
    }

    @Test
    @Transactional
    void createDestaqueBibliaWithExistingId() throws Exception {
        // Create the DestaqueBiblia with an existing ID
        destaqueBiblia.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restDestaqueBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(destaqueBiblia)))
            .andExpect(status().isBadRequest());

        // Validate the DestaqueBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkChaveReferenciaIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        destaqueBiblia.setChaveReferencia(null);

        // Create the DestaqueBiblia, which fails.

        restDestaqueBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(destaqueBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkLivroIdIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        destaqueBiblia.setLivroId(null);

        // Create the DestaqueBiblia, which fails.

        restDestaqueBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(destaqueBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkLivroNomeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        destaqueBiblia.setLivroNome(null);

        // Create the DestaqueBiblia, which fails.

        restDestaqueBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(destaqueBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCapituloIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        destaqueBiblia.setCapitulo(null);

        // Create the DestaqueBiblia, which fails.

        restDestaqueBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(destaqueBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkVersiculoInicioIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        destaqueBiblia.setVersiculoInicio(null);

        // Create the DestaqueBiblia, which fails.

        restDestaqueBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(destaqueBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkVersiculoFimIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        destaqueBiblia.setVersiculoFim(null);

        // Create the DestaqueBiblia, which fails.

        restDestaqueBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(destaqueBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkVersaoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        destaqueBiblia.setVersao(null);

        // Create the DestaqueBiblia, which fails.

        restDestaqueBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(destaqueBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCorIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        destaqueBiblia.setCor(null);

        // Create the DestaqueBiblia, which fails.

        restDestaqueBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(destaqueBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCriadoEmIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        destaqueBiblia.setCriadoEm(null);

        // Create the DestaqueBiblia, which fails.

        restDestaqueBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(destaqueBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkAtualizadoEmIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        destaqueBiblia.setAtualizadoEm(null);

        // Create the DestaqueBiblia, which fails.

        restDestaqueBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(destaqueBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllDestaqueBiblias() throws Exception {
        // Initialize the database
        insertedDestaqueBiblia = destaqueBibliaRepository.saveAndFlush(destaqueBiblia);

        // Get all the destaqueBibliaList
        restDestaqueBibliaMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(destaqueBiblia.getId().intValue())))
            .andExpect(jsonPath("$.[*].chaveReferencia").value(hasItem(DEFAULT_CHAVE_REFERENCIA)))
            .andExpect(jsonPath("$.[*].livroId").value(hasItem(DEFAULT_LIVRO_ID)))
            .andExpect(jsonPath("$.[*].livroNome").value(hasItem(DEFAULT_LIVRO_NOME)))
            .andExpect(jsonPath("$.[*].capitulo").value(hasItem(DEFAULT_CAPITULO)))
            .andExpect(jsonPath("$.[*].versiculoInicio").value(hasItem(DEFAULT_VERSICULO_INICIO)))
            .andExpect(jsonPath("$.[*].versiculoFim").value(hasItem(DEFAULT_VERSICULO_FIM)))
            .andExpect(jsonPath("$.[*].versao").value(hasItem(DEFAULT_VERSAO.toString())))
            .andExpect(jsonPath("$.[*].cor").value(hasItem(DEFAULT_COR.toString())))
            .andExpect(jsonPath("$.[*].criadoEm").value(hasItem(DEFAULT_CRIADO_EM.toString())))
            .andExpect(jsonPath("$.[*].atualizadoEm").value(hasItem(DEFAULT_ATUALIZADO_EM.toString())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllDestaqueBibliasWithEagerRelationshipsIsEnabled() throws Exception {
        when(destaqueBibliaRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restDestaqueBibliaMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(destaqueBibliaRepositoryMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllDestaqueBibliasWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(destaqueBibliaRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restDestaqueBibliaMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(destaqueBibliaRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getDestaqueBiblia() throws Exception {
        // Initialize the database
        insertedDestaqueBiblia = destaqueBibliaRepository.saveAndFlush(destaqueBiblia);

        // Get the destaqueBiblia
        restDestaqueBibliaMockMvc
            .perform(get(ENTITY_API_URL_ID, destaqueBiblia.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(destaqueBiblia.getId().intValue()))
            .andExpect(jsonPath("$.chaveReferencia").value(DEFAULT_CHAVE_REFERENCIA))
            .andExpect(jsonPath("$.livroId").value(DEFAULT_LIVRO_ID))
            .andExpect(jsonPath("$.livroNome").value(DEFAULT_LIVRO_NOME))
            .andExpect(jsonPath("$.capitulo").value(DEFAULT_CAPITULO))
            .andExpect(jsonPath("$.versiculoInicio").value(DEFAULT_VERSICULO_INICIO))
            .andExpect(jsonPath("$.versiculoFim").value(DEFAULT_VERSICULO_FIM))
            .andExpect(jsonPath("$.versao").value(DEFAULT_VERSAO.toString()))
            .andExpect(jsonPath("$.cor").value(DEFAULT_COR.toString()))
            .andExpect(jsonPath("$.criadoEm").value(DEFAULT_CRIADO_EM.toString()))
            .andExpect(jsonPath("$.atualizadoEm").value(DEFAULT_ATUALIZADO_EM.toString()));
    }

    @Test
    @Transactional
    void getNonExistingDestaqueBiblia() throws Exception {
        // Get the destaqueBiblia
        restDestaqueBibliaMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingDestaqueBiblia() throws Exception {
        // Initialize the database
        insertedDestaqueBiblia = destaqueBibliaRepository.saveAndFlush(destaqueBiblia);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the destaqueBiblia
        DestaqueBiblia updatedDestaqueBiblia = destaqueBibliaRepository.findById(destaqueBiblia.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedDestaqueBiblia are not directly saved in db
        em.detach(updatedDestaqueBiblia);
        updatedDestaqueBiblia
            .chaveReferencia(UPDATED_CHAVE_REFERENCIA)
            .livroId(UPDATED_LIVRO_ID)
            .livroNome(UPDATED_LIVRO_NOME)
            .capitulo(UPDATED_CAPITULO)
            .versiculoInicio(UPDATED_VERSICULO_INICIO)
            .versiculoFim(UPDATED_VERSICULO_FIM)
            .versao(UPDATED_VERSAO)
            .cor(UPDATED_COR)
            .criadoEm(UPDATED_CRIADO_EM)
            .atualizadoEm(UPDATED_ATUALIZADO_EM);

        restDestaqueBibliaMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedDestaqueBiblia.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedDestaqueBiblia))
            )
            .andExpect(status().isOk());

        // Validate the DestaqueBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedDestaqueBibliaToMatchAllProperties(updatedDestaqueBiblia);
    }

    @Test
    @Transactional
    void putNonExistingDestaqueBiblia() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        destaqueBiblia.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDestaqueBibliaMockMvc
            .perform(
                put(ENTITY_API_URL_ID, destaqueBiblia.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(destaqueBiblia))
            )
            .andExpect(status().isBadRequest());

        // Validate the DestaqueBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchDestaqueBiblia() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        destaqueBiblia.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDestaqueBibliaMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(destaqueBiblia))
            )
            .andExpect(status().isBadRequest());

        // Validate the DestaqueBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamDestaqueBiblia() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        destaqueBiblia.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDestaqueBibliaMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(destaqueBiblia)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the DestaqueBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateDestaqueBibliaWithPatch() throws Exception {
        // Initialize the database
        insertedDestaqueBiblia = destaqueBibliaRepository.saveAndFlush(destaqueBiblia);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the destaqueBiblia using partial update
        DestaqueBiblia partialUpdatedDestaqueBiblia = new DestaqueBiblia();
        partialUpdatedDestaqueBiblia.setId(destaqueBiblia.getId());

        partialUpdatedDestaqueBiblia
            .chaveReferencia(UPDATED_CHAVE_REFERENCIA)
            .livroId(UPDATED_LIVRO_ID)
            .livroNome(UPDATED_LIVRO_NOME)
            .capitulo(UPDATED_CAPITULO)
            .versiculoFim(UPDATED_VERSICULO_FIM)
            .versao(UPDATED_VERSAO)
            .cor(UPDATED_COR)
            .atualizadoEm(UPDATED_ATUALIZADO_EM);

        restDestaqueBibliaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDestaqueBiblia.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedDestaqueBiblia))
            )
            .andExpect(status().isOk());

        // Validate the DestaqueBiblia in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertDestaqueBibliaUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedDestaqueBiblia, destaqueBiblia),
            getPersistedDestaqueBiblia(destaqueBiblia)
        );
    }

    @Test
    @Transactional
    void fullUpdateDestaqueBibliaWithPatch() throws Exception {
        // Initialize the database
        insertedDestaqueBiblia = destaqueBibliaRepository.saveAndFlush(destaqueBiblia);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the destaqueBiblia using partial update
        DestaqueBiblia partialUpdatedDestaqueBiblia = new DestaqueBiblia();
        partialUpdatedDestaqueBiblia.setId(destaqueBiblia.getId());

        partialUpdatedDestaqueBiblia
            .chaveReferencia(UPDATED_CHAVE_REFERENCIA)
            .livroId(UPDATED_LIVRO_ID)
            .livroNome(UPDATED_LIVRO_NOME)
            .capitulo(UPDATED_CAPITULO)
            .versiculoInicio(UPDATED_VERSICULO_INICIO)
            .versiculoFim(UPDATED_VERSICULO_FIM)
            .versao(UPDATED_VERSAO)
            .cor(UPDATED_COR)
            .criadoEm(UPDATED_CRIADO_EM)
            .atualizadoEm(UPDATED_ATUALIZADO_EM);

        restDestaqueBibliaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDestaqueBiblia.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedDestaqueBiblia))
            )
            .andExpect(status().isOk());

        // Validate the DestaqueBiblia in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertDestaqueBibliaUpdatableFieldsEquals(partialUpdatedDestaqueBiblia, getPersistedDestaqueBiblia(partialUpdatedDestaqueBiblia));
    }

    @Test
    @Transactional
    void patchNonExistingDestaqueBiblia() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        destaqueBiblia.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDestaqueBibliaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, destaqueBiblia.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(destaqueBiblia))
            )
            .andExpect(status().isBadRequest());

        // Validate the DestaqueBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchDestaqueBiblia() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        destaqueBiblia.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDestaqueBibliaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(destaqueBiblia))
            )
            .andExpect(status().isBadRequest());

        // Validate the DestaqueBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamDestaqueBiblia() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        destaqueBiblia.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDestaqueBibliaMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(destaqueBiblia)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the DestaqueBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteDestaqueBiblia() throws Exception {
        // Initialize the database
        insertedDestaqueBiblia = destaqueBibliaRepository.saveAndFlush(destaqueBiblia);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the destaqueBiblia
        restDestaqueBibliaMockMvc
            .perform(delete(ENTITY_API_URL_ID, destaqueBiblia.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return destaqueBibliaRepository.count();
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

    protected DestaqueBiblia getPersistedDestaqueBiblia(DestaqueBiblia destaqueBiblia) {
        return destaqueBibliaRepository.findById(destaqueBiblia.getId()).orElseThrow();
    }

    protected void assertPersistedDestaqueBibliaToMatchAllProperties(DestaqueBiblia expectedDestaqueBiblia) {
        assertDestaqueBibliaAllPropertiesEquals(expectedDestaqueBiblia, getPersistedDestaqueBiblia(expectedDestaqueBiblia));
    }

    protected void assertPersistedDestaqueBibliaToMatchUpdatableProperties(DestaqueBiblia expectedDestaqueBiblia) {
        assertDestaqueBibliaAllUpdatablePropertiesEquals(expectedDestaqueBiblia, getPersistedDestaqueBiblia(expectedDestaqueBiblia));
    }
}
