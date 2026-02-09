package br.com.semear.web.rest;

import static br.com.semear.domain.ProgressoLeituraUsuarioAsserts.*;
import static br.com.semear.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import br.com.semear.IntegrationTest;
import br.com.semear.domain.ProgressoLeituraUsuario;
import br.com.semear.repository.ProgressoLeituraUsuarioRepository;
import br.com.semear.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
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
 * Integration tests for the {@link ProgressoLeituraUsuarioResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class ProgressoLeituraUsuarioResourceIT {

    private static final LocalDate DEFAULT_DATA = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_DATA = LocalDate.now(ZoneId.systemDefault());

    private static final Boolean DEFAULT_CONCLUIDO = false;
    private static final Boolean UPDATED_CONCLUIDO = true;

    private static final Instant DEFAULT_CONCLUIDO_EM = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CONCLUIDO_EM = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Instant DEFAULT_CRIADO_EM = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CRIADO_EM = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Instant DEFAULT_ATUALIZADO_EM = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_ATUALIZADO_EM = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/progresso-leitura-usuarios";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ProgressoLeituraUsuarioRepository progressoLeituraUsuarioRepository;

    @Autowired
    private UserRepository userRepository;

    @Mock
    private ProgressoLeituraUsuarioRepository progressoLeituraUsuarioRepositoryMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restProgressoLeituraUsuarioMockMvc;

    private ProgressoLeituraUsuario progressoLeituraUsuario;

    private ProgressoLeituraUsuario insertedProgressoLeituraUsuario;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ProgressoLeituraUsuario createEntity() {
        return new ProgressoLeituraUsuario()
            .data(DEFAULT_DATA)
            .concluido(DEFAULT_CONCLUIDO)
            .concluidoEm(DEFAULT_CONCLUIDO_EM)
            .criadoEm(DEFAULT_CRIADO_EM)
            .atualizadoEm(DEFAULT_ATUALIZADO_EM);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ProgressoLeituraUsuario createUpdatedEntity() {
        return new ProgressoLeituraUsuario()
            .data(UPDATED_DATA)
            .concluido(UPDATED_CONCLUIDO)
            .concluidoEm(UPDATED_CONCLUIDO_EM)
            .criadoEm(UPDATED_CRIADO_EM)
            .atualizadoEm(UPDATED_ATUALIZADO_EM);
    }

    @BeforeEach
    void initTest() {
        progressoLeituraUsuario = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedProgressoLeituraUsuario != null) {
            progressoLeituraUsuarioRepository.delete(insertedProgressoLeituraUsuario);
            insertedProgressoLeituraUsuario = null;
        }
    }

    @Test
    @Transactional
    void createProgressoLeituraUsuario() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the ProgressoLeituraUsuario
        var returnedProgressoLeituraUsuario = om.readValue(
            restProgressoLeituraUsuarioMockMvc
                .perform(
                    post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(progressoLeituraUsuario))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            ProgressoLeituraUsuario.class
        );

        // Validate the ProgressoLeituraUsuario in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertProgressoLeituraUsuarioUpdatableFieldsEquals(
            returnedProgressoLeituraUsuario,
            getPersistedProgressoLeituraUsuario(returnedProgressoLeituraUsuario)
        );

        insertedProgressoLeituraUsuario = returnedProgressoLeituraUsuario;
    }

    @Test
    @Transactional
    void createProgressoLeituraUsuarioWithExistingId() throws Exception {
        // Create the ProgressoLeituraUsuario with an existing ID
        progressoLeituraUsuario.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restProgressoLeituraUsuarioMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(progressoLeituraUsuario)))
            .andExpect(status().isBadRequest());

        // Validate the ProgressoLeituraUsuario in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkDataIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        progressoLeituraUsuario.setData(null);

        // Create the ProgressoLeituraUsuario, which fails.

        restProgressoLeituraUsuarioMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(progressoLeituraUsuario)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkConcluidoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        progressoLeituraUsuario.setConcluido(null);

        // Create the ProgressoLeituraUsuario, which fails.

        restProgressoLeituraUsuarioMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(progressoLeituraUsuario)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCriadoEmIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        progressoLeituraUsuario.setCriadoEm(null);

        // Create the ProgressoLeituraUsuario, which fails.

        restProgressoLeituraUsuarioMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(progressoLeituraUsuario)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkAtualizadoEmIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        progressoLeituraUsuario.setAtualizadoEm(null);

        // Create the ProgressoLeituraUsuario, which fails.

        restProgressoLeituraUsuarioMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(progressoLeituraUsuario)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllProgressoLeituraUsuarios() throws Exception {
        // Initialize the database
        insertedProgressoLeituraUsuario = progressoLeituraUsuarioRepository.saveAndFlush(progressoLeituraUsuario);

        // Get all the progressoLeituraUsuarioList
        restProgressoLeituraUsuarioMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(progressoLeituraUsuario.getId().intValue())))
            .andExpect(jsonPath("$.[*].data").value(hasItem(DEFAULT_DATA.toString())))
            .andExpect(jsonPath("$.[*].concluido").value(hasItem(DEFAULT_CONCLUIDO)))
            .andExpect(jsonPath("$.[*].concluidoEm").value(hasItem(DEFAULT_CONCLUIDO_EM.toString())))
            .andExpect(jsonPath("$.[*].criadoEm").value(hasItem(DEFAULT_CRIADO_EM.toString())))
            .andExpect(jsonPath("$.[*].atualizadoEm").value(hasItem(DEFAULT_ATUALIZADO_EM.toString())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllProgressoLeituraUsuariosWithEagerRelationshipsIsEnabled() throws Exception {
        when(progressoLeituraUsuarioRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restProgressoLeituraUsuarioMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(progressoLeituraUsuarioRepositoryMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllProgressoLeituraUsuariosWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(progressoLeituraUsuarioRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restProgressoLeituraUsuarioMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(progressoLeituraUsuarioRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getProgressoLeituraUsuario() throws Exception {
        // Initialize the database
        insertedProgressoLeituraUsuario = progressoLeituraUsuarioRepository.saveAndFlush(progressoLeituraUsuario);

        // Get the progressoLeituraUsuario
        restProgressoLeituraUsuarioMockMvc
            .perform(get(ENTITY_API_URL_ID, progressoLeituraUsuario.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(progressoLeituraUsuario.getId().intValue()))
            .andExpect(jsonPath("$.data").value(DEFAULT_DATA.toString()))
            .andExpect(jsonPath("$.concluido").value(DEFAULT_CONCLUIDO))
            .andExpect(jsonPath("$.concluidoEm").value(DEFAULT_CONCLUIDO_EM.toString()))
            .andExpect(jsonPath("$.criadoEm").value(DEFAULT_CRIADO_EM.toString()))
            .andExpect(jsonPath("$.atualizadoEm").value(DEFAULT_ATUALIZADO_EM.toString()));
    }

    @Test
    @Transactional
    void getNonExistingProgressoLeituraUsuario() throws Exception {
        // Get the progressoLeituraUsuario
        restProgressoLeituraUsuarioMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingProgressoLeituraUsuario() throws Exception {
        // Initialize the database
        insertedProgressoLeituraUsuario = progressoLeituraUsuarioRepository.saveAndFlush(progressoLeituraUsuario);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the progressoLeituraUsuario
        ProgressoLeituraUsuario updatedProgressoLeituraUsuario = progressoLeituraUsuarioRepository
            .findById(progressoLeituraUsuario.getId())
            .orElseThrow();
        // Disconnect from session so that the updates on updatedProgressoLeituraUsuario are not directly saved in db
        em.detach(updatedProgressoLeituraUsuario);
        updatedProgressoLeituraUsuario
            .data(UPDATED_DATA)
            .concluido(UPDATED_CONCLUIDO)
            .concluidoEm(UPDATED_CONCLUIDO_EM)
            .criadoEm(UPDATED_CRIADO_EM)
            .atualizadoEm(UPDATED_ATUALIZADO_EM);

        restProgressoLeituraUsuarioMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedProgressoLeituraUsuario.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedProgressoLeituraUsuario))
            )
            .andExpect(status().isOk());

        // Validate the ProgressoLeituraUsuario in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedProgressoLeituraUsuarioToMatchAllProperties(updatedProgressoLeituraUsuario);
    }

    @Test
    @Transactional
    void putNonExistingProgressoLeituraUsuario() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        progressoLeituraUsuario.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restProgressoLeituraUsuarioMockMvc
            .perform(
                put(ENTITY_API_URL_ID, progressoLeituraUsuario.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(progressoLeituraUsuario))
            )
            .andExpect(status().isBadRequest());

        // Validate the ProgressoLeituraUsuario in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchProgressoLeituraUsuario() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        progressoLeituraUsuario.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restProgressoLeituraUsuarioMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(progressoLeituraUsuario))
            )
            .andExpect(status().isBadRequest());

        // Validate the ProgressoLeituraUsuario in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamProgressoLeituraUsuario() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        progressoLeituraUsuario.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restProgressoLeituraUsuarioMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(progressoLeituraUsuario)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the ProgressoLeituraUsuario in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateProgressoLeituraUsuarioWithPatch() throws Exception {
        // Initialize the database
        insertedProgressoLeituraUsuario = progressoLeituraUsuarioRepository.saveAndFlush(progressoLeituraUsuario);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the progressoLeituraUsuario using partial update
        ProgressoLeituraUsuario partialUpdatedProgressoLeituraUsuario = new ProgressoLeituraUsuario();
        partialUpdatedProgressoLeituraUsuario.setId(progressoLeituraUsuario.getId());

        partialUpdatedProgressoLeituraUsuario.concluidoEm(UPDATED_CONCLUIDO_EM).atualizadoEm(UPDATED_ATUALIZADO_EM);

        restProgressoLeituraUsuarioMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedProgressoLeituraUsuario.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedProgressoLeituraUsuario))
            )
            .andExpect(status().isOk());

        // Validate the ProgressoLeituraUsuario in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertProgressoLeituraUsuarioUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedProgressoLeituraUsuario, progressoLeituraUsuario),
            getPersistedProgressoLeituraUsuario(progressoLeituraUsuario)
        );
    }

    @Test
    @Transactional
    void fullUpdateProgressoLeituraUsuarioWithPatch() throws Exception {
        // Initialize the database
        insertedProgressoLeituraUsuario = progressoLeituraUsuarioRepository.saveAndFlush(progressoLeituraUsuario);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the progressoLeituraUsuario using partial update
        ProgressoLeituraUsuario partialUpdatedProgressoLeituraUsuario = new ProgressoLeituraUsuario();
        partialUpdatedProgressoLeituraUsuario.setId(progressoLeituraUsuario.getId());

        partialUpdatedProgressoLeituraUsuario
            .data(UPDATED_DATA)
            .concluido(UPDATED_CONCLUIDO)
            .concluidoEm(UPDATED_CONCLUIDO_EM)
            .criadoEm(UPDATED_CRIADO_EM)
            .atualizadoEm(UPDATED_ATUALIZADO_EM);

        restProgressoLeituraUsuarioMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedProgressoLeituraUsuario.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedProgressoLeituraUsuario))
            )
            .andExpect(status().isOk());

        // Validate the ProgressoLeituraUsuario in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertProgressoLeituraUsuarioUpdatableFieldsEquals(
            partialUpdatedProgressoLeituraUsuario,
            getPersistedProgressoLeituraUsuario(partialUpdatedProgressoLeituraUsuario)
        );
    }

    @Test
    @Transactional
    void patchNonExistingProgressoLeituraUsuario() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        progressoLeituraUsuario.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restProgressoLeituraUsuarioMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, progressoLeituraUsuario.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(progressoLeituraUsuario))
            )
            .andExpect(status().isBadRequest());

        // Validate the ProgressoLeituraUsuario in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchProgressoLeituraUsuario() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        progressoLeituraUsuario.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restProgressoLeituraUsuarioMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(progressoLeituraUsuario))
            )
            .andExpect(status().isBadRequest());

        // Validate the ProgressoLeituraUsuario in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamProgressoLeituraUsuario() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        progressoLeituraUsuario.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restProgressoLeituraUsuarioMockMvc
            .perform(
                patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(progressoLeituraUsuario))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the ProgressoLeituraUsuario in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteProgressoLeituraUsuario() throws Exception {
        // Initialize the database
        insertedProgressoLeituraUsuario = progressoLeituraUsuarioRepository.saveAndFlush(progressoLeituraUsuario);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the progressoLeituraUsuario
        restProgressoLeituraUsuarioMockMvc
            .perform(delete(ENTITY_API_URL_ID, progressoLeituraUsuario.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return progressoLeituraUsuarioRepository.count();
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

    protected ProgressoLeituraUsuario getPersistedProgressoLeituraUsuario(ProgressoLeituraUsuario progressoLeituraUsuario) {
        return progressoLeituraUsuarioRepository.findById(progressoLeituraUsuario.getId()).orElseThrow();
    }

    protected void assertPersistedProgressoLeituraUsuarioToMatchAllProperties(ProgressoLeituraUsuario expectedProgressoLeituraUsuario) {
        assertProgressoLeituraUsuarioAllPropertiesEquals(
            expectedProgressoLeituraUsuario,
            getPersistedProgressoLeituraUsuario(expectedProgressoLeituraUsuario)
        );
    }

    protected void assertPersistedProgressoLeituraUsuarioToMatchUpdatableProperties(
        ProgressoLeituraUsuario expectedProgressoLeituraUsuario
    ) {
        assertProgressoLeituraUsuarioAllUpdatablePropertiesEquals(
            expectedProgressoLeituraUsuario,
            getPersistedProgressoLeituraUsuario(expectedProgressoLeituraUsuario)
        );
    }
}
