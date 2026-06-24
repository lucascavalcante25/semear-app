package br.com.semear.web.rest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.semear.IntegrationTest;
import br.com.semear.domain.Authority;
import br.com.semear.domain.Igreja;
import br.com.semear.domain.PedidoOracao;
import br.com.semear.domain.User;
import br.com.semear.domain.Visitante;
import br.com.semear.domain.Aviso;
import br.com.semear.domain.enumeration.CategoriaPedidoOracao;
import br.com.semear.domain.enumeration.StatusIgreja;
import br.com.semear.domain.enumeration.StatusPedidoOracao;
import br.com.semear.domain.enumeration.TipoAviso;
import br.com.semear.domain.enumeration.VisibilidadePedidoOracao;
import br.com.semear.repository.AuthorityRepository;
import br.com.semear.repository.IgrejaRepository;
import br.com.semear.repository.PedidoOracaoRepository;
import br.com.semear.repository.UserRepository;
import br.com.semear.repository.VisitanteRepository;
import br.com.semear.repository.AvisoRepository;
import br.com.semear.security.AuthoritiesConstants;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@IntegrationTest
@AutoConfigureMockMvc
@Transactional
class TenantIsolationIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EntityManager em;

    @Autowired
    private IgrejaRepository igrejaRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthorityRepository authorityRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PedidoOracaoRepository pedidoOracaoRepository;

    @Autowired
    private VisitanteRepository visitanteRepository;

    @Autowired
    private AvisoRepository avisoRepository;

    private Igreja igrejaA;
    private Igreja igrejaB;
    private User usuarioA;
    private PedidoOracao pedidoB;
    private Visitante visitanteB;
    private Aviso avisoB;

    @BeforeEach
    void setUp() {
        igrejaA = criarIgreja("Igreja Tenant A");
        igrejaB = criarIgreja("Igreja Tenant B");
        usuarioA = criarUsuario("tenantusera", igrejaA, AuthoritiesConstants.MEMBRO);
        User usuarioB = criarUsuario("tenantuserb", igrejaB, AuthoritiesConstants.MEMBRO);

        pedidoB = new PedidoOracao();
        pedidoB.setIgreja(igrejaB);
        pedidoB.setUsuario(usuarioB);
        pedidoB.setTitulo("Pedido B");
        pedidoB.setDescricao("Descricao B");
        pedidoB.setCategoria(CategoriaPedidoOracao.OUTRO);
        pedidoB.setVisibilidade(VisibilidadePedidoOracao.PUBLICA);
        pedidoB.setStatus(StatusPedidoOracao.ABERTO);
        pedidoB.setAprovado(true);
        pedidoB.setRequerAprovacao(false);
        pedidoB.setAnonimo(false);
        pedidoB.setCriadoEm(Instant.now());
        pedidoB = pedidoOracaoRepository.save(pedidoB);

        visitanteB = new Visitante();
        visitanteB.setIgreja(igrejaB);
        visitanteB.setNome("Visitante B");
        visitanteB.setDataVisita(LocalDate.now());
        visitanteB.setCriadoEm(Instant.now());
        visitanteB.setCriadoPor("system");
        visitanteB = visitanteRepository.save(visitanteB);

        avisoB = new Aviso();
        avisoB.setIgreja(igrejaB);
        avisoB.setTitulo("Aviso B");
        avisoB.setConteudo("Conteudo B");
        avisoB.setTipo(TipoAviso.NORMAL);
        avisoB.setDataInicio(LocalDate.now());
        avisoB.setAtivo(true);
        avisoB.setCriadoEm(Instant.now());
        avisoB.setCriadoPor("system");
        avisoB = avisoRepository.save(avisoB);

        em.flush();
        em.clear();
    }

    @Test
    @WithMockUser(username = "tenantusera", authorities = AuthoritiesConstants.MEMBRO)
    void pedidoOracaoCrossTenantNegado() throws Exception {
        mockMvc.perform(get("/api/pedidos-oracao/{id}", pedidoB.getId())).andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "tenantusera", authorities = AuthoritiesConstants.MEMBRO)
    void visitanteCrossTenantNegado() throws Exception {
        mockMvc.perform(get("/api/visitantes/{id}", visitanteB.getId())).andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "tenantusera", authorities = AuthoritiesConstants.MEMBRO)
    void avisoCrossTenantNegado() throws Exception {
        mockMvc.perform(get("/api/avisos/{id}", avisoB.getId())).andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "tenantusera", authorities = AuthoritiesConstants.MEMBRO)
    void listagemVisitantesNaoIncluiOutraIgreja() throws Exception {
        mockMvc.perform(get("/api/visitantes")).andExpect(status().isOk());
        long count = visitanteRepository.countByIgrejaId(igrejaA.getId());
        org.assertj.core.api.Assertions.assertThat(count).isZero();
    }

    private Igreja criarIgreja(String nome) {
        Igreja igreja = new Igreja();
        igreja.setNome(nome);
        igreja.setStatus(StatusIgreja.ATIVA);
        igreja.setDataCadastro(Instant.now());
        igreja.setRequerAprovacaoOracaoPublica(true);
        return igrejaRepository.save(igreja);
    }

    private User criarUsuario(String login, Igreja igreja, String role) {
        Authority authority = authorityRepository.findById(role).orElseGet(() -> {
            Authority a = new Authority();
            a.setName(role);
            return authorityRepository.save(a);
        });
        User user = new User();
        user.setLogin(login);
        user.setPassword(passwordEncoder.encode("test"));
        user.setEmail(login + "@test.com");
        user.setActivated(true);
        user.setIgreja(igreja);
        user.getAuthorities().add(authority);
        user.setModules("dashboard:READ,biblia:READ,devocionais:READ,visitantes:READ,avisos:READ,oracao:READ,configuracoes:READ");
        return userRepository.save(user);
    }
}
