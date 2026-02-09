package br.com.semear.web.rest;

import static br.com.semear.domain.DiaPlanoLeituraAsserts.*;
import static br.com.semear.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import br.com.semear.IntegrationTest;
import br.com.semear.domain.DiaPlanoLeitura;
import br.com.semear.repository.DiaPlanoLeituraRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
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
 * Integration tests for the {@link DiaPlanoLeituraResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class DiaPlanoLeituraResourceIT {

    private static final Integer DEFAULT_NUMERO_DIA = 1;
    private static final Integer UPDATED_NUMERO_DIA = 2;

    private static final String DEFAULT_TITULO = "AAAAAAAAAA";
    private static final String UPDATED_TITULO = "BBBBBBBBBB";

    private static final String DEFAULT_LEITURAS_JSON = "AAAAAAAAAA";
    private static final String UPDATED_LEITURAS_JSON = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/dia-plano-leituras";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private DiaPlanoLeituraRepository diaPlanoLeituraRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restDiaPlanoLeituraMockMvc;

    private DiaPlanoLeitura diaPlanoLeitura;

    private DiaPlanoLeitura insertedDiaPlanoLeitura;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static DiaPlanoLeitura createEntity() {
        return new DiaPlanoLeitura().numeroDia(DEFAULT_NUMERO_DIA).titulo(DEFAULT_TITULO).leiturasJson(DEFAULT_LEITURAS_JSON);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static DiaPlanoLeitura createUpdatedEntity() {
        return new DiaPlanoLeitura().numeroDia(UPDATED_NUMERO_DIA).titulo(UPDATED_TITULO).leiturasJson(UPDATED_LEITURAS_JSON);
    }

    @BeforeEach
    void initTest() {
        diaPlanoLeitura = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedDiaPlanoLeitura != null) {
            diaPlanoLeituraRepository.delete(insertedDiaPlanoLeitura);
            insertedDiaPlanoLeitura = null;
        }
    }

    @Test
    @Transactional
    void createDiaPlanoLeitura() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the DiaPlanoLeitura
        var returnedDiaPlanoLeitura = om.readValue(
            restDiaPlanoLeituraMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(diaPlanoLeitura)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            DiaPlanoLeitura.class
        );

        // Validate the DiaPlanoLeitura in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertDiaPlanoLeituraUpdatableFieldsEquals(returnedDiaPlanoLeitura, getPersistedDiaPlanoLeitura(returnedDiaPlanoLeitura));

        insertedDiaPlanoLeitura = returnedDiaPlanoLeitura;
    }

    @Test
    @Transactional
    void createDiaPlanoLeituraWithExistingId() throws Exception {
        // Create the DiaPlanoLeitura with an existing ID
        diaPlanoLeitura.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restDiaPlanoLeituraMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(diaPlanoLeitura)))
            .andExpect(status().isBadRequest());

        // Validate the DiaPlanoLeitura in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNumeroDiaIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        diaPlanoLeitura.setNumeroDia(null);

        // Create the DiaPlanoLeitura, which fails.

        restDiaPlanoLeituraMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(diaPlanoLeitura)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllDiaPlanoLeituras() throws Exception {
        // Initialize the database
        insertedDiaPlanoLeitura = diaPlanoLeituraRepository.saveAndFlush(diaPlanoLeitura);

        // Get all the diaPlanoLeituraList
        restDiaPlanoLeituraMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(diaPlanoLeitura.getId().intValue())))
            .andExpect(jsonPath("$.[*].numeroDia").value(hasItem(DEFAULT_NUMERO_DIA)))
            .andExpect(jsonPath("$.[*].titulo").value(hasItem(DEFAULT_TITULO)))
            .andExpect(jsonPath("$.[*].leiturasJson").value(hasItem(DEFAULT_LEITURAS_JSON)));
    }

    @Test
    @Transactional
    void getDiaPlanoLeitura() throws Exception {
        // Initialize the database
        insertedDiaPlanoLeitura = diaPlanoLeituraRepository.saveAndFlush(diaPlanoLeitura);

        // Get the diaPlanoLeitura
        restDiaPlanoLeituraMockMvc
            .perform(get(ENTITY_API_URL_ID, diaPlanoLeitura.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(diaPlanoLeitura.getId().intValue()))
            .andExpect(jsonPath("$.numeroDia").value(DEFAULT_NUMERO_DIA))
            .andExpect(jsonPath("$.titulo").value(DEFAULT_TITULO))
            .andExpect(jsonPath("$.leiturasJson").value(DEFAULT_LEITURAS_JSON));
    }

    @Test
    @Transactional
    void getNonExistingDiaPlanoLeitura() throws Exception {
        // Get the diaPlanoLeitura
        restDiaPlanoLeituraMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingDiaPlanoLeitura() throws Exception {
        // Initialize the database
        insertedDiaPlanoLeitura = diaPlanoLeituraRepository.saveAndFlush(diaPlanoLeitura);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the diaPlanoLeitura
        DiaPlanoLeitura updatedDiaPlanoLeitura = diaPlanoLeituraRepository.findById(diaPlanoLeitura.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedDiaPlanoLeitura are not directly saved in db
        em.detach(updatedDiaPlanoLeitura);
        updatedDiaPlanoLeitura.numeroDia(UPDATED_NUMERO_DIA).titulo(UPDATED_TITULO).leiturasJson(UPDATED_LEITURAS_JSON);

        restDiaPlanoLeituraMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedDiaPlanoLeitura.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedDiaPlanoLeitura))
            )
            .andExpect(status().isOk());

        // Validate the DiaPlanoLeitura in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedDiaPlanoLeituraToMatchAllProperties(updatedDiaPlanoLeitura);
    }

    @Test
    @Transactional
    void putNonExistingDiaPlanoLeitura() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        diaPlanoLeitura.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDiaPlanoLeituraMockMvc
            .perform(
                put(ENTITY_API_URL_ID, diaPlanoLeitura.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(diaPlanoLeitura))
            )
            .andExpect(status().isBadRequest());

        // Validate the DiaPlanoLeitura in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchDiaPlanoLeitura() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        diaPlanoLeitura.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDiaPlanoLeituraMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(diaPlanoLeitura))
            )
            .andExpect(status().isBadRequest());

        // Validate the DiaPlanoLeitura in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamDiaPlanoLeitura() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        diaPlanoLeitura.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDiaPlanoLeituraMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(diaPlanoLeitura)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the DiaPlanoLeitura in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateDiaPlanoLeituraWithPatch() throws Exception {
        // Initialize the database
        insertedDiaPlanoLeitura = diaPlanoLeituraRepository.saveAndFlush(diaPlanoLeitura);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the diaPlanoLeitura using partial update
        DiaPlanoLeitura partialUpdatedDiaPlanoLeitura = new DiaPlanoLeitura();
        partialUpdatedDiaPlanoLeitura.setId(diaPlanoLeitura.getId());

        partialUpdatedDiaPlanoLeitura.titulo(UPDATED_TITULO).leiturasJson(UPDATED_LEITURAS_JSON);

        restDiaPlanoLeituraMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDiaPlanoLeitura.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedDiaPlanoLeitura))
            )
            .andExpect(status().isOk());

        // Validate the DiaPlanoLeitura in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertDiaPlanoLeituraUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedDiaPlanoLeitura, diaPlanoLeitura),
            getPersistedDiaPlanoLeitura(diaPlanoLeitura)
        );
    }

    @Test
    @Transactional
    void fullUpdateDiaPlanoLeituraWithPatch() throws Exception {
        // Initialize the database
        insertedDiaPlanoLeitura = diaPlanoLeituraRepository.saveAndFlush(diaPlanoLeitura);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the diaPlanoLeitura using partial update
        DiaPlanoLeitura partialUpdatedDiaPlanoLeitura = new DiaPlanoLeitura();
        partialUpdatedDiaPlanoLeitura.setId(diaPlanoLeitura.getId());

        partialUpdatedDiaPlanoLeitura.numeroDia(UPDATED_NUMERO_DIA).titulo(UPDATED_TITULO).leiturasJson(UPDATED_LEITURAS_JSON);

        restDiaPlanoLeituraMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDiaPlanoLeitura.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedDiaPlanoLeitura))
            )
            .andExpect(status().isOk());

        // Validate the DiaPlanoLeitura in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertDiaPlanoLeituraUpdatableFieldsEquals(
            partialUpdatedDiaPlanoLeitura,
            getPersistedDiaPlanoLeitura(partialUpdatedDiaPlanoLeitura)
        );
    }

    @Test
    @Transactional
    void patchNonExistingDiaPlanoLeitura() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        diaPlanoLeitura.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDiaPlanoLeituraMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, diaPlanoLeitura.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(diaPlanoLeitura))
            )
            .andExpect(status().isBadRequest());

        // Validate the DiaPlanoLeitura in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchDiaPlanoLeitura() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        diaPlanoLeitura.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDiaPlanoLeituraMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(diaPlanoLeitura))
            )
            .andExpect(status().isBadRequest());

        // Validate the DiaPlanoLeitura in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamDiaPlanoLeitura() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        diaPlanoLeitura.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDiaPlanoLeituraMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(diaPlanoLeitura)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the DiaPlanoLeitura in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteDiaPlanoLeitura() throws Exception {
        // Initialize the database
        insertedDiaPlanoLeitura = diaPlanoLeituraRepository.saveAndFlush(diaPlanoLeitura);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the diaPlanoLeitura
        restDiaPlanoLeituraMockMvc
            .perform(delete(ENTITY_API_URL_ID, diaPlanoLeitura.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return diaPlanoLeituraRepository.count();
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

    protected DiaPlanoLeitura getPersistedDiaPlanoLeitura(DiaPlanoLeitura diaPlanoLeitura) {
        return diaPlanoLeituraRepository.findById(diaPlanoLeitura.getId()).orElseThrow();
    }

    protected void assertPersistedDiaPlanoLeituraToMatchAllProperties(DiaPlanoLeitura expectedDiaPlanoLeitura) {
        assertDiaPlanoLeituraAllPropertiesEquals(expectedDiaPlanoLeitura, getPersistedDiaPlanoLeitura(expectedDiaPlanoLeitura));
    }

    protected void assertPersistedDiaPlanoLeituraToMatchUpdatableProperties(DiaPlanoLeitura expectedDiaPlanoLeitura) {
        assertDiaPlanoLeituraAllUpdatablePropertiesEquals(expectedDiaPlanoLeitura, getPersistedDiaPlanoLeitura(expectedDiaPlanoLeitura));
    }
}
