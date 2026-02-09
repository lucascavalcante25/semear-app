package br.com.semear.web.rest;

import static br.com.semear.domain.HistoricoLeituraBibliaAsserts.*;
import static br.com.semear.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import br.com.semear.IntegrationTest;
import br.com.semear.domain.HistoricoLeituraBiblia;
import br.com.semear.domain.enumeration.VersaoBiblia;
import br.com.semear.repository.HistoricoLeituraBibliaRepository;
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
 * Integration tests for the {@link HistoricoLeituraBibliaResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class HistoricoLeituraBibliaResourceIT {

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

    private static final Instant DEFAULT_LIDO_EM = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_LIDO_EM = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/historico-leitura-biblias";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private HistoricoLeituraBibliaRepository historicoLeituraBibliaRepository;

    @Autowired
    private UserRepository userRepository;

    @Mock
    private HistoricoLeituraBibliaRepository historicoLeituraBibliaRepositoryMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restHistoricoLeituraBibliaMockMvc;

    private HistoricoLeituraBiblia historicoLeituraBiblia;

    private HistoricoLeituraBiblia insertedHistoricoLeituraBiblia;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static HistoricoLeituraBiblia createEntity() {
        return new HistoricoLeituraBiblia()
            .livroId(DEFAULT_LIVRO_ID)
            .livroNome(DEFAULT_LIVRO_NOME)
            .capitulo(DEFAULT_CAPITULO)
            .versiculoInicio(DEFAULT_VERSICULO_INICIO)
            .versiculoFim(DEFAULT_VERSICULO_FIM)
            .versao(DEFAULT_VERSAO)
            .lidoEm(DEFAULT_LIDO_EM);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static HistoricoLeituraBiblia createUpdatedEntity() {
        return new HistoricoLeituraBiblia()
            .livroId(UPDATED_LIVRO_ID)
            .livroNome(UPDATED_LIVRO_NOME)
            .capitulo(UPDATED_CAPITULO)
            .versiculoInicio(UPDATED_VERSICULO_INICIO)
            .versiculoFim(UPDATED_VERSICULO_FIM)
            .versao(UPDATED_VERSAO)
            .lidoEm(UPDATED_LIDO_EM);
    }

    @BeforeEach
    void initTest() {
        historicoLeituraBiblia = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedHistoricoLeituraBiblia != null) {
            historicoLeituraBibliaRepository.delete(insertedHistoricoLeituraBiblia);
            insertedHistoricoLeituraBiblia = null;
        }
    }

    @Test
    @Transactional
    void createHistoricoLeituraBiblia() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the HistoricoLeituraBiblia
        var returnedHistoricoLeituraBiblia = om.readValue(
            restHistoricoLeituraBibliaMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(historicoLeituraBiblia)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            HistoricoLeituraBiblia.class
        );

        // Validate the HistoricoLeituraBiblia in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertHistoricoLeituraBibliaUpdatableFieldsEquals(
            returnedHistoricoLeituraBiblia,
            getPersistedHistoricoLeituraBiblia(returnedHistoricoLeituraBiblia)
        );

        insertedHistoricoLeituraBiblia = returnedHistoricoLeituraBiblia;
    }

    @Test
    @Transactional
    void createHistoricoLeituraBibliaWithExistingId() throws Exception {
        // Create the HistoricoLeituraBiblia with an existing ID
        historicoLeituraBiblia.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restHistoricoLeituraBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(historicoLeituraBiblia)))
            .andExpect(status().isBadRequest());

        // Validate the HistoricoLeituraBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkLivroIdIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        historicoLeituraBiblia.setLivroId(null);

        // Create the HistoricoLeituraBiblia, which fails.

        restHistoricoLeituraBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(historicoLeituraBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkLivroNomeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        historicoLeituraBiblia.setLivroNome(null);

        // Create the HistoricoLeituraBiblia, which fails.

        restHistoricoLeituraBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(historicoLeituraBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCapituloIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        historicoLeituraBiblia.setCapitulo(null);

        // Create the HistoricoLeituraBiblia, which fails.

        restHistoricoLeituraBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(historicoLeituraBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkVersiculoInicioIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        historicoLeituraBiblia.setVersiculoInicio(null);

        // Create the HistoricoLeituraBiblia, which fails.

        restHistoricoLeituraBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(historicoLeituraBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkVersiculoFimIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        historicoLeituraBiblia.setVersiculoFim(null);

        // Create the HistoricoLeituraBiblia, which fails.

        restHistoricoLeituraBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(historicoLeituraBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkVersaoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        historicoLeituraBiblia.setVersao(null);

        // Create the HistoricoLeituraBiblia, which fails.

        restHistoricoLeituraBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(historicoLeituraBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkLidoEmIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        historicoLeituraBiblia.setLidoEm(null);

        // Create the HistoricoLeituraBiblia, which fails.

        restHistoricoLeituraBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(historicoLeituraBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllHistoricoLeituraBiblias() throws Exception {
        // Initialize the database
        insertedHistoricoLeituraBiblia = historicoLeituraBibliaRepository.saveAndFlush(historicoLeituraBiblia);

        // Get all the historicoLeituraBibliaList
        restHistoricoLeituraBibliaMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(historicoLeituraBiblia.getId().intValue())))
            .andExpect(jsonPath("$.[*].livroId").value(hasItem(DEFAULT_LIVRO_ID)))
            .andExpect(jsonPath("$.[*].livroNome").value(hasItem(DEFAULT_LIVRO_NOME)))
            .andExpect(jsonPath("$.[*].capitulo").value(hasItem(DEFAULT_CAPITULO)))
            .andExpect(jsonPath("$.[*].versiculoInicio").value(hasItem(DEFAULT_VERSICULO_INICIO)))
            .andExpect(jsonPath("$.[*].versiculoFim").value(hasItem(DEFAULT_VERSICULO_FIM)))
            .andExpect(jsonPath("$.[*].versao").value(hasItem(DEFAULT_VERSAO.toString())))
            .andExpect(jsonPath("$.[*].lidoEm").value(hasItem(DEFAULT_LIDO_EM.toString())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllHistoricoLeituraBibliasWithEagerRelationshipsIsEnabled() throws Exception {
        when(historicoLeituraBibliaRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restHistoricoLeituraBibliaMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(historicoLeituraBibliaRepositoryMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllHistoricoLeituraBibliasWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(historicoLeituraBibliaRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restHistoricoLeituraBibliaMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(historicoLeituraBibliaRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getHistoricoLeituraBiblia() throws Exception {
        // Initialize the database
        insertedHistoricoLeituraBiblia = historicoLeituraBibliaRepository.saveAndFlush(historicoLeituraBiblia);

        // Get the historicoLeituraBiblia
        restHistoricoLeituraBibliaMockMvc
            .perform(get(ENTITY_API_URL_ID, historicoLeituraBiblia.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(historicoLeituraBiblia.getId().intValue()))
            .andExpect(jsonPath("$.livroId").value(DEFAULT_LIVRO_ID))
            .andExpect(jsonPath("$.livroNome").value(DEFAULT_LIVRO_NOME))
            .andExpect(jsonPath("$.capitulo").value(DEFAULT_CAPITULO))
            .andExpect(jsonPath("$.versiculoInicio").value(DEFAULT_VERSICULO_INICIO))
            .andExpect(jsonPath("$.versiculoFim").value(DEFAULT_VERSICULO_FIM))
            .andExpect(jsonPath("$.versao").value(DEFAULT_VERSAO.toString()))
            .andExpect(jsonPath("$.lidoEm").value(DEFAULT_LIDO_EM.toString()));
    }

    @Test
    @Transactional
    void getNonExistingHistoricoLeituraBiblia() throws Exception {
        // Get the historicoLeituraBiblia
        restHistoricoLeituraBibliaMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingHistoricoLeituraBiblia() throws Exception {
        // Initialize the database
        insertedHistoricoLeituraBiblia = historicoLeituraBibliaRepository.saveAndFlush(historicoLeituraBiblia);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the historicoLeituraBiblia
        HistoricoLeituraBiblia updatedHistoricoLeituraBiblia = historicoLeituraBibliaRepository
            .findById(historicoLeituraBiblia.getId())
            .orElseThrow();
        // Disconnect from session so that the updates on updatedHistoricoLeituraBiblia are not directly saved in db
        em.detach(updatedHistoricoLeituraBiblia);
        updatedHistoricoLeituraBiblia
            .livroId(UPDATED_LIVRO_ID)
            .livroNome(UPDATED_LIVRO_NOME)
            .capitulo(UPDATED_CAPITULO)
            .versiculoInicio(UPDATED_VERSICULO_INICIO)
            .versiculoFim(UPDATED_VERSICULO_FIM)
            .versao(UPDATED_VERSAO)
            .lidoEm(UPDATED_LIDO_EM);

        restHistoricoLeituraBibliaMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedHistoricoLeituraBiblia.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedHistoricoLeituraBiblia))
            )
            .andExpect(status().isOk());

        // Validate the HistoricoLeituraBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedHistoricoLeituraBibliaToMatchAllProperties(updatedHistoricoLeituraBiblia);
    }

    @Test
    @Transactional
    void putNonExistingHistoricoLeituraBiblia() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        historicoLeituraBiblia.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restHistoricoLeituraBibliaMockMvc
            .perform(
                put(ENTITY_API_URL_ID, historicoLeituraBiblia.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(historicoLeituraBiblia))
            )
            .andExpect(status().isBadRequest());

        // Validate the HistoricoLeituraBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchHistoricoLeituraBiblia() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        historicoLeituraBiblia.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHistoricoLeituraBibliaMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(historicoLeituraBiblia))
            )
            .andExpect(status().isBadRequest());

        // Validate the HistoricoLeituraBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamHistoricoLeituraBiblia() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        historicoLeituraBiblia.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHistoricoLeituraBibliaMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(historicoLeituraBiblia)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the HistoricoLeituraBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateHistoricoLeituraBibliaWithPatch() throws Exception {
        // Initialize the database
        insertedHistoricoLeituraBiblia = historicoLeituraBibliaRepository.saveAndFlush(historicoLeituraBiblia);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the historicoLeituraBiblia using partial update
        HistoricoLeituraBiblia partialUpdatedHistoricoLeituraBiblia = new HistoricoLeituraBiblia();
        partialUpdatedHistoricoLeituraBiblia.setId(historicoLeituraBiblia.getId());

        partialUpdatedHistoricoLeituraBiblia.livroId(UPDATED_LIVRO_ID).versiculoFim(UPDATED_VERSICULO_FIM).lidoEm(UPDATED_LIDO_EM);

        restHistoricoLeituraBibliaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedHistoricoLeituraBiblia.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedHistoricoLeituraBiblia))
            )
            .andExpect(status().isOk());

        // Validate the HistoricoLeituraBiblia in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertHistoricoLeituraBibliaUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedHistoricoLeituraBiblia, historicoLeituraBiblia),
            getPersistedHistoricoLeituraBiblia(historicoLeituraBiblia)
        );
    }

    @Test
    @Transactional
    void fullUpdateHistoricoLeituraBibliaWithPatch() throws Exception {
        // Initialize the database
        insertedHistoricoLeituraBiblia = historicoLeituraBibliaRepository.saveAndFlush(historicoLeituraBiblia);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the historicoLeituraBiblia using partial update
        HistoricoLeituraBiblia partialUpdatedHistoricoLeituraBiblia = new HistoricoLeituraBiblia();
        partialUpdatedHistoricoLeituraBiblia.setId(historicoLeituraBiblia.getId());

        partialUpdatedHistoricoLeituraBiblia
            .livroId(UPDATED_LIVRO_ID)
            .livroNome(UPDATED_LIVRO_NOME)
            .capitulo(UPDATED_CAPITULO)
            .versiculoInicio(UPDATED_VERSICULO_INICIO)
            .versiculoFim(UPDATED_VERSICULO_FIM)
            .versao(UPDATED_VERSAO)
            .lidoEm(UPDATED_LIDO_EM);

        restHistoricoLeituraBibliaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedHistoricoLeituraBiblia.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedHistoricoLeituraBiblia))
            )
            .andExpect(status().isOk());

        // Validate the HistoricoLeituraBiblia in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertHistoricoLeituraBibliaUpdatableFieldsEquals(
            partialUpdatedHistoricoLeituraBiblia,
            getPersistedHistoricoLeituraBiblia(partialUpdatedHistoricoLeituraBiblia)
        );
    }

    @Test
    @Transactional
    void patchNonExistingHistoricoLeituraBiblia() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        historicoLeituraBiblia.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restHistoricoLeituraBibliaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, historicoLeituraBiblia.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(historicoLeituraBiblia))
            )
            .andExpect(status().isBadRequest());

        // Validate the HistoricoLeituraBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchHistoricoLeituraBiblia() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        historicoLeituraBiblia.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHistoricoLeituraBibliaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(historicoLeituraBiblia))
            )
            .andExpect(status().isBadRequest());

        // Validate the HistoricoLeituraBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamHistoricoLeituraBiblia() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        historicoLeituraBiblia.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHistoricoLeituraBibliaMockMvc
            .perform(
                patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(historicoLeituraBiblia))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the HistoricoLeituraBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteHistoricoLeituraBiblia() throws Exception {
        // Initialize the database
        insertedHistoricoLeituraBiblia = historicoLeituraBibliaRepository.saveAndFlush(historicoLeituraBiblia);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the historicoLeituraBiblia
        restHistoricoLeituraBibliaMockMvc
            .perform(delete(ENTITY_API_URL_ID, historicoLeituraBiblia.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return historicoLeituraBibliaRepository.count();
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

    protected HistoricoLeituraBiblia getPersistedHistoricoLeituraBiblia(HistoricoLeituraBiblia historicoLeituraBiblia) {
        return historicoLeituraBibliaRepository.findById(historicoLeituraBiblia.getId()).orElseThrow();
    }

    protected void assertPersistedHistoricoLeituraBibliaToMatchAllProperties(HistoricoLeituraBiblia expectedHistoricoLeituraBiblia) {
        assertHistoricoLeituraBibliaAllPropertiesEquals(
            expectedHistoricoLeituraBiblia,
            getPersistedHistoricoLeituraBiblia(expectedHistoricoLeituraBiblia)
        );
    }

    protected void assertPersistedHistoricoLeituraBibliaToMatchUpdatableProperties(HistoricoLeituraBiblia expectedHistoricoLeituraBiblia) {
        assertHistoricoLeituraBibliaAllUpdatablePropertiesEquals(
            expectedHistoricoLeituraBiblia,
            getPersistedHistoricoLeituraBiblia(expectedHistoricoLeituraBiblia)
        );
    }
}
