package br.com.semear.web.rest;

import static br.com.semear.domain.PlanoLeituraAsserts.*;
import static br.com.semear.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import br.com.semear.IntegrationTest;
import br.com.semear.domain.PlanoLeitura;
import br.com.semear.domain.enumeration.TipoPlanoLeitura;
import br.com.semear.repository.PlanoLeituraRepository;
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
 * Integration tests for the {@link PlanoLeituraResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class PlanoLeituraResourceIT {

    private static final String DEFAULT_NOME = "AAAAAAAAAA";
    private static final String UPDATED_NOME = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRICAO = "AAAAAAAAAA";
    private static final String UPDATED_DESCRICAO = "BBBBBBBBBB";

    private static final TipoPlanoLeitura DEFAULT_TIPO = TipoPlanoLeitura.PRE_DEFINIDO;
    private static final TipoPlanoLeitura UPDATED_TIPO = TipoPlanoLeitura.IGREJA;

    private static final Boolean DEFAULT_ATIVO = false;
    private static final Boolean UPDATED_ATIVO = true;

    private static final Instant DEFAULT_CRIADO_EM = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CRIADO_EM = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Instant DEFAULT_ATUALIZADO_EM = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_ATUALIZADO_EM = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/plano-leituras";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private PlanoLeituraRepository planoLeituraRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restPlanoLeituraMockMvc;

    private PlanoLeitura planoLeitura;

    private PlanoLeitura insertedPlanoLeitura;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static PlanoLeitura createEntity() {
        return new PlanoLeitura()
            .nome(DEFAULT_NOME)
            .descricao(DEFAULT_DESCRICAO)
            .tipo(DEFAULT_TIPO)
            .ativo(DEFAULT_ATIVO)
            .criadoEm(DEFAULT_CRIADO_EM)
            .atualizadoEm(DEFAULT_ATUALIZADO_EM);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static PlanoLeitura createUpdatedEntity() {
        return new PlanoLeitura()
            .nome(UPDATED_NOME)
            .descricao(UPDATED_DESCRICAO)
            .tipo(UPDATED_TIPO)
            .ativo(UPDATED_ATIVO)
            .criadoEm(UPDATED_CRIADO_EM)
            .atualizadoEm(UPDATED_ATUALIZADO_EM);
    }

    @BeforeEach
    void initTest() {
        planoLeitura = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedPlanoLeitura != null) {
            planoLeituraRepository.delete(insertedPlanoLeitura);
            insertedPlanoLeitura = null;
        }
    }

    @Test
    @Transactional
    void createPlanoLeitura() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the PlanoLeitura
        var returnedPlanoLeitura = om.readValue(
            restPlanoLeituraMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(planoLeitura)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            PlanoLeitura.class
        );

        // Validate the PlanoLeitura in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertPlanoLeituraUpdatableFieldsEquals(returnedPlanoLeitura, getPersistedPlanoLeitura(returnedPlanoLeitura));

        insertedPlanoLeitura = returnedPlanoLeitura;
    }

    @Test
    @Transactional
    void createPlanoLeituraWithExistingId() throws Exception {
        // Create the PlanoLeitura with an existing ID
        planoLeitura.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restPlanoLeituraMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(planoLeitura)))
            .andExpect(status().isBadRequest());

        // Validate the PlanoLeitura in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNomeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        planoLeitura.setNome(null);

        // Create the PlanoLeitura, which fails.

        restPlanoLeituraMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(planoLeitura)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTipoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        planoLeitura.setTipo(null);

        // Create the PlanoLeitura, which fails.

        restPlanoLeituraMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(planoLeitura)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkAtivoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        planoLeitura.setAtivo(null);

        // Create the PlanoLeitura, which fails.

        restPlanoLeituraMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(planoLeitura)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCriadoEmIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        planoLeitura.setCriadoEm(null);

        // Create the PlanoLeitura, which fails.

        restPlanoLeituraMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(planoLeitura)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkAtualizadoEmIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        planoLeitura.setAtualizadoEm(null);

        // Create the PlanoLeitura, which fails.

        restPlanoLeituraMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(planoLeitura)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllPlanoLeituras() throws Exception {
        // Initialize the database
        insertedPlanoLeitura = planoLeituraRepository.saveAndFlush(planoLeitura);

        // Get all the planoLeituraList
        restPlanoLeituraMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(planoLeitura.getId().intValue())))
            .andExpect(jsonPath("$.[*].nome").value(hasItem(DEFAULT_NOME)))
            .andExpect(jsonPath("$.[*].descricao").value(hasItem(DEFAULT_DESCRICAO)))
            .andExpect(jsonPath("$.[*].tipo").value(hasItem(DEFAULT_TIPO.toString())))
            .andExpect(jsonPath("$.[*].ativo").value(hasItem(DEFAULT_ATIVO)))
            .andExpect(jsonPath("$.[*].criadoEm").value(hasItem(DEFAULT_CRIADO_EM.toString())))
            .andExpect(jsonPath("$.[*].atualizadoEm").value(hasItem(DEFAULT_ATUALIZADO_EM.toString())));
    }

    @Test
    @Transactional
    void getPlanoLeitura() throws Exception {
        // Initialize the database
        insertedPlanoLeitura = planoLeituraRepository.saveAndFlush(planoLeitura);

        // Get the planoLeitura
        restPlanoLeituraMockMvc
            .perform(get(ENTITY_API_URL_ID, planoLeitura.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(planoLeitura.getId().intValue()))
            .andExpect(jsonPath("$.nome").value(DEFAULT_NOME))
            .andExpect(jsonPath("$.descricao").value(DEFAULT_DESCRICAO))
            .andExpect(jsonPath("$.tipo").value(DEFAULT_TIPO.toString()))
            .andExpect(jsonPath("$.ativo").value(DEFAULT_ATIVO))
            .andExpect(jsonPath("$.criadoEm").value(DEFAULT_CRIADO_EM.toString()))
            .andExpect(jsonPath("$.atualizadoEm").value(DEFAULT_ATUALIZADO_EM.toString()));
    }

    @Test
    @Transactional
    void getNonExistingPlanoLeitura() throws Exception {
        // Get the planoLeitura
        restPlanoLeituraMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingPlanoLeitura() throws Exception {
        // Initialize the database
        insertedPlanoLeitura = planoLeituraRepository.saveAndFlush(planoLeitura);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the planoLeitura
        PlanoLeitura updatedPlanoLeitura = planoLeituraRepository.findById(planoLeitura.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedPlanoLeitura are not directly saved in db
        em.detach(updatedPlanoLeitura);
        updatedPlanoLeitura
            .nome(UPDATED_NOME)
            .descricao(UPDATED_DESCRICAO)
            .tipo(UPDATED_TIPO)
            .ativo(UPDATED_ATIVO)
            .criadoEm(UPDATED_CRIADO_EM)
            .atualizadoEm(UPDATED_ATUALIZADO_EM);

        restPlanoLeituraMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedPlanoLeitura.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedPlanoLeitura))
            )
            .andExpect(status().isOk());

        // Validate the PlanoLeitura in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedPlanoLeituraToMatchAllProperties(updatedPlanoLeitura);
    }

    @Test
    @Transactional
    void putNonExistingPlanoLeitura() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        planoLeitura.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPlanoLeituraMockMvc
            .perform(
                put(ENTITY_API_URL_ID, planoLeitura.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(planoLeitura))
            )
            .andExpect(status().isBadRequest());

        // Validate the PlanoLeitura in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchPlanoLeitura() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        planoLeitura.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPlanoLeituraMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(planoLeitura))
            )
            .andExpect(status().isBadRequest());

        // Validate the PlanoLeitura in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamPlanoLeitura() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        planoLeitura.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPlanoLeituraMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(planoLeitura)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the PlanoLeitura in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdatePlanoLeituraWithPatch() throws Exception {
        // Initialize the database
        insertedPlanoLeitura = planoLeituraRepository.saveAndFlush(planoLeitura);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the planoLeitura using partial update
        PlanoLeitura partialUpdatedPlanoLeitura = new PlanoLeitura();
        partialUpdatedPlanoLeitura.setId(planoLeitura.getId());

        partialUpdatedPlanoLeitura.criadoEm(UPDATED_CRIADO_EM).atualizadoEm(UPDATED_ATUALIZADO_EM);

        restPlanoLeituraMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPlanoLeitura.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPlanoLeitura))
            )
            .andExpect(status().isOk());

        // Validate the PlanoLeitura in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPlanoLeituraUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedPlanoLeitura, planoLeitura),
            getPersistedPlanoLeitura(planoLeitura)
        );
    }

    @Test
    @Transactional
    void fullUpdatePlanoLeituraWithPatch() throws Exception {
        // Initialize the database
        insertedPlanoLeitura = planoLeituraRepository.saveAndFlush(planoLeitura);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the planoLeitura using partial update
        PlanoLeitura partialUpdatedPlanoLeitura = new PlanoLeitura();
        partialUpdatedPlanoLeitura.setId(planoLeitura.getId());

        partialUpdatedPlanoLeitura
            .nome(UPDATED_NOME)
            .descricao(UPDATED_DESCRICAO)
            .tipo(UPDATED_TIPO)
            .ativo(UPDATED_ATIVO)
            .criadoEm(UPDATED_CRIADO_EM)
            .atualizadoEm(UPDATED_ATUALIZADO_EM);

        restPlanoLeituraMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPlanoLeitura.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPlanoLeitura))
            )
            .andExpect(status().isOk());

        // Validate the PlanoLeitura in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPlanoLeituraUpdatableFieldsEquals(partialUpdatedPlanoLeitura, getPersistedPlanoLeitura(partialUpdatedPlanoLeitura));
    }

    @Test
    @Transactional
    void patchNonExistingPlanoLeitura() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        planoLeitura.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPlanoLeituraMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, planoLeitura.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(planoLeitura))
            )
            .andExpect(status().isBadRequest());

        // Validate the PlanoLeitura in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchPlanoLeitura() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        planoLeitura.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPlanoLeituraMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(planoLeitura))
            )
            .andExpect(status().isBadRequest());

        // Validate the PlanoLeitura in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamPlanoLeitura() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        planoLeitura.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPlanoLeituraMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(planoLeitura)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the PlanoLeitura in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deletePlanoLeitura() throws Exception {
        // Initialize the database
        insertedPlanoLeitura = planoLeituraRepository.saveAndFlush(planoLeitura);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the planoLeitura
        restPlanoLeituraMockMvc
            .perform(delete(ENTITY_API_URL_ID, planoLeitura.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return planoLeituraRepository.count();
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

    protected PlanoLeitura getPersistedPlanoLeitura(PlanoLeitura planoLeitura) {
        return planoLeituraRepository.findById(planoLeitura.getId()).orElseThrow();
    }

    protected void assertPersistedPlanoLeituraToMatchAllProperties(PlanoLeitura expectedPlanoLeitura) {
        assertPlanoLeituraAllPropertiesEquals(expectedPlanoLeitura, getPersistedPlanoLeitura(expectedPlanoLeitura));
    }

    protected void assertPersistedPlanoLeituraToMatchUpdatableProperties(PlanoLeitura expectedPlanoLeitura) {
        assertPlanoLeituraAllUpdatablePropertiesEquals(expectedPlanoLeitura, getPersistedPlanoLeitura(expectedPlanoLeitura));
    }
}
