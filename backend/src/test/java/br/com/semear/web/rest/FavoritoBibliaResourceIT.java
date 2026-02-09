package br.com.semear.web.rest;

import static br.com.semear.domain.FavoritoBibliaAsserts.*;
import static br.com.semear.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import br.com.semear.IntegrationTest;
import br.com.semear.domain.FavoritoBiblia;
import br.com.semear.domain.enumeration.VersaoBiblia;
import br.com.semear.repository.FavoritoBibliaRepository;
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
 * Integration tests for the {@link FavoritoBibliaResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class FavoritoBibliaResourceIT {

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

    private static final Instant DEFAULT_CRIADO_EM = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CRIADO_EM = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Instant DEFAULT_ATUALIZADO_EM = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_ATUALIZADO_EM = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/favorito-biblias";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private FavoritoBibliaRepository favoritoBibliaRepository;

    @Autowired
    private UserRepository userRepository;

    @Mock
    private FavoritoBibliaRepository favoritoBibliaRepositoryMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restFavoritoBibliaMockMvc;

    private FavoritoBiblia favoritoBiblia;

    private FavoritoBiblia insertedFavoritoBiblia;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static FavoritoBiblia createEntity() {
        return new FavoritoBiblia()
            .chaveReferencia(DEFAULT_CHAVE_REFERENCIA)
            .livroId(DEFAULT_LIVRO_ID)
            .livroNome(DEFAULT_LIVRO_NOME)
            .capitulo(DEFAULT_CAPITULO)
            .versiculoInicio(DEFAULT_VERSICULO_INICIO)
            .versiculoFim(DEFAULT_VERSICULO_FIM)
            .versao(DEFAULT_VERSAO)
            .criadoEm(DEFAULT_CRIADO_EM)
            .atualizadoEm(DEFAULT_ATUALIZADO_EM);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static FavoritoBiblia createUpdatedEntity() {
        return new FavoritoBiblia()
            .chaveReferencia(UPDATED_CHAVE_REFERENCIA)
            .livroId(UPDATED_LIVRO_ID)
            .livroNome(UPDATED_LIVRO_NOME)
            .capitulo(UPDATED_CAPITULO)
            .versiculoInicio(UPDATED_VERSICULO_INICIO)
            .versiculoFim(UPDATED_VERSICULO_FIM)
            .versao(UPDATED_VERSAO)
            .criadoEm(UPDATED_CRIADO_EM)
            .atualizadoEm(UPDATED_ATUALIZADO_EM);
    }

    @BeforeEach
    void initTest() {
        favoritoBiblia = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedFavoritoBiblia != null) {
            favoritoBibliaRepository.delete(insertedFavoritoBiblia);
            insertedFavoritoBiblia = null;
        }
    }

    @Test
    @Transactional
    void createFavoritoBiblia() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the FavoritoBiblia
        var returnedFavoritoBiblia = om.readValue(
            restFavoritoBibliaMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(favoritoBiblia)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            FavoritoBiblia.class
        );

        // Validate the FavoritoBiblia in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertFavoritoBibliaUpdatableFieldsEquals(returnedFavoritoBiblia, getPersistedFavoritoBiblia(returnedFavoritoBiblia));

        insertedFavoritoBiblia = returnedFavoritoBiblia;
    }

    @Test
    @Transactional
    void createFavoritoBibliaWithExistingId() throws Exception {
        // Create the FavoritoBiblia with an existing ID
        favoritoBiblia.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restFavoritoBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(favoritoBiblia)))
            .andExpect(status().isBadRequest());

        // Validate the FavoritoBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkChaveReferenciaIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        favoritoBiblia.setChaveReferencia(null);

        // Create the FavoritoBiblia, which fails.

        restFavoritoBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(favoritoBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkLivroIdIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        favoritoBiblia.setLivroId(null);

        // Create the FavoritoBiblia, which fails.

        restFavoritoBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(favoritoBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkLivroNomeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        favoritoBiblia.setLivroNome(null);

        // Create the FavoritoBiblia, which fails.

        restFavoritoBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(favoritoBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCapituloIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        favoritoBiblia.setCapitulo(null);

        // Create the FavoritoBiblia, which fails.

        restFavoritoBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(favoritoBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkVersiculoInicioIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        favoritoBiblia.setVersiculoInicio(null);

        // Create the FavoritoBiblia, which fails.

        restFavoritoBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(favoritoBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkVersiculoFimIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        favoritoBiblia.setVersiculoFim(null);

        // Create the FavoritoBiblia, which fails.

        restFavoritoBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(favoritoBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkVersaoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        favoritoBiblia.setVersao(null);

        // Create the FavoritoBiblia, which fails.

        restFavoritoBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(favoritoBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCriadoEmIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        favoritoBiblia.setCriadoEm(null);

        // Create the FavoritoBiblia, which fails.

        restFavoritoBibliaMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(favoritoBiblia)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllFavoritoBiblias() throws Exception {
        // Initialize the database
        insertedFavoritoBiblia = favoritoBibliaRepository.saveAndFlush(favoritoBiblia);

        // Get all the favoritoBibliaList
        restFavoritoBibliaMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(favoritoBiblia.getId().intValue())))
            .andExpect(jsonPath("$.[*].chaveReferencia").value(hasItem(DEFAULT_CHAVE_REFERENCIA)))
            .andExpect(jsonPath("$.[*].livroId").value(hasItem(DEFAULT_LIVRO_ID)))
            .andExpect(jsonPath("$.[*].livroNome").value(hasItem(DEFAULT_LIVRO_NOME)))
            .andExpect(jsonPath("$.[*].capitulo").value(hasItem(DEFAULT_CAPITULO)))
            .andExpect(jsonPath("$.[*].versiculoInicio").value(hasItem(DEFAULT_VERSICULO_INICIO)))
            .andExpect(jsonPath("$.[*].versiculoFim").value(hasItem(DEFAULT_VERSICULO_FIM)))
            .andExpect(jsonPath("$.[*].versao").value(hasItem(DEFAULT_VERSAO.toString())))
            .andExpect(jsonPath("$.[*].criadoEm").value(hasItem(DEFAULT_CRIADO_EM.toString())))
            .andExpect(jsonPath("$.[*].atualizadoEm").value(hasItem(DEFAULT_ATUALIZADO_EM.toString())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllFavoritoBibliasWithEagerRelationshipsIsEnabled() throws Exception {
        when(favoritoBibliaRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restFavoritoBibliaMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(favoritoBibliaRepositoryMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllFavoritoBibliasWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(favoritoBibliaRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restFavoritoBibliaMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(favoritoBibliaRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getFavoritoBiblia() throws Exception {
        // Initialize the database
        insertedFavoritoBiblia = favoritoBibliaRepository.saveAndFlush(favoritoBiblia);

        // Get the favoritoBiblia
        restFavoritoBibliaMockMvc
            .perform(get(ENTITY_API_URL_ID, favoritoBiblia.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(favoritoBiblia.getId().intValue()))
            .andExpect(jsonPath("$.chaveReferencia").value(DEFAULT_CHAVE_REFERENCIA))
            .andExpect(jsonPath("$.livroId").value(DEFAULT_LIVRO_ID))
            .andExpect(jsonPath("$.livroNome").value(DEFAULT_LIVRO_NOME))
            .andExpect(jsonPath("$.capitulo").value(DEFAULT_CAPITULO))
            .andExpect(jsonPath("$.versiculoInicio").value(DEFAULT_VERSICULO_INICIO))
            .andExpect(jsonPath("$.versiculoFim").value(DEFAULT_VERSICULO_FIM))
            .andExpect(jsonPath("$.versao").value(DEFAULT_VERSAO.toString()))
            .andExpect(jsonPath("$.criadoEm").value(DEFAULT_CRIADO_EM.toString()))
            .andExpect(jsonPath("$.atualizadoEm").value(DEFAULT_ATUALIZADO_EM.toString()));
    }

    @Test
    @Transactional
    void getNonExistingFavoritoBiblia() throws Exception {
        // Get the favoritoBiblia
        restFavoritoBibliaMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingFavoritoBiblia() throws Exception {
        // Initialize the database
        insertedFavoritoBiblia = favoritoBibliaRepository.saveAndFlush(favoritoBiblia);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the favoritoBiblia
        FavoritoBiblia updatedFavoritoBiblia = favoritoBibliaRepository.findById(favoritoBiblia.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedFavoritoBiblia are not directly saved in db
        em.detach(updatedFavoritoBiblia);
        updatedFavoritoBiblia
            .chaveReferencia(UPDATED_CHAVE_REFERENCIA)
            .livroId(UPDATED_LIVRO_ID)
            .livroNome(UPDATED_LIVRO_NOME)
            .capitulo(UPDATED_CAPITULO)
            .versiculoInicio(UPDATED_VERSICULO_INICIO)
            .versiculoFim(UPDATED_VERSICULO_FIM)
            .versao(UPDATED_VERSAO)
            .criadoEm(UPDATED_CRIADO_EM)
            .atualizadoEm(UPDATED_ATUALIZADO_EM);

        restFavoritoBibliaMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedFavoritoBiblia.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedFavoritoBiblia))
            )
            .andExpect(status().isOk());

        // Validate the FavoritoBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedFavoritoBibliaToMatchAllProperties(updatedFavoritoBiblia);
    }

    @Test
    @Transactional
    void putNonExistingFavoritoBiblia() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        favoritoBiblia.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restFavoritoBibliaMockMvc
            .perform(
                put(ENTITY_API_URL_ID, favoritoBiblia.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(favoritoBiblia))
            )
            .andExpect(status().isBadRequest());

        // Validate the FavoritoBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchFavoritoBiblia() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        favoritoBiblia.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFavoritoBibliaMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(favoritoBiblia))
            )
            .andExpect(status().isBadRequest());

        // Validate the FavoritoBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamFavoritoBiblia() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        favoritoBiblia.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFavoritoBibliaMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(favoritoBiblia)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the FavoritoBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateFavoritoBibliaWithPatch() throws Exception {
        // Initialize the database
        insertedFavoritoBiblia = favoritoBibliaRepository.saveAndFlush(favoritoBiblia);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the favoritoBiblia using partial update
        FavoritoBiblia partialUpdatedFavoritoBiblia = new FavoritoBiblia();
        partialUpdatedFavoritoBiblia.setId(favoritoBiblia.getId());

        partialUpdatedFavoritoBiblia
            .chaveReferencia(UPDATED_CHAVE_REFERENCIA)
            .livroNome(UPDATED_LIVRO_NOME)
            .versiculoInicio(UPDATED_VERSICULO_INICIO)
            .versiculoFim(UPDATED_VERSICULO_FIM)
            .versao(UPDATED_VERSAO)
            .atualizadoEm(UPDATED_ATUALIZADO_EM);

        restFavoritoBibliaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedFavoritoBiblia.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedFavoritoBiblia))
            )
            .andExpect(status().isOk());

        // Validate the FavoritoBiblia in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertFavoritoBibliaUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedFavoritoBiblia, favoritoBiblia),
            getPersistedFavoritoBiblia(favoritoBiblia)
        );
    }

    @Test
    @Transactional
    void fullUpdateFavoritoBibliaWithPatch() throws Exception {
        // Initialize the database
        insertedFavoritoBiblia = favoritoBibliaRepository.saveAndFlush(favoritoBiblia);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the favoritoBiblia using partial update
        FavoritoBiblia partialUpdatedFavoritoBiblia = new FavoritoBiblia();
        partialUpdatedFavoritoBiblia.setId(favoritoBiblia.getId());

        partialUpdatedFavoritoBiblia
            .chaveReferencia(UPDATED_CHAVE_REFERENCIA)
            .livroId(UPDATED_LIVRO_ID)
            .livroNome(UPDATED_LIVRO_NOME)
            .capitulo(UPDATED_CAPITULO)
            .versiculoInicio(UPDATED_VERSICULO_INICIO)
            .versiculoFim(UPDATED_VERSICULO_FIM)
            .versao(UPDATED_VERSAO)
            .criadoEm(UPDATED_CRIADO_EM)
            .atualizadoEm(UPDATED_ATUALIZADO_EM);

        restFavoritoBibliaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedFavoritoBiblia.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedFavoritoBiblia))
            )
            .andExpect(status().isOk());

        // Validate the FavoritoBiblia in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertFavoritoBibliaUpdatableFieldsEquals(partialUpdatedFavoritoBiblia, getPersistedFavoritoBiblia(partialUpdatedFavoritoBiblia));
    }

    @Test
    @Transactional
    void patchNonExistingFavoritoBiblia() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        favoritoBiblia.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restFavoritoBibliaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, favoritoBiblia.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(favoritoBiblia))
            )
            .andExpect(status().isBadRequest());

        // Validate the FavoritoBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchFavoritoBiblia() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        favoritoBiblia.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFavoritoBibliaMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(favoritoBiblia))
            )
            .andExpect(status().isBadRequest());

        // Validate the FavoritoBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamFavoritoBiblia() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        favoritoBiblia.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFavoritoBibliaMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(favoritoBiblia)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the FavoritoBiblia in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteFavoritoBiblia() throws Exception {
        // Initialize the database
        insertedFavoritoBiblia = favoritoBibliaRepository.saveAndFlush(favoritoBiblia);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the favoritoBiblia
        restFavoritoBibliaMockMvc
            .perform(delete(ENTITY_API_URL_ID, favoritoBiblia.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return favoritoBibliaRepository.count();
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

    protected FavoritoBiblia getPersistedFavoritoBiblia(FavoritoBiblia favoritoBiblia) {
        return favoritoBibliaRepository.findById(favoritoBiblia.getId()).orElseThrow();
    }

    protected void assertPersistedFavoritoBibliaToMatchAllProperties(FavoritoBiblia expectedFavoritoBiblia) {
        assertFavoritoBibliaAllPropertiesEquals(expectedFavoritoBiblia, getPersistedFavoritoBiblia(expectedFavoritoBiblia));
    }

    protected void assertPersistedFavoritoBibliaToMatchUpdatableProperties(FavoritoBiblia expectedFavoritoBiblia) {
        assertFavoritoBibliaAllUpdatablePropertiesEquals(expectedFavoritoBiblia, getPersistedFavoritoBiblia(expectedFavoritoBiblia));
    }
}
