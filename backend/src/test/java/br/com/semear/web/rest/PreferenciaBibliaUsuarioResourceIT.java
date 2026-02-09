package br.com.semear.web.rest;

import static br.com.semear.domain.PreferenciaBibliaUsuarioAsserts.*;
import static br.com.semear.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import br.com.semear.IntegrationTest;
import br.com.semear.domain.PreferenciaBibliaUsuario;
import br.com.semear.domain.enumeration.ModoBiblia;
import br.com.semear.domain.enumeration.TamanhoFonte;
import br.com.semear.domain.enumeration.Tema;
import br.com.semear.repository.PreferenciaBibliaUsuarioRepository;
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
 * Integration tests for the {@link PreferenciaBibliaUsuarioResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class PreferenciaBibliaUsuarioResourceIT {

    private static final ModoBiblia DEFAULT_MODO = ModoBiblia.LEITURA;
    private static final ModoBiblia UPDATED_MODO = ModoBiblia.ESTUDO;

    private static final TamanhoFonte DEFAULT_TAMANHO_FONTE = TamanhoFonte.PEQUENA;
    private static final TamanhoFonte UPDATED_TAMANHO_FONTE = TamanhoFonte.MEDIA;

    private static final Tema DEFAULT_TEMA = Tema.SISTEMA;
    private static final Tema UPDATED_TEMA = Tema.CLARO;

    private static final Boolean DEFAULT_MOSTRAR_DESTAQUES = false;
    private static final Boolean UPDATED_MOSTRAR_DESTAQUES = true;

    private static final Boolean DEFAULT_MOSTRAR_NOTAS = false;
    private static final Boolean UPDATED_MOSTRAR_NOTAS = true;

    private static final Boolean DEFAULT_MOSTRAR_FAVORITOS = false;
    private static final Boolean UPDATED_MOSTRAR_FAVORITOS = true;

    private static final Instant DEFAULT_CRIADO_EM = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CRIADO_EM = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Instant DEFAULT_ATUALIZADO_EM = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_ATUALIZADO_EM = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/preferencia-biblia-usuarios";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private PreferenciaBibliaUsuarioRepository preferenciaBibliaUsuarioRepository;

    @Autowired
    private UserRepository userRepository;

    @Mock
    private PreferenciaBibliaUsuarioRepository preferenciaBibliaUsuarioRepositoryMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restPreferenciaBibliaUsuarioMockMvc;

    private PreferenciaBibliaUsuario preferenciaBibliaUsuario;

    private PreferenciaBibliaUsuario insertedPreferenciaBibliaUsuario;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static PreferenciaBibliaUsuario createEntity() {
        return new PreferenciaBibliaUsuario()
            .modo(DEFAULT_MODO)
            .tamanhoFonte(DEFAULT_TAMANHO_FONTE)
            .tema(DEFAULT_TEMA)
            .mostrarDestaques(DEFAULT_MOSTRAR_DESTAQUES)
            .mostrarNotas(DEFAULT_MOSTRAR_NOTAS)
            .mostrarFavoritos(DEFAULT_MOSTRAR_FAVORITOS)
            .criadoEm(DEFAULT_CRIADO_EM)
            .atualizadoEm(DEFAULT_ATUALIZADO_EM);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static PreferenciaBibliaUsuario createUpdatedEntity() {
        return new PreferenciaBibliaUsuario()
            .modo(UPDATED_MODO)
            .tamanhoFonte(UPDATED_TAMANHO_FONTE)
            .tema(UPDATED_TEMA)
            .mostrarDestaques(UPDATED_MOSTRAR_DESTAQUES)
            .mostrarNotas(UPDATED_MOSTRAR_NOTAS)
            .mostrarFavoritos(UPDATED_MOSTRAR_FAVORITOS)
            .criadoEm(UPDATED_CRIADO_EM)
            .atualizadoEm(UPDATED_ATUALIZADO_EM);
    }

    @BeforeEach
    void initTest() {
        preferenciaBibliaUsuario = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedPreferenciaBibliaUsuario != null) {
            preferenciaBibliaUsuarioRepository.delete(insertedPreferenciaBibliaUsuario);
            insertedPreferenciaBibliaUsuario = null;
        }
    }

    @Test
    @Transactional
    void createPreferenciaBibliaUsuario() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the PreferenciaBibliaUsuario
        var returnedPreferenciaBibliaUsuario = om.readValue(
            restPreferenciaBibliaUsuarioMockMvc
                .perform(
                    post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(preferenciaBibliaUsuario))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            PreferenciaBibliaUsuario.class
        );

        // Validate the PreferenciaBibliaUsuario in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertPreferenciaBibliaUsuarioUpdatableFieldsEquals(
            returnedPreferenciaBibliaUsuario,
            getPersistedPreferenciaBibliaUsuario(returnedPreferenciaBibliaUsuario)
        );

        insertedPreferenciaBibliaUsuario = returnedPreferenciaBibliaUsuario;
    }

    @Test
    @Transactional
    void createPreferenciaBibliaUsuarioWithExistingId() throws Exception {
        // Create the PreferenciaBibliaUsuario with an existing ID
        preferenciaBibliaUsuario.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restPreferenciaBibliaUsuarioMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(preferenciaBibliaUsuario)))
            .andExpect(status().isBadRequest());

        // Validate the PreferenciaBibliaUsuario in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkModoIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        preferenciaBibliaUsuario.setModo(null);

        // Create the PreferenciaBibliaUsuario, which fails.

        restPreferenciaBibliaUsuarioMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(preferenciaBibliaUsuario)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTamanhoFonteIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        preferenciaBibliaUsuario.setTamanhoFonte(null);

        // Create the PreferenciaBibliaUsuario, which fails.

        restPreferenciaBibliaUsuarioMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(preferenciaBibliaUsuario)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTemaIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        preferenciaBibliaUsuario.setTema(null);

        // Create the PreferenciaBibliaUsuario, which fails.

        restPreferenciaBibliaUsuarioMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(preferenciaBibliaUsuario)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkMostrarDestaquesIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        preferenciaBibliaUsuario.setMostrarDestaques(null);

        // Create the PreferenciaBibliaUsuario, which fails.

        restPreferenciaBibliaUsuarioMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(preferenciaBibliaUsuario)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkMostrarNotasIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        preferenciaBibliaUsuario.setMostrarNotas(null);

        // Create the PreferenciaBibliaUsuario, which fails.

        restPreferenciaBibliaUsuarioMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(preferenciaBibliaUsuario)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkMostrarFavoritosIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        preferenciaBibliaUsuario.setMostrarFavoritos(null);

        // Create the PreferenciaBibliaUsuario, which fails.

        restPreferenciaBibliaUsuarioMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(preferenciaBibliaUsuario)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCriadoEmIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        preferenciaBibliaUsuario.setCriadoEm(null);

        // Create the PreferenciaBibliaUsuario, which fails.

        restPreferenciaBibliaUsuarioMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(preferenciaBibliaUsuario)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkAtualizadoEmIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        preferenciaBibliaUsuario.setAtualizadoEm(null);

        // Create the PreferenciaBibliaUsuario, which fails.

        restPreferenciaBibliaUsuarioMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(preferenciaBibliaUsuario)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllPreferenciaBibliaUsuarios() throws Exception {
        // Initialize the database
        insertedPreferenciaBibliaUsuario = preferenciaBibliaUsuarioRepository.saveAndFlush(preferenciaBibliaUsuario);

        // Get all the preferenciaBibliaUsuarioList
        restPreferenciaBibliaUsuarioMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(preferenciaBibliaUsuario.getId().intValue())))
            .andExpect(jsonPath("$.[*].modo").value(hasItem(DEFAULT_MODO.toString())))
            .andExpect(jsonPath("$.[*].tamanhoFonte").value(hasItem(DEFAULT_TAMANHO_FONTE.toString())))
            .andExpect(jsonPath("$.[*].tema").value(hasItem(DEFAULT_TEMA.toString())))
            .andExpect(jsonPath("$.[*].mostrarDestaques").value(hasItem(DEFAULT_MOSTRAR_DESTAQUES)))
            .andExpect(jsonPath("$.[*].mostrarNotas").value(hasItem(DEFAULT_MOSTRAR_NOTAS)))
            .andExpect(jsonPath("$.[*].mostrarFavoritos").value(hasItem(DEFAULT_MOSTRAR_FAVORITOS)))
            .andExpect(jsonPath("$.[*].criadoEm").value(hasItem(DEFAULT_CRIADO_EM.toString())))
            .andExpect(jsonPath("$.[*].atualizadoEm").value(hasItem(DEFAULT_ATUALIZADO_EM.toString())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllPreferenciaBibliaUsuariosWithEagerRelationshipsIsEnabled() throws Exception {
        when(preferenciaBibliaUsuarioRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restPreferenciaBibliaUsuarioMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(preferenciaBibliaUsuarioRepositoryMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllPreferenciaBibliaUsuariosWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(preferenciaBibliaUsuarioRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restPreferenciaBibliaUsuarioMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(preferenciaBibliaUsuarioRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getPreferenciaBibliaUsuario() throws Exception {
        // Initialize the database
        insertedPreferenciaBibliaUsuario = preferenciaBibliaUsuarioRepository.saveAndFlush(preferenciaBibliaUsuario);

        // Get the preferenciaBibliaUsuario
        restPreferenciaBibliaUsuarioMockMvc
            .perform(get(ENTITY_API_URL_ID, preferenciaBibliaUsuario.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(preferenciaBibliaUsuario.getId().intValue()))
            .andExpect(jsonPath("$.modo").value(DEFAULT_MODO.toString()))
            .andExpect(jsonPath("$.tamanhoFonte").value(DEFAULT_TAMANHO_FONTE.toString()))
            .andExpect(jsonPath("$.tema").value(DEFAULT_TEMA.toString()))
            .andExpect(jsonPath("$.mostrarDestaques").value(DEFAULT_MOSTRAR_DESTAQUES))
            .andExpect(jsonPath("$.mostrarNotas").value(DEFAULT_MOSTRAR_NOTAS))
            .andExpect(jsonPath("$.mostrarFavoritos").value(DEFAULT_MOSTRAR_FAVORITOS))
            .andExpect(jsonPath("$.criadoEm").value(DEFAULT_CRIADO_EM.toString()))
            .andExpect(jsonPath("$.atualizadoEm").value(DEFAULT_ATUALIZADO_EM.toString()));
    }

    @Test
    @Transactional
    void getNonExistingPreferenciaBibliaUsuario() throws Exception {
        // Get the preferenciaBibliaUsuario
        restPreferenciaBibliaUsuarioMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingPreferenciaBibliaUsuario() throws Exception {
        // Initialize the database
        insertedPreferenciaBibliaUsuario = preferenciaBibliaUsuarioRepository.saveAndFlush(preferenciaBibliaUsuario);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the preferenciaBibliaUsuario
        PreferenciaBibliaUsuario updatedPreferenciaBibliaUsuario = preferenciaBibliaUsuarioRepository
            .findById(preferenciaBibliaUsuario.getId())
            .orElseThrow();
        // Disconnect from session so that the updates on updatedPreferenciaBibliaUsuario are not directly saved in db
        em.detach(updatedPreferenciaBibliaUsuario);
        updatedPreferenciaBibliaUsuario
            .modo(UPDATED_MODO)
            .tamanhoFonte(UPDATED_TAMANHO_FONTE)
            .tema(UPDATED_TEMA)
            .mostrarDestaques(UPDATED_MOSTRAR_DESTAQUES)
            .mostrarNotas(UPDATED_MOSTRAR_NOTAS)
            .mostrarFavoritos(UPDATED_MOSTRAR_FAVORITOS)
            .criadoEm(UPDATED_CRIADO_EM)
            .atualizadoEm(UPDATED_ATUALIZADO_EM);

        restPreferenciaBibliaUsuarioMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedPreferenciaBibliaUsuario.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedPreferenciaBibliaUsuario))
            )
            .andExpect(status().isOk());

        // Validate the PreferenciaBibliaUsuario in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedPreferenciaBibliaUsuarioToMatchAllProperties(updatedPreferenciaBibliaUsuario);
    }

    @Test
    @Transactional
    void putNonExistingPreferenciaBibliaUsuario() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        preferenciaBibliaUsuario.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPreferenciaBibliaUsuarioMockMvc
            .perform(
                put(ENTITY_API_URL_ID, preferenciaBibliaUsuario.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(preferenciaBibliaUsuario))
            )
            .andExpect(status().isBadRequest());

        // Validate the PreferenciaBibliaUsuario in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchPreferenciaBibliaUsuario() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        preferenciaBibliaUsuario.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPreferenciaBibliaUsuarioMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(preferenciaBibliaUsuario))
            )
            .andExpect(status().isBadRequest());

        // Validate the PreferenciaBibliaUsuario in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamPreferenciaBibliaUsuario() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        preferenciaBibliaUsuario.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPreferenciaBibliaUsuarioMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(preferenciaBibliaUsuario)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the PreferenciaBibliaUsuario in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdatePreferenciaBibliaUsuarioWithPatch() throws Exception {
        // Initialize the database
        insertedPreferenciaBibliaUsuario = preferenciaBibliaUsuarioRepository.saveAndFlush(preferenciaBibliaUsuario);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the preferenciaBibliaUsuario using partial update
        PreferenciaBibliaUsuario partialUpdatedPreferenciaBibliaUsuario = new PreferenciaBibliaUsuario();
        partialUpdatedPreferenciaBibliaUsuario.setId(preferenciaBibliaUsuario.getId());

        partialUpdatedPreferenciaBibliaUsuario
            .modo(UPDATED_MODO)
            .mostrarNotas(UPDATED_MOSTRAR_NOTAS)
            .mostrarFavoritos(UPDATED_MOSTRAR_FAVORITOS)
            .atualizadoEm(UPDATED_ATUALIZADO_EM);

        restPreferenciaBibliaUsuarioMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPreferenciaBibliaUsuario.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPreferenciaBibliaUsuario))
            )
            .andExpect(status().isOk());

        // Validate the PreferenciaBibliaUsuario in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPreferenciaBibliaUsuarioUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedPreferenciaBibliaUsuario, preferenciaBibliaUsuario),
            getPersistedPreferenciaBibliaUsuario(preferenciaBibliaUsuario)
        );
    }

    @Test
    @Transactional
    void fullUpdatePreferenciaBibliaUsuarioWithPatch() throws Exception {
        // Initialize the database
        insertedPreferenciaBibliaUsuario = preferenciaBibliaUsuarioRepository.saveAndFlush(preferenciaBibliaUsuario);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the preferenciaBibliaUsuario using partial update
        PreferenciaBibliaUsuario partialUpdatedPreferenciaBibliaUsuario = new PreferenciaBibliaUsuario();
        partialUpdatedPreferenciaBibliaUsuario.setId(preferenciaBibliaUsuario.getId());

        partialUpdatedPreferenciaBibliaUsuario
            .modo(UPDATED_MODO)
            .tamanhoFonte(UPDATED_TAMANHO_FONTE)
            .tema(UPDATED_TEMA)
            .mostrarDestaques(UPDATED_MOSTRAR_DESTAQUES)
            .mostrarNotas(UPDATED_MOSTRAR_NOTAS)
            .mostrarFavoritos(UPDATED_MOSTRAR_FAVORITOS)
            .criadoEm(UPDATED_CRIADO_EM)
            .atualizadoEm(UPDATED_ATUALIZADO_EM);

        restPreferenciaBibliaUsuarioMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPreferenciaBibliaUsuario.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPreferenciaBibliaUsuario))
            )
            .andExpect(status().isOk());

        // Validate the PreferenciaBibliaUsuario in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPreferenciaBibliaUsuarioUpdatableFieldsEquals(
            partialUpdatedPreferenciaBibliaUsuario,
            getPersistedPreferenciaBibliaUsuario(partialUpdatedPreferenciaBibliaUsuario)
        );
    }

    @Test
    @Transactional
    void patchNonExistingPreferenciaBibliaUsuario() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        preferenciaBibliaUsuario.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPreferenciaBibliaUsuarioMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, preferenciaBibliaUsuario.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(preferenciaBibliaUsuario))
            )
            .andExpect(status().isBadRequest());

        // Validate the PreferenciaBibliaUsuario in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchPreferenciaBibliaUsuario() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        preferenciaBibliaUsuario.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPreferenciaBibliaUsuarioMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(preferenciaBibliaUsuario))
            )
            .andExpect(status().isBadRequest());

        // Validate the PreferenciaBibliaUsuario in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamPreferenciaBibliaUsuario() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        preferenciaBibliaUsuario.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPreferenciaBibliaUsuarioMockMvc
            .perform(
                patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(preferenciaBibliaUsuario))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the PreferenciaBibliaUsuario in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deletePreferenciaBibliaUsuario() throws Exception {
        // Initialize the database
        insertedPreferenciaBibliaUsuario = preferenciaBibliaUsuarioRepository.saveAndFlush(preferenciaBibliaUsuario);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the preferenciaBibliaUsuario
        restPreferenciaBibliaUsuarioMockMvc
            .perform(delete(ENTITY_API_URL_ID, preferenciaBibliaUsuario.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return preferenciaBibliaUsuarioRepository.count();
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

    protected PreferenciaBibliaUsuario getPersistedPreferenciaBibliaUsuario(PreferenciaBibliaUsuario preferenciaBibliaUsuario) {
        return preferenciaBibliaUsuarioRepository.findById(preferenciaBibliaUsuario.getId()).orElseThrow();
    }

    protected void assertPersistedPreferenciaBibliaUsuarioToMatchAllProperties(PreferenciaBibliaUsuario expectedPreferenciaBibliaUsuario) {
        assertPreferenciaBibliaUsuarioAllPropertiesEquals(
            expectedPreferenciaBibliaUsuario,
            getPersistedPreferenciaBibliaUsuario(expectedPreferenciaBibliaUsuario)
        );
    }

    protected void assertPersistedPreferenciaBibliaUsuarioToMatchUpdatableProperties(
        PreferenciaBibliaUsuario expectedPreferenciaBibliaUsuario
    ) {
        assertPreferenciaBibliaUsuarioAllUpdatablePropertiesEquals(
            expectedPreferenciaBibliaUsuario,
            getPersistedPreferenciaBibliaUsuario(expectedPreferenciaBibliaUsuario)
        );
    }
}
