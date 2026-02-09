package br.com.semear.web.rest;

import static br.com.semear.domain.NotaBibliaAsserts.*;
import static br.com.semear.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import br.com.semear.IntegrationTest;
import br.com.semear.domain.NotaBiblia;
import br.com.semear.domain.enumeration.VersaoBiblia;
import br.com.semear.repository.NotaBibliaRepository;
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
 * Integration tests for the {@link NotaBibliaResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class NotaBibliaResourceIT {

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

    private static final String DEFAULT_CONTEUDO = "AAAAAAAAAA";
    private static final String UPDATED_CONTEUDO = "BBBBBBBBBB";

    private static final Instant DEFAULT_CRIADO_EM = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CRIADO_EM = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Instant DEFAULT_ATUALIZADO_EM = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_ATUALIZADO_EM = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/nota-biblias";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private NotaBibliaRepository notaBibliaRepository;

    @Autowired
    private UserRepository userRepository;

    @Mock
    private NotaBibliaRepository notaBibliaRepositoryMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restNotaBibliaMockMvc;

    private NotaBiblia notaBiblia;

    private NotaBiblia insertedNotaBiblia;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static NotaBiblia createEntity() {
        return new NotaBiblia()
            .chaveReferencia(DEFAULT_CHAVE_REFERENCIA)
            .livroId(DEFAULT_LIVRO_ID)
            .livroNome(DEFAULT_LIVRO_NOME)
            .capitulo(DEFAULT_CAPITULO)
            .versiculoInicio(DEFAULT_VERSICULO_INICIO)
            .versiculoFim(DEFAULT_VERSICULO_FIM)
            .versao(DEFAULT_VERSAO)
            .conteudo(DEFAULT_CONTEUDO)
            .criadoEm(DEFAULT_CRIADO_EM)
            .atualizadoEm(DEFAULT_ATUALIZADO_EM);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static NotaBiblia createUpdatedEntity() {
        return new NotaBiblia()
            .chaveReferencia(UPDATED_CHAVE_REFERENCIA)
            .livroId(UPDATED_LIVRO_ID)
            .livroNome(UPDATED_LIVRO_NOME)
            .capitulo(UPDATED_CAPITULO)
            .versiculoInicio(UPDATED_VERSICULO_INICIO)
            .versiculoFim(UPDATED_VERSICULO_FIM)
            .versao(UPDATED_VERSAO)
            .conteudo(UPDATED_CONTEUDO)
            .criadoEm(UPDATED_CRIADO_EM)
            .atualizadoEm(UPDATED_ATUALIZADO_EM);
    }

    @BeforeEach
    void initTest() {
        notaBiblia = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedNotaBiblia != null) {
            notaBibliaRepository.delete(insertedNotaBiblia);
            insertedNotaBiblia = null;
        }
    }

    @Test
    @Transactional
    void createNotaBiblia() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the NotaBiblia
        var returnedNotaBiblia = om.readValue(
            restNotaBibliaMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(notaBiblia)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            NotaBiblia.class
        );

        // Validate the NotaBiblia in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertNotaBibliaUpdatableFieldsEquals(returnedNotaBiblia, getPersistedNotaBiblia(returnedNotaBiblia));

        insertedNotaBiblia = returnedNotaBiblia;
    }

    @Test
    @Transactional
    void createNotaBibliaWithExistingId() throws Exception {
        // Create the NotaBiblia with an existing ID
        notaBiblia.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restNotaBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(notaBiblia)))
            .andExpect(status().isBadRequest());

        // Validate the NotaBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkChaveReferenciaIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        notaBiblia.setChaveReferencia(null);

        // Create the NotaBiblia, which fails.

        restNotaBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(notaBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkLivroIdIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        notaBiblia.setLivroId(null);

        // Create the NotaBiblia, which fails.

        restNotaBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(notaBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkLivroNomeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        notaBiblia.setLivroNome(null);

        // Create the NotaBiblia, which fails.

        restNotaBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(notaBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCapituloIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        notaBiblia.setCapitulo(null);

        // Create the NotaBiblia, which fails.

        restNotaBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(notaBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkVersiculoInicioIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        notaBiblia.setVersiculoInicio(null);

        // Create the NotaBiblia, which fails.

        restNotaBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(notaBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkVersiculoFimIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        notaBiblia.setVersiculoFim(null);

        // Create the NotaBiblia, which fails.

        restNotaBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(notaBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkVersaoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        notaBiblia.setVersao(null);

        // Create the NotaBiblia, which fails.

        restNotaBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(notaBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCriadoEmIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        notaBiblia.setCriadoEm(null);

        // Create the NotaBiblia, which fails.

        restNotaBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(notaBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkAtualizadoEmIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        notaBiblia.setAtualizadoEm(null);

        // Create the NotaBiblia, which fails.

        restNotaBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(notaBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllNotaBiblias() throws Exception {
        // Initialize the database
        insertedNotaBiblia = notaBibliaRepository.saveAndFlush(notaBiblia);

        // Get all the notaBibliaList
        restNotaBibliaMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(notaBiblia.getId().intValue())))
            .andExpect(jsonPath("$.[*].chaveReferencia").value(hasItem(DEFAULT_CHAVE_REFERENCIA)))
            .andExpect(jsonPath("$.[*].livroId").value(hasItem(DEFAULT_LIVRO_ID)))
            .andExpect(jsonPath("$.[*].livroNome").value(hasItem(DEFAULT_LIVRO_NOME)))
            .andExpect(jsonPath("$.[*].capitulo").value(hasItem(DEFAULT_CAPITULO)))
            .andExpect(jsonPath("$.[*].versiculoInicio").value(hasItem(DEFAULT_VERSICULO_INICIO)))
            .andExpect(jsonPath("$.[*].versiculoFim").value(hasItem(DEFAULT_VERSICULO_FIM)))
            .andExpect(jsonPath("$.[*].versao").value(hasItem(DEFAULT_VERSAO.toString())))
            .andExpect(jsonPath("$.[*].conteudo").value(hasItem(DEFAULT_CONTEUDO)))
            .andExpect(jsonPath("$.[*].criadoEm").value(hasItem(DEFAULT_CRIADO_EM.toString())))
            .andExpect(jsonPath("$.[*].atualizadoEm").value(hasItem(DEFAULT_ATUALIZADO_EM.toString())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllNotaBibliasWithEagerRelationshipsIsEnabled() throws Exception {
        when(notaBibliaRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restNotaBibliaMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(notaBibliaRepositoryMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllNotaBibliasWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(notaBibliaRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restNotaBibliaMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(notaBibliaRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getNotaBiblia() throws Exception {
        // Initialize the database
        insertedNotaBiblia = notaBibliaRepository.saveAndFlush(notaBiblia);

        // Get the notaBiblia
        restNotaBibliaMockMvc
            .perform(get(ENTITY_API_URL_ID, notaBiblia.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(notaBiblia.getId().intValue()))
            .andExpect(jsonPath("$.chaveReferencia").value(DEFAULT_CHAVE_REFERENCIA))
            .andExpect(jsonPath("$.livroId").value(DEFAULT_LIVRO_ID))
            .andExpect(jsonPath("$.livroNome").value(DEFAULT_LIVRO_NOME))
            .andExpect(jsonPath("$.capitulo").value(DEFAULT_CAPITULO))
            .andExpect(jsonPath("$.versiculoInicio").value(DEFAULT_VERSICULO_INICIO))
            .andExpect(jsonPath("$.versiculoFim").value(DEFAULT_VERSICULO_FIM))
            .andExpect(jsonPath("$.versao").value(DEFAULT_VERSAO.toString()))
            .andExpect(jsonPath("$.conteudo").value(DEFAULT_CONTEUDO))
            .andExpect(jsonPath("$.criadoEm").value(DEFAULT_CRIADO_EM.toString()))
            .andExpect(jsonPath("$.atualizadoEm").value(DEFAULT_ATUALIZADO_EM.toString()));
    }

    @Test
    @Transactional
    void getNonExistingNotaBiblia() throws Exception {
        // Get the notaBiblia
        restNotaBibliaMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingNotaBiblia() throws Exception {
        // Initialize the database
        insertedNotaBiblia = notaBibliaRepository.saveAndFlush(notaBiblia);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the notaBiblia
        NotaBiblia updatedNotaBiblia = notaBibliaRepository.findById(notaBiblia.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedNotaBiblia are not directly saved in db
        em.detach(updatedNotaBiblia);
        updatedNotaBiblia
            .chaveReferencia(UPDATED_CHAVE_REFERENCIA)
            .livroId(UPDATED_LIVRO_ID)
            .livroNome(UPDATED_LIVRO_NOME)
            .capitulo(UPDATED_CAPITULO)
            .versiculoInicio(UPDATED_VERSICULO_INICIO)
            .versiculoFim(UPDATED_VERSICULO_FIM)
            .versao(UPDATED_VERSAO)
            .conteudo(UPDATED_CONTEUDO)
            .criadoEm(UPDATED_CRIADO_EM)
            .atualizadoEm(UPDATED_ATUALIZADO_EM);

        restNotaBibliaMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedNotaBiblia.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedNotaBiblia))
            )
            .andExpect(status().isOk());

        // Validate the NotaBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedNotaBibliaToMatchAllProperties(updatedNotaBiblia);
    }

    @Test
    @Transactional
    void putNonExistingNotaBiblia() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        notaBiblia.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restNotaBibliaMockMvc
            .perform(
                put(ENTITY_API_URL_ID, notaBiblia.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(notaBiblia))
            )
            .andExpect(status().isBadRequest());

        // Validate the NotaBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchNotaBiblia() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        notaBiblia.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restNotaBibliaMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(notaBiblia))
            )
            .andExpect(status().isBadRequest());

        // Validate the NotaBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamNotaBiblia() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        notaBiblia.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restNotaBibliaMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(notaBiblia)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the NotaBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateNotaBibliaWithPatch() throws Exception {
        // Initialize the database
        insertedNotaBiblia = notaBibliaRepository.saveAndFlush(notaBiblia);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the notaBiblia using partial update
        NotaBiblia partialUpdatedNotaBiblia = new NotaBiblia();
        partialUpdatedNotaBiblia.setId(notaBiblia.getId());

        partialUpdatedNotaBiblia.capitulo(UPDATED_CAPITULO).versao(UPDATED_VERSAO).conteudo(UPDATED_CONTEUDO);

        restNotaBibliaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedNotaBiblia.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedNotaBiblia))
            )
            .andExpect(status().isOk());

        // Validate the NotaBiblia in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertNotaBibliaUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedNotaBiblia, notaBiblia),
            getPersistedNotaBiblia(notaBiblia)
        );
    }

    @Test
    @Transactional
    void fullUpdateNotaBibliaWithPatch() throws Exception {
        // Initialize the database
        insertedNotaBiblia = notaBibliaRepository.saveAndFlush(notaBiblia);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the notaBiblia using partial update
        NotaBiblia partialUpdatedNotaBiblia = new NotaBiblia();
        partialUpdatedNotaBiblia.setId(notaBiblia.getId());

        partialUpdatedNotaBiblia
            .chaveReferencia(UPDATED_CHAVE_REFERENCIA)
            .livroId(UPDATED_LIVRO_ID)
            .livroNome(UPDATED_LIVRO_NOME)
            .capitulo(UPDATED_CAPITULO)
            .versiculoInicio(UPDATED_VERSICULO_INICIO)
            .versiculoFim(UPDATED_VERSICULO_FIM)
            .versao(UPDATED_VERSAO)
            .conteudo(UPDATED_CONTEUDO)
            .criadoEm(UPDATED_CRIADO_EM)
            .atualizadoEm(UPDATED_ATUALIZADO_EM);

        restNotaBibliaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedNotaBiblia.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedNotaBiblia))
            )
            .andExpect(status().isOk());

        // Validate the NotaBiblia in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertNotaBibliaUpdatableFieldsEquals(partialUpdatedNotaBiblia, getPersistedNotaBiblia(partialUpdatedNotaBiblia));
    }

    @Test
    @Transactional
    void patchNonExistingNotaBiblia() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        notaBiblia.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restNotaBibliaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, notaBiblia.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(notaBiblia))
            )
            .andExpect(status().isBadRequest());

        // Validate the NotaBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchNotaBiblia() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        notaBiblia.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restNotaBibliaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(notaBiblia))
            )
            .andExpect(status().isBadRequest());

        // Validate the NotaBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamNotaBiblia() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        notaBiblia.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restNotaBibliaMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(notaBiblia)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the NotaBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteNotaBiblia() throws Exception {
        // Initialize the database
        insertedNotaBiblia = notaBibliaRepository.saveAndFlush(notaBiblia);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the notaBiblia
        restNotaBibliaMockMvc
            .perform(delete(ENTITY_API_URL_ID, notaBiblia.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return notaBibliaRepository.count();
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

    protected NotaBiblia getPersistedNotaBiblia(NotaBiblia notaBiblia) {
        return notaBibliaRepository.findById(notaBiblia.getId()).orElseThrow();
    }

    protected void assertPersistedNotaBibliaToMatchAllProperties(NotaBiblia expectedNotaBiblia) {
        assertNotaBibliaAllPropertiesEquals(expectedNotaBiblia, getPersistedNotaBiblia(expectedNotaBiblia));
    }

    protected void assertPersistedNotaBibliaToMatchUpdatableProperties(NotaBiblia expectedNotaBiblia) {
        assertNotaBibliaAllUpdatablePropertiesEquals(expectedNotaBiblia, getPersistedNotaBiblia(expectedNotaBiblia));
    }
}
