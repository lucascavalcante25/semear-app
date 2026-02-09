package br.com.semear.web.rest;

import static br.com.semear.domain.CapituloBibliaCacheAsserts.*;
import static br.com.semear.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import br.com.semear.IntegrationTest;
import br.com.semear.domain.CapituloBibliaCache;
import br.com.semear.domain.enumeration.VersaoBiblia;
import br.com.semear.repository.CapituloBibliaCacheRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.time.Instant;
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
 * Integration tests for the {@link CapituloBibliaCacheResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class CapituloBibliaCacheResourceIT {

    private static final String DEFAULT_LIVRO_ID = "AAAAAAAAAA";
    private static final String UPDATED_LIVRO_ID = "BBBBBBBBBB";

    private static final String DEFAULT_LIVRO_NOME = "AAAAAAAAAA";
    private static final String UPDATED_LIVRO_NOME = "BBBBBBBBBB";

    private static final Integer DEFAULT_CAPITULO = 1;
    private static final Integer UPDATED_CAPITULO = 2;

    private static final VersaoBiblia DEFAULT_VERSAO = VersaoBiblia.ALMEIDA;
    private static final VersaoBiblia UPDATED_VERSAO = VersaoBiblia.KJV;

    private static final String DEFAULT_VERSICULOS_JSON = "AAAAAAAAAA";
    private static final String UPDATED_VERSICULOS_JSON = "BBBBBBBBBB";

    private static final Instant DEFAULT_CACHEADO_EM = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CACHEADO_EM = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/capitulo-biblia-caches";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private CapituloBibliaCacheRepository capituloBibliaCacheRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restCapituloBibliaCacheMockMvc;

    private CapituloBibliaCache capituloBibliaCache;

    private CapituloBibliaCache insertedCapituloBibliaCache;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static CapituloBibliaCache createEntity() {
        return new CapituloBibliaCache()
            .livroId(DEFAULT_LIVRO_ID)
            .livroNome(DEFAULT_LIVRO_NOME)
            .capitulo(DEFAULT_CAPITULO)
            .versao(DEFAULT_VERSAO)
            .versiculosJson(DEFAULT_VERSICULOS_JSON)
            .cacheadoEm(DEFAULT_CACHEADO_EM);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static CapituloBibliaCache createUpdatedEntity() {
        return new CapituloBibliaCache()
            .livroId(UPDATED_LIVRO_ID)
            .livroNome(UPDATED_LIVRO_NOME)
            .capitulo(UPDATED_CAPITULO)
            .versao(UPDATED_VERSAO)
            .versiculosJson(UPDATED_VERSICULOS_JSON)
            .cacheadoEm(UPDATED_CACHEADO_EM);
    }

    @BeforeEach
    void initTest() {
        capituloBibliaCache = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedCapituloBibliaCache != null) {
            capituloBibliaCacheRepository.delete(insertedCapituloBibliaCache);
            insertedCapituloBibliaCache = null;
        }
    }

    @Test
    @Transactional
    void createCapituloBibliaCache() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the CapituloBibliaCache
        var returnedCapituloBibliaCache = om.readValue(
            restCapituloBibliaCacheMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(capituloBibliaCache)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            CapituloBibliaCache.class
        );

        // Validate the CapituloBibliaCache in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertCapituloBibliaCacheUpdatableFieldsEquals(
            returnedCapituloBibliaCache,
            getPersistedCapituloBibliaCache(returnedCapituloBibliaCache)
        );

        insertedCapituloBibliaCache = returnedCapituloBibliaCache;
    }

    @Test
    @Transactional
    void createCapituloBibliaCacheWithExistingId() throws Exception {
        // Create the CapituloBibliaCache with an existing ID
        capituloBibliaCache.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restCapituloBibliaCacheMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(capituloBibliaCache)))
            .andExpect(status().isBadRequest());

        // Validate the CapituloBibliaCache in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkLivroIdIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        capituloBibliaCache.setLivroId(null);

        // Create the CapituloBibliaCache, which fails.

        restCapituloBibliaCacheMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(capituloBibliaCache)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkLivroNomeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        capituloBibliaCache.setLivroNome(null);

        // Create the CapituloBibliaCache, which fails.

        restCapituloBibliaCacheMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(capituloBibliaCache)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCapituloIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        capituloBibliaCache.setCapitulo(null);

        // Create the CapituloBibliaCache, which fails.

        restCapituloBibliaCacheMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(capituloBibliaCache)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkVersaoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        capituloBibliaCache.setVersao(null);

        // Create the CapituloBibliaCache, which fails.

        restCapituloBibliaCacheMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(capituloBibliaCache)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCacheadoEmIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        capituloBibliaCache.setCacheadoEm(null);

        // Create the CapituloBibliaCache, which fails.

        restCapituloBibliaCacheMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(capituloBibliaCache)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllCapituloBibliaCaches() throws Exception {
        // Initialize the database
        insertedCapituloBibliaCache = capituloBibliaCacheRepository.saveAndFlush(capituloBibliaCache);

        // Get all the capituloBibliaCacheList
        restCapituloBibliaCacheMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(capituloBibliaCache.getId().intValue())))
            .andExpect(jsonPath("$.[*].livroId").value(hasItem(DEFAULT_LIVRO_ID)))
            .andExpect(jsonPath("$.[*].livroNome").value(hasItem(DEFAULT_LIVRO_NOME)))
            .andExpect(jsonPath("$.[*].capitulo").value(hasItem(DEFAULT_CAPITULO)))
            .andExpect(jsonPath("$.[*].versao").value(hasItem(DEFAULT_VERSAO.toString())))
            .andExpect(jsonPath("$.[*].versiculosJson").value(hasItem(DEFAULT_VERSICULOS_JSON)))
            .andExpect(jsonPath("$.[*].cacheadoEm").value(hasItem(DEFAULT_CACHEADO_EM.toString())));
    }

    @Test
    @Transactional
    void getCapituloBibliaCache() throws Exception {
        // Initialize the database
        insertedCapituloBibliaCache = capituloBibliaCacheRepository.saveAndFlush(capituloBibliaCache);

        // Get the capituloBibliaCache
        restCapituloBibliaCacheMockMvc
            .perform(get(ENTITY_API_URL_ID, capituloBibliaCache.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(capituloBibliaCache.getId().intValue()))
            .andExpect(jsonPath("$.livroId").value(DEFAULT_LIVRO_ID))
            .andExpect(jsonPath("$.livroNome").value(DEFAULT_LIVRO_NOME))
            .andExpect(jsonPath("$.capitulo").value(DEFAULT_CAPITULO))
            .andExpect(jsonPath("$.versao").value(DEFAULT_VERSAO.toString()))
            .andExpect(jsonPath("$.versiculosJson").value(DEFAULT_VERSICULOS_JSON))
            .andExpect(jsonPath("$.cacheadoEm").value(DEFAULT_CACHEADO_EM.toString()));
    }

    @Test
    @Transactional
    void getNonExistingCapituloBibliaCache() throws Exception {
        // Get the capituloBibliaCache
        restCapituloBibliaCacheMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingCapituloBibliaCache() throws Exception {
        // Initialize the database
        insertedCapituloBibliaCache = capituloBibliaCacheRepository.saveAndFlush(capituloBibliaCache);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the capituloBibliaCache
        CapituloBibliaCache updatedCapituloBibliaCache = capituloBibliaCacheRepository.findById(capituloBibliaCache.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedCapituloBibliaCache are not directly saved in db
        em.detach(updatedCapituloBibliaCache);
        updatedCapituloBibliaCache
            .livroId(UPDATED_LIVRO_ID)
            .livroNome(UPDATED_LIVRO_NOME)
            .capitulo(UPDATED_CAPITULO)
            .versao(UPDATED_VERSAO)
            .versiculosJson(UPDATED_VERSICULOS_JSON)
            .cacheadoEm(UPDATED_CACHEADO_EM);

        restCapituloBibliaCacheMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedCapituloBibliaCache.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedCapituloBibliaCache))
            )
            .andExpect(status().isOk());

        // Validate the CapituloBibliaCache in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedCapituloBibliaCacheToMatchAllProperties(updatedCapituloBibliaCache);
    }

    @Test
    @Transactional
    void putNonExistingCapituloBibliaCache() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        capituloBibliaCache.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCapituloBibliaCacheMockMvc
            .perform(
                put(ENTITY_API_URL_ID, capituloBibliaCache.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(capituloBibliaCache))
            )
            .andExpect(status().isBadRequest());

        // Validate the CapituloBibliaCache in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchCapituloBibliaCache() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        capituloBibliaCache.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCapituloBibliaCacheMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(capituloBibliaCache))
            )
            .andExpect(status().isBadRequest());

        // Validate the CapituloBibliaCache in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamCapituloBibliaCache() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        capituloBibliaCache.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCapituloBibliaCacheMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(capituloBibliaCache)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the CapituloBibliaCache in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateCapituloBibliaCacheWithPatch() throws Exception {
        // Initialize the database
        insertedCapituloBibliaCache = capituloBibliaCacheRepository.saveAndFlush(capituloBibliaCache);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the capituloBibliaCache using partial update
        CapituloBibliaCache partialUpdatedCapituloBibliaCache = new CapituloBibliaCache();
        partialUpdatedCapituloBibliaCache.setId(capituloBibliaCache.getId());

        partialUpdatedCapituloBibliaCache.livroNome(UPDATED_LIVRO_NOME).cacheadoEm(UPDATED_CACHEADO_EM);

        restCapituloBibliaCacheMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCapituloBibliaCache.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedCapituloBibliaCache))
            )
            .andExpect(status().isOk());

        // Validate the CapituloBibliaCache in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertCapituloBibliaCacheUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedCapituloBibliaCache, capituloBibliaCache),
            getPersistedCapituloBibliaCache(capituloBibliaCache)
        );
    }

    @Test
    @Transactional
    void fullUpdateCapituloBibliaCacheWithPatch() throws Exception {
        // Initialize the database
        insertedCapituloBibliaCache = capituloBibliaCacheRepository.saveAndFlush(capituloBibliaCache);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the capituloBibliaCache using partial update
        CapituloBibliaCache partialUpdatedCapituloBibliaCache = new CapituloBibliaCache();
        partialUpdatedCapituloBibliaCache.setId(capituloBibliaCache.getId());

        partialUpdatedCapituloBibliaCache
            .livroId(UPDATED_LIVRO_ID)
            .livroNome(UPDATED_LIVRO_NOME)
            .capitulo(UPDATED_CAPITULO)
            .versao(UPDATED_VERSAO)
            .versiculosJson(UPDATED_VERSICULOS_JSON)
            .cacheadoEm(UPDATED_CACHEADO_EM);

        restCapituloBibliaCacheMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCapituloBibliaCache.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedCapituloBibliaCache))
            )
            .andExpect(status().isOk());

        // Validate the CapituloBibliaCache in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertCapituloBibliaCacheUpdatableFieldsEquals(
            partialUpdatedCapituloBibliaCache,
            getPersistedCapituloBibliaCache(partialUpdatedCapituloBibliaCache)
        );
    }

    @Test
    @Transactional
    void patchNonExistingCapituloBibliaCache() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        capituloBibliaCache.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCapituloBibliaCacheMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, capituloBibliaCache.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(capituloBibliaCache))
            )
            .andExpect(status().isBadRequest());

        // Validate the CapituloBibliaCache in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchCapituloBibliaCache() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        capituloBibliaCache.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCapituloBibliaCacheMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(capituloBibliaCache))
            )
            .andExpect(status().isBadRequest());

        // Validate the CapituloBibliaCache in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamCapituloBibliaCache() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        capituloBibliaCache.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCapituloBibliaCacheMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(capituloBibliaCache)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the CapituloBibliaCache in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteCapituloBibliaCache() throws Exception {
        // Initialize the database
        insertedCapituloBibliaCache = capituloBibliaCacheRepository.saveAndFlush(capituloBibliaCache);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the capituloBibliaCache
        restCapituloBibliaCacheMockMvc
            .perform(delete(ENTITY_API_URL_ID, capituloBibliaCache.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return capituloBibliaCacheRepository.count();
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

    protected CapituloBibliaCache getPersistedCapituloBibliaCache(CapituloBibliaCache capituloBibliaCache) {
        return capituloBibliaCacheRepository.findById(capituloBibliaCache.getId()).orElseThrow();
    }

    protected void assertPersistedCapituloBibliaCacheToMatchAllProperties(CapituloBibliaCache expectedCapituloBibliaCache) {
        assertCapituloBibliaCacheAllPropertiesEquals(
            expectedCapituloBibliaCache,
            getPersistedCapituloBibliaCache(expectedCapituloBibliaCache)
        );
    }

    protected void assertPersistedCapituloBibliaCacheToMatchUpdatableProperties(CapituloBibliaCache expectedCapituloBibliaCache) {
        assertCapituloBibliaCacheAllUpdatablePropertiesEquals(
            expectedCapituloBibliaCache,
            getPersistedCapituloBibliaCache(expectedCapituloBibliaCache)
        );
    }
}
