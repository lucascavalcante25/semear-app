package br.com.semear.config;

import br.com.semear.domain.*;
import br.com.semear.domain.enumeration.*;
import br.com.semear.domain.enumerations.TipoLancamento;
import br.com.semear.repository.*;
import br.com.semear.service.AssinaturaIgrejaService;
import br.com.semear.service.DepartamentoOrientacoesPadrao;
import br.com.semear.service.UserService;
import br.com.semear.service.dto.AdminUserDTO;
import br.com.semear.service.dto.DependenteCreateDTO;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Popula dados operacionais de teste. Carregado apenas com {@code @Profile("dev")} —
 * nunca executa em produção. Não usa Liquibase/CSV: somente código Java local.
 */
@Service
@Profile("dev")
public class DevSeedService {

    private static final Logger log = LoggerFactory.getLogger(DevSeedService.class);

    private static final String MARKER_SEMEAR = "22222222222";
    private static final String MARKER_PLATAFORMA = "seed-plataforma-pendente@test.com";

    private static final Set<String> MODULOS_ADMIN_IGREJA = new LinkedHashSet<>(
        List.of(
            "dashboard:WRITE",
            "biblia:WRITE",
            "devocionais:WRITE",
            "louvores:WRITE",
            "membros:WRITE",
            "visitantes:WRITE",
            "comunicados:WRITE",
            "financeiro:WRITE",
            "oracao:WRITE",
            "aprovar-pre-cadastros:WRITE",
            "configuracoes:WRITE",
            "departamentos:WRITE",
            "escalas:WRITE",
            "eventos:WRITE"
        )
    );

    private final IgrejaRepository igrejaRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final AssinaturaIgrejaService assinaturaIgrejaService;
    private final PreCadastroRepository preCadastroRepository;
    private final VisitanteRepository visitanteRepository;
    private final ComunicadoRepository comunicadoRepository;
    private final PedidoOracaoRepository pedidoOracaoRepository;
    private final DepartamentoRepository departamentoRepository;
    private final DepartamentoMembroRepository departamentoMembroRepository;
    private final EscalaRepository escalaRepository;
    private final EscalaItemRepository escalaItemRepository;
    private final EscalaConfigAutomaticaRepository escalaConfigAutomaticaRepository;
    private final CultoRegistroRepository cultoRegistroRepository;
    private final CultoEscalaRegraRepository cultoEscalaRegraRepository;
    private final EventoRepository eventoRepository;
    private final EventoInscricaoRepository eventoInscricaoRepository;
    private final LancamentoRepository lancamentoRepository;
    private final LouvorRepository louvorRepository;
    private final GrupoLouvorRepository grupoLouvorRepository;
    private final GrupoLouvorItemRepository grupoLouvorItemRepository;
    private final CriancaRepository criancaRepository;
    private final CriancaResponsavelRepository criancaResponsavelRepository;
    private final DevocionalRepository devocionalRepository;
    private final DocumentoIgrejaRepository documentoIgrejaRepository;
    private final SolicitacaoAcessoRepository solicitacaoAcessoRepository;
    private final SolicitacaoSuporteRepository solicitacaoSuporteRepository;
    private final AcompanhamentoPastoralRepository acompanhamentoPastoralRepository;

    public DevSeedService(
        IgrejaRepository igrejaRepository,
        UserRepository userRepository,
        UserService userService,
        AssinaturaIgrejaService assinaturaIgrejaService,
        PreCadastroRepository preCadastroRepository,
        VisitanteRepository visitanteRepository,
        ComunicadoRepository comunicadoRepository,
        PedidoOracaoRepository pedidoOracaoRepository,
        DepartamentoRepository departamentoRepository,
        DepartamentoMembroRepository departamentoMembroRepository,
        EscalaRepository escalaRepository,
        EscalaItemRepository escalaItemRepository,
        EscalaConfigAutomaticaRepository escalaConfigAutomaticaRepository,
        CultoRegistroRepository cultoRegistroRepository,
        CultoEscalaRegraRepository cultoEscalaRegraRepository,
        EventoRepository eventoRepository,
        EventoInscricaoRepository eventoInscricaoRepository,
        LancamentoRepository lancamentoRepository,
        LouvorRepository louvorRepository,
        GrupoLouvorRepository grupoLouvorRepository,
        GrupoLouvorItemRepository grupoLouvorItemRepository,
        CriancaRepository criancaRepository,
        CriancaResponsavelRepository criancaResponsavelRepository,
        DevocionalRepository devocionalRepository,
        DocumentoIgrejaRepository documentoIgrejaRepository,
        SolicitacaoAcessoRepository solicitacaoAcessoRepository,
        SolicitacaoSuporteRepository solicitacaoSuporteRepository,
        AcompanhamentoPastoralRepository acompanhamentoPastoralRepository
    ) {
        this.igrejaRepository = igrejaRepository;
        this.userRepository = userRepository;
        this.userService = userService;
        this.assinaturaIgrejaService = assinaturaIgrejaService;
        this.preCadastroRepository = preCadastroRepository;
        this.visitanteRepository = visitanteRepository;
        this.comunicadoRepository = comunicadoRepository;
        this.pedidoOracaoRepository = pedidoOracaoRepository;
        this.departamentoRepository = departamentoRepository;
        this.departamentoMembroRepository = departamentoMembroRepository;
        this.escalaRepository = escalaRepository;
        this.escalaItemRepository = escalaItemRepository;
        this.escalaConfigAutomaticaRepository = escalaConfigAutomaticaRepository;
        this.cultoRegistroRepository = cultoRegistroRepository;
        this.cultoEscalaRegraRepository = cultoEscalaRegraRepository;
        this.eventoRepository = eventoRepository;
        this.eventoInscricaoRepository = eventoInscricaoRepository;
        this.lancamentoRepository = lancamentoRepository;
        this.louvorRepository = louvorRepository;
        this.grupoLouvorRepository = grupoLouvorRepository;
        this.grupoLouvorItemRepository = grupoLouvorItemRepository;
        this.criancaRepository = criancaRepository;
        this.criancaResponsavelRepository = criancaResponsavelRepository;
        this.devocionalRepository = devocionalRepository;
        this.documentoIgrejaRepository = documentoIgrejaRepository;
        this.solicitacaoAcessoRepository = solicitacaoAcessoRepository;
        this.solicitacaoSuporteRepository = solicitacaoSuporteRepository;
        this.acompanhamentoPastoralRepository = acompanhamentoPastoralRepository;
    }

    @Transactional
    public void executarSeNecessario() {
        log.info("DevSeed: verificando dados mock (somente perfil dev)...");
        seedPlataformaSeNecessario();
        seedIgrejaSemearSeNecessario();
        seedIgrejaNovaSeNecessario(IgrejaPack.RENOVO);
        seedIgrejaNovaSeNecessario(IgrejaPack.MONTE_SIAO);
        seedIgrejaNovaSeNecessario(IgrejaPack.BETANIA);
        enriquecerIgrejasExistentes();
        logarCredenciais();
    }

    /** Garante config + cultos regulares em TODAS as igrejas de teste (transação própria). */
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void garantirAutomacaoEscalasTodasIgrejas() {
        for (IgrejaPack pack : List.of(IgrejaPack.SEMEAR, IgrejaPack.RENOVO, IgrejaPack.MONTE_SIAO, IgrejaPack.BETANIA)) {
            resolverIgrejaPack(pack).ifPresent(igreja -> {
                try {
                    Map<String, User> usuarios = carregarUsuariosIgreja(igreja, pack);
                    garantirAutomacaoEscalasIgreja(igreja, pack, usuarios);
                } catch (Exception e) {
                    log.error("DevSeed: falha ao garantir automação de escalas para {}: {}", pack.nome(), e.getMessage(), e);
                }
            });
        }
    }

    private Optional<Igreja> resolverIgrejaPack(IgrejaPack pack) {
        Optional<Igreja> porSlug = igrejaRepository.findBySlug(pack.slug());
        if (porSlug.isPresent()) {
            return porSlug;
        }
        if ("semear".equals(pack.slug())) {
            return igrejaRepository.findById(1L);
        }
        return Optional.empty();
    }

    /** Completa igrejas já criadas — cada módulo verifica o que falta (idempotente). */
    private void enriquecerIgrejasExistentes() {
        for (IgrejaPack pack : List.of(IgrejaPack.SEMEAR, IgrejaPack.RENOVO, IgrejaPack.MONTE_SIAO, IgrejaPack.BETANIA)) {
            resolverIgrejaPack(pack).ifPresent(igreja -> {
                Map<String, User> usuarios = carregarUsuariosIgreja(igreja, pack);
                if (userRepository.findOneByLogin(pack.adminCpf()).isEmpty()) {
                    usuarios.put(pack.adminCpf(), criarAdminIgreja(igreja, pack));
                }
                usuarios.putAll(seedMembrosExtras(igreja, pack));
                log.info("DevSeed: completando dados faltantes da igreja {}", pack.nome());
                popularDadosOperacionais(igreja, usuarios, pack);
            });
        }
    }

    private Map<String, User> carregarUsuariosIgreja(Igreja igreja, IgrejaPack pack) {
        Map<String, User> mapa = new LinkedHashMap<>();
        for (String cpf : pack.todosCpfs()) {
            userRepository.findOneByLogin(cpf).ifPresent(u -> mapa.put(cpf, u));
        }
        if (mapa.isEmpty()) {
            userRepository.findAllByIgrejaIdAndActivatedIsTrue(igreja.getId()).forEach(u -> mapa.put(u.getLogin(), u));
        }
        return mapa;
    }

    private Map<String, User> seedMembrosExtras(Igreja igreja, IgrejaPack pack) {
        Map<String, User> novos = new LinkedHashMap<>();
        for (UsuarioSeed seed : pack.membrosExtras()) {
            if (userRepository.findOneByLogin(seed.cpf()).isPresent()) {
                continue;
            }
            novos.put(seed.cpf(), criarUsuario(igreja, seed));
        }
        return novos;
    }

    private void seedPlataformaSeNecessario() {
        if (solicitacaoAcessoRepository.findAll().stream().anyMatch(s -> MARKER_PLATAFORMA.equalsIgnoreCase(s.getEmail()))) {
            return;
        }
        log.info("DevSeed: criando solicitações de acesso pendentes (super-admin)...");
        criarSolicitacaoAcessoPendente(
            "Igreja Esperança Viva",
            "Pastor Elias Rocha",
            "esperanca.viva.seed@test.com",
            "5511111111111",
            "Fortaleza",
            "CE"
        );
        criarSolicitacaoAcessoPendente(
            "Comunidade Nova Aliança",
            "Pr. Daniel Martins",
            MARKER_PLATAFORMA,
            "5522222222222",
            "Recife",
            "PE"
        );
    }

    private void criarSolicitacaoAcessoPendente(String nomeIgreja, String solicitante, String email, String cpf, String cidade, String uf) {
        SolicitacaoAcesso s = new SolicitacaoAcesso();
        s.setNomeSolicitante(solicitante);
        s.setEmail(email);
        s.setTelefone("11999998888");
        s.setCpf(cpf);
        s.setSexo(Sexo.MASCULINO);
        s.setDataNascimento(LocalDate.of(1980, 1, 1));
        s.setSenha("semearSeed1");
        s.setNomeIgreja(nomeIgreja);
        s.setCidade(cidade);
        s.setEstado(uf);
        s.setQuantidadeMembros(80);
        s.setMensagem("Solicitação de teste gerada automaticamente em dev.");
        s.setStatus(StatusSolicitacaoAcesso.PENDENTE);
        s.setDataSolicitacao(Instant.now());
        solicitacaoAcessoRepository.save(s);
    }

    private void seedIgrejaSemearSeNecessario() {
        if (userRepository.findOneByLogin(MARKER_SEMEAR).isPresent()) {
            return;
        }
        Igreja igreja = igrejaRepository.findById(1L).orElseThrow(() -> new IllegalStateException("Igreja Semear (id=1) não encontrada"));
        if (igreja.getSlug() == null || igreja.getSlug().isBlank()) {
            igreja.setSlug("semear");
            igreja.setSiteAtivo(true);
            igreja.setHorarioCulto("Domingo 9h e 19h | Quinta 19h30");
            igrejaRepository.save(igreja);
        }
        if (assinaturaIgrejaService.buscarPorIgreja(igreja.getId()).isEmpty()) {
            assinaturaIgrejaService.iniciarTesteGratis(igreja, "Administração Semear");
        }
        log.info("DevSeed: populando igreja {}", igreja.getNome());
        Map<String, User> usuarios = new LinkedHashMap<>();
        if (userRepository.findOneByLogin(IgrejaPack.SEMEAR.adminCpf()).isEmpty()) {
            usuarios.put(IgrejaPack.SEMEAR.adminCpf(), criarAdminIgreja(igreja, IgrejaPack.SEMEAR));
        }
        usuarios.putAll(seedUsuariosSemear(igreja));
        popularDadosOperacionais(igreja, usuarios, IgrejaPack.SEMEAR);
    }

    private void seedIgrejaNovaSeNecessario(IgrejaPack pack) {
        if (igrejaRepository.findBySlug(pack.slug()).isPresent()) {
            return;
        }
        log.info("DevSeed: criando igreja {} ({})", pack.nome(), pack.slug());
        Igreja igreja = criarIgreja(pack);
        assinaturaIgrejaService.iniciarTesteGratis(igreja, pack.adminNome());
        User admin = criarAdminIgreja(igreja, pack);
        Map<String, User> usuarios = seedUsuariosIgrejaCompleto(igreja, pack, admin);
        popularDadosOperacionais(igreja, usuarios, pack);
    }

    private Igreja criarIgreja(IgrejaPack pack) {
        Igreja igreja = new Igreja();
        igreja.setNome(pack.nome());
        igreja.setNomeFantasia(pack.nomeFantasia());
        igreja.setSlug(pack.slug());
        igreja.setCidade(pack.cidade());
        igreja.setEstado(pack.estado());
        igreja.setEndereco("Rua das Flores, 100");
        igreja.setBairro("Centro");
        igreja.setCep("60000-000");
        igreja.setEmail("contato@" + pack.slug() + ".test");
        igreja.setTelefone("8532221100");
        igreja.setCorPrimaria(pack.corPrimaria());
        igreja.setCorSecundaria(pack.corSecundaria());
        igreja.setTemaPreferido(Tema.SISTEMA);
        igreja.setTextoBoasVindas("Bem-vindo à " + pack.nome());
        igreja.setDescricaoIgreja("Igreja de teste — dados mock gerados em dev.");
        igreja.setHorarioCulto("Domingo 9h e 18h | Quarta 19h30");
        igreja.setSiteAtivo(true);
        igreja.setExibirComunicadosPublicos(true);
        igreja.setStatus(StatusIgreja.ATIVA);
        igreja.setDataCadastro(Instant.now());
        return igrejaRepository.save(igreja);
    }

    private User criarAdminIgreja(Igreja igreja, IgrejaPack pack) {
        AdminUserDTO dto = new AdminUserDTO();
        dto.setLogin(pack.adminCpf());
        dto.setEmail(pack.adminEmail());
        dto.setFirstName(pack.adminPrimeiroNome());
        dto.setLastName(pack.adminUltimoNome());
        dto.setActivated(true);
        dto.setBirthDate(LocalDate.of(1975, 6, 15));
        dto.setSexo(Sexo.MASCULINO);
        dto.setPhone("11988887777");
        dto.setAuthorities(Set.of("ROLE_ADMIN", "ROLE_ADMIN_IGREJA", "ROLE_USER"));
        dto.setModules(MODULOS_ADMIN_IGREJA);
        User admin = userService.createUserFromPreCadastro(dto, pack.adminSenha());
        admin.setIgreja(igreja);
        admin.setCidade(pack.cidade());
        admin.setEstado(pack.estado());
        return userRepository.save(admin);
    }

    private Map<String, User> seedUsuariosSemear(Igreja igreja) {
        List<UsuarioSeed> seeds = List.of(
            new UsuarioSeed("22222222222", "João", "Pastor", "pastor.teste@semear.com", PerfilAcesso.PASTOR, Sexo.MASCULINO, "semear222", 1978, 3, 15),
            new UsuarioSeed("33333333333", "Maria", "Secretária", "secretaria.teste@semear.com", PerfilAcesso.SECRETARIA, Sexo.FEMININO, "semear333", 1985, 7, 22),
            new UsuarioSeed("44444444444", "Carlos", "Tesoureiro", "tesouraria.teste@semear.com", PerfilAcesso.TESOURARIA, Sexo.MASCULINO, "semear444", 1980, 11, 8),
            new UsuarioSeed("55555555555", "Lucas", "Líder", "lider.teste@semear.com", PerfilAcesso.LIDER, Sexo.MASCULINO, "semear555", 1990, 1, 30),
            new UsuarioSeed("66666666666", "Pedro", "Membro", "pedro.membro@semear.com", PerfilAcesso.MEMBRO, Sexo.MASCULINO, "semear666", 1992, 5, 10),
            new UsuarioSeed("77777777777", "Ana", "Membro", "ana.membro@semear.com", PerfilAcesso.MEMBRO, Sexo.FEMININO, "semear777", 1994, 9, 18),
            new UsuarioSeed("88888888888", "José", "Visitante", "visitante.teste@semear.com", PerfilAcesso.VISITANTE, Sexo.MASCULINO, "semear888", 2000, 2, 25),
            new UsuarioSeed("99999999999", "Silvia", "Co-Pastora", "copastor.teste@semear.com", PerfilAcesso.COPASTOR, Sexo.FEMININO, "semear999", 1982, 12, 5),
            new UsuarioSeed("22222222201", "Roberto", "Almeida", "roberto.portaria@semear.com", PerfilAcesso.MEMBRO, Sexo.MASCULINO, "semear201", 1988, 4, 12),
            new UsuarioSeed("22222222202", "André", "Souza", "andre.portaria@semear.com", PerfilAcesso.MEMBRO, Sexo.MASCULINO, "semear202", 1991, 8, 3),
            new UsuarioSeed("33333333301", "Fernanda", "Lima", "fernanda.recepcao@semear.com", PerfilAcesso.MEMBRO, Sexo.FEMININO, "semear301", 1989, 6, 20),
            new UsuarioSeed("33333333302", "Juliana", "Costa", "juliana.recepcao@semear.com", PerfilAcesso.MEMBRO, Sexo.FEMININO, "semear302", 1993, 10, 14),
            new UsuarioSeed("33333333303", "Patrícia", "Mendes", "patricia.limpeza@semear.com", PerfilAcesso.MEMBRO, Sexo.FEMININO, "semear303", 1987, 3, 28),
            new UsuarioSeed("33333333304", "Camila", "Rocha", "camila.limpeza@semear.com", PerfilAcesso.MEMBRO, Sexo.FEMININO, "semear304", 1995, 7, 7),
            new UsuarioSeed("66666666661", "Ricardo", "Barbosa", "ricardo.membro@semear.com", PerfilAcesso.MEMBRO, Sexo.MASCULINO, "semear661", 1986, 1, 17),
            new UsuarioSeed("77777777771", "Beatriz", "Nunes", "beatriz.membro@semear.com", PerfilAcesso.MEMBRO, Sexo.FEMININO, "semear771", 1996, 11, 30)
        );
        Map<String, User> mapa = new LinkedHashMap<>();
        for (UsuarioSeed seed : seeds) {
            mapa.put(seed.cpf(), criarUsuario(igreja, seed));
        }
        return mapa;
    }

    private Map<String, User> seedUsuariosIgrejaCompleto(Igreja igreja, IgrejaPack pack, User admin) {
        Map<String, User> mapa = new LinkedHashMap<>();
        mapa.put(pack.adminCpf(), admin);
        for (UsuarioSeed seed : pack.equipePrincipal()) {
            mapa.put(seed.cpf(), criarUsuario(igreja, seed));
        }
        for (UsuarioSeed seed : pack.membrosExtras()) {
            mapa.put(seed.cpf(), criarUsuario(igreja, seed));
        }
        return mapa;
    }

    private User criarUsuario(Igreja igreja, UsuarioSeed seed) {
        AdminUserDTO dto = new AdminUserDTO();
        dto.setLogin(seed.cpf());
        dto.setEmail(seed.email());
        dto.setFirstName(seed.firstName());
        dto.setLastName(seed.lastName());
        dto.setActivated(true);
        dto.setBirthDate(LocalDate.of(seed.birthYear(), seed.birthMonth(), seed.birthDay()));
        dto.setSexo(seed.sexo());
        dto.setPhone("11999990000");
        dto.setAuthorities(Set.of("ROLE_" + seed.perfil().name()));
        User user = userService.createUserFromPreCadastro(dto, seed.senha());
        user.setIgreja(igreja);
        user.setDataMembroSince(LocalDate.now().minusYears(2));
        user.setCidade(igreja.getCidade());
        user.setEstado(igreja.getEstado());
        return userRepository.save(user);
    }

    private void popularDadosOperacionais(Igreja igreja, Map<String, User> usuarios, IgrejaPack pack) {
        ConteudoIgreja conteudo = pack.conteudo();
        User pastor = usuarios.getOrDefault(pack.cpfPastor(), usuarios.values().stream().filter(u -> temRole(u, "ROLE_PASTOR")).findFirst().orElse(null));
        User tesoureiro = usuarios.get(pack.cpfTesoureiro());
        User membroH = usuarios.getOrDefault(pack.cpfMembroH(), usuarios.values().stream().filter(u -> u.getSexo() == Sexo.MASCULINO && temRole(u, "ROLE_MEMBRO")).findFirst().orElse(pastor));
        User membroM = usuarios.getOrDefault(pack.cpfMembroM(), usuarios.values().stream().filter(u -> u.getSexo() == Sexo.FEMININO && temRole(u, "ROLE_MEMBRO")).findFirst().orElse(pastor));
        if (pastor == null) {
            pastor = usuarios.values().iterator().next();
        }

        seedPreCadastrosPendentes(igreja, 3);
        seedVisitantes(igreja, conteudo, pastor, membroH);
        seedComunicados(igreja, conteudo, pastor);
        seedPedidosOracao(igreja, pastor, membroH, membroM, 5);
        Map<String, Departamento> deptos = seedDepartamentosEscalas(igreja, usuarios, pack);
        seedEscalaAutomacao(igreja, deptos, pack);
        seedEventos(igreja, conteudo, membroH, membroM);
        seedEventosModuloCompleto(igreja, usuarios, pack);
        seedFinanceiro(igreja, conteudo, tesoureiro != null ? tesoureiro.getLogin() : pack.adminCpf());
        seedLouvores(igreja, pack);
        seedDevocionais(igreja, pack);
        seedDocumentos(igreja, pastor);
        seedCriancas(igreja, membroH, membroM, pack);
        seedDependentes(igreja, membroH, membroM, pack);
        User solicitanteSuporte = usuarios.getOrDefault(pack.adminCpf(), pastor);
        seedSuporte(igreja, solicitanteSuporte, pack);
    }

    private boolean temRole(User user, String role) {
        return user.getAuthorities().stream().anyMatch(a -> role.equals(a.getName()));
    }

    private void seedPreCadastrosPendentes(Igreja igreja, int quantidade) {
        if (!preCadastroRepository.findByIgrejaIdAndStatusIn(igreja.getId(), List.of(StatusCadastro.PRIMEIROACESSO)).isEmpty()) {
            return;
        }
        long base = 10_000_000_000L + (igreja.getId() != null ? igreja.getId() : 1L) * 100_000_000L;
        Instant agora = Instant.now();
        for (int i = 0; i < quantidade; i++) {
            String cpf = String.format("%011d", base + (i + 1L) * 1_010_101L);
            PreCadastro pc = new PreCadastro();
            pc.setNomeCompleto("Candidato Pré-cadastro " + (i + 1) + " — " + igreja.getNomeFantasia());
            pc.setEmail("precadastro" + igreja.getId() + "_" + i + "@test.com");
            pc.setTelefone("11988887777");
            pc.setCpf(cpf);
            pc.setSexo(i % 2 == 0 ? Sexo.MASCULINO : Sexo.FEMININO);
            pc.setDataNascimento(LocalDate.of(1995, 5, 15));
            pc.setLogin(cpf);
            pc.setSenha("semearPendente1");
            pc.setPerfilSolicitado(PerfilAcesso.MEMBRO);
            pc.setStatus(StatusCadastro.PRIMEIROACESSO);
            pc.setCriadoEm(agora);
            pc.setIgreja(igreja);
            preCadastroRepository.save(pc);
        }
    }

    private void seedVisitantes(Igreja igreja, ConteudoIgreja conteudo, User pastor, User membroAcompanhado) {
        String marcador = "Visitante de teste — " + conteudo.nomeFantasia();
        Set<String> nomesExistentes = visitanteRepository
            .findAllByIgrejaId(igreja.getId(), PageRequest.of(0, 100))
            .stream()
            .filter(v -> marcador.equals(v.getObservacoes()))
            .map(Visitante::getNome)
            .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
        Instant agora = Instant.now();
        LocalDate hoje = LocalDate.now();
        int criados = 0;
        for (int i = 0; i < conteudo.visitantes().length; i++) {
            String[] v = conteudo.visitantes()[i];
            if (nomesExistentes.contains(v[0])) {
                continue;
            }
            Visitante visitante = new Visitante();
            visitante.setNome(v[0]);
            visitante.setTelefone(v[1]);
            visitante.setDataVisita(hoje.minusDays(i * 3L + 1));
            visitante.setComoConheceu(v[2]);
            visitante.setFormaChegada(FormaChegadaVisitante.valueOf(v[4]));
            visitante.setEstadoFunil(EstadoFunilVisitante.valueOf(v[3]));
            visitante.setConvidadoPor(v[5]);
            visitante.setObservacoes(marcador);
            visitante.setIgreja(igreja);
            visitante.setCriadoEm(agora);
            visitante.setCriadoPor("seed-dev");
            visitanteRepository.save(visitante);
            criados++;
        }
        if (criados == 0) {
            return;
        }
        if (
            pastor != null &&
            membroAcompanhado != null &&
            acompanhamentoPastoralRepository
                .findAll()
                .stream()
                .noneMatch(ap -> ap.getIgreja() != null && igreja.getId().equals(ap.getIgreja().getId()))
        ) {
            AcompanhamentoPastoral ap = new AcompanhamentoPastoral();
            ap.setIgreja(igreja);
            ap.setMembro(membroAcompanhado);
            ap.setResponsavel(pastor);
            ap.setTipo(TipoAcompanhamentoPastoral.VISITA);
            ap.setObservacao("Acompanhamento de visitante — " + conteudo.nomeFantasia());
            ap.setDataContato(LocalDate.now().minusDays(2));
            ap.setCriadoEm(agora);
            ap.setCriadoPor(pastor);
            acompanhamentoPastoralRepository.save(ap);
        }
    }

    private void seedComunicados(Igreja igreja, ConteudoIgreja conteudo, User autor) {
        if (comunicadoRepository.findAll().stream().anyMatch(c -> c.getIgreja() != null && igreja.getId().equals(c.getIgreja().getId()) && c.getTitulo().contains(conteudo.nomeFantasia()))) {
            return;
        }
        LocalDate hoje = LocalDate.now();
        for (String[] av : conteudo.avisos()) {
            Comunicado comunicado = new Comunicado();
            comunicado.setTitulo("[" + conteudo.nomeFantasia() + "] " + av[0]);
            comunicado.setConteudo(av[1]);
            comunicado.setTipo(TipoComunicado.valueOf(av[2]));
            comunicado.setDataInicio(hoje.minusDays(2));
            comunicado.setDataFim(hoje.plusMonths(1));
            comunicado.setAtivo(true);
            comunicado.setExibirNoSitePublico(true);
            comunicado.setIgreja(igreja);
            comunicado.setCriadoEm(Instant.now());
            comunicado.setCriadoPor(autor.getLogin());
            comunicadoRepository.save(comunicado);
        }
        for (String[] inf : conteudo.informativos()) {
            Comunicado comunicado = new Comunicado();
            comunicado.setTitulo(inf[0] + " — " + conteudo.nomeFantasia());
            comunicado.setConteudo(inf[1]);
            comunicado.setTipo(mapearTipoInformativo(inf[2]));
            comunicado.setPublicoAlvo(PublicoAlvoInformativo.valueOf(inf[3]));
            comunicado.setPrioridade(PrioridadeInformativo.valueOf(inf[4]));
            comunicado.setExibirNoLogin(true);
            comunicado.setObrigatorio(Boolean.parseBoolean(inf[5]));
            comunicado.setExibirNoSitePublico(false);
            comunicado.setAtivo(true);
            comunicado.setDataInicio(hoje);
            comunicado.setDataFim(hoje.plusMonths(2));
            comunicado.setIgreja(igreja);
            comunicado.setCriadoEm(Instant.now());
            comunicado.setCriadoPor(autor.getLogin());
            comunicadoRepository.save(comunicado);
        }
    }

    private TipoComunicado mapearTipoInformativo(String tipo) {
        return switch (tipo) {
            case "ALERTA" -> TipoComunicado.URGENTE;
            case "BOAS_VINDAS" -> TipoComunicado.BOAS_VINDAS;
            default -> TipoComunicado.NORMAL;
        };
    }

    private void seedPedidosOracao(Igreja igreja, User pastor, User membroH, User membroM, int qtd) {
        if (!pedidoOracaoRepository.findByIgrejaIdAndDeletedAtIsNullOrderByCriadoEmDesc(igreja.getId()).isEmpty()) {
            return;
        }
        Object[][] pedidos = {
            { "Cura familiar", "Orem pela minha família.", CategoriaPedidoOracao.SAUDE, membroM, true },
            { "Emprego", "Direção em processo seletivo.", CategoriaPedidoOracao.TRABALHO, membroH, true },
            { "Gratidão", "Agradeço pelas bênçãos.", CategoriaPedidoOracao.GRATIDAO, membroM, true },
            { "Aguardando moderação", "Pedido sensível.", CategoriaPedidoOracao.ESPIRITUAL, membroH, false },
            { "Restauração", "Orem pelo meu casamento.", CategoriaPedidoOracao.FAMILIA, membroM, true },
        };
        for (int i = 0; i < Math.min(qtd, pedidos.length); i++) {
            Object[] p = pedidos[i];
            PedidoOracao pedido = new PedidoOracao();
            pedido.setIgreja(igreja);
            pedido.setUsuario((User) p[3]);
            pedido.setTitulo((String) p[0]);
            pedido.setDescricao((String) p[1]);
            pedido.setCategoria((CategoriaPedidoOracao) p[2]);
            pedido.setVisibilidade(VisibilidadePedidoOracao.PUBLICA);
            pedido.setStatus(StatusPedidoOracao.ABERTO);
            pedido.setAnonimo(false);
            boolean aprovado = (Boolean) p[4];
            pedido.setRequerAprovacao(!aprovado);
            pedido.setAprovado(aprovado);
            if (aprovado) {
                pedido.setAprovadoPor(pastor);
                pedido.setAprovadoEm(Instant.now());
            }
            pedidoOracaoRepository.save(pedido);
        }
    }

    private Map<String, Departamento> seedDepartamentosEscalas(Igreja igreja, Map<String, User> usuarios, IgrejaPack pack) {
        List<Departamento> existentes = departamentoRepository.findByIgrejaIdOrderByNomeAsc(igreja.getId());
        if (!existentes.isEmpty()) {
            Map<String, Departamento> mapa = mapearDepartamentosExistentes(existentes);
            if (mapa.containsKey("portaria") && mapa.containsKey("recepcao")) {
                return mapa;
            }
            log.info("DevSeed: completando departamentos portaria/recepção da igreja {}", igreja.getNomeFantasia());
        }
        User homemPortaria = usuarios.get(pack.cpfPortaria1());
        User homem2 = usuarios.get(pack.cpfPortaria2());
        User mulherRecepcao = usuarios.get(pack.cpfRecepcao1());
        User mulherRecepcao2 = usuarios.get(pack.cpfRecepcao2());
        User mulherLimpeza = usuarios.get(pack.cpfLimpeza1());
        User mulherLimpeza2 = usuarios.get(pack.cpfLimpeza2());
        User homem = homemPortaria != null
            ? homemPortaria
            : usuarios.values().stream().filter(u -> u.getSexo() == Sexo.MASCULINO && !u.isDependente()).findFirst().orElse(null);
        User mulher = mulherRecepcao != null
            ? mulherRecepcao
            : usuarios.values().stream().filter(u -> u.getSexo() == Sexo.FEMININO && !u.isDependente()).findFirst().orElse(null);
        User lider = usuarios.getOrDefault(pack.cpfLider(), usuarios.values().stream().filter(u -> temRole(u, "ROLE_LIDER")).findFirst().orElse(homem));

        Departamento portaria = criarDepartamento(igreja, "Portaria", CodigoDepartamento.PORTARIA, homem);
        Departamento recepcao = criarDepartamento(igreja, "Recepção", CodigoDepartamento.RECEPCAO, mulher);
        Departamento limpeza = criarDepartamento(igreja, "Limpeza", CodigoDepartamento.LIMPEZA, mulherLimpeza != null ? mulherLimpeza : mulher);
        Departamento louvorDepto = criarDepartamento(igreja, "Equipe de Louvor", CodigoDepartamento.OUTRO, lider);

        if (homem != null) {
            vincularMembro(portaria, homem, "Líder");
        }
        if (homem2 != null) {
            vincularMembro(portaria, homem2, "Voluntário");
        }
        if (mulher != null) {
            vincularMembro(recepcao, mulher, "Líder");
        }
        if (mulherRecepcao2 != null) {
            vincularMembro(recepcao, mulherRecepcao2, "Voluntário");
        }
        if (mulherLimpeza != null) {
            vincularMembro(limpeza, mulherLimpeza, "Líder");
        }
        if (mulherLimpeza2 != null) {
            vincularMembro(limpeza, mulherLimpeza2, "Voluntário");
        }
        if (lider != null) {
            vincularMembro(louvorDepto, lider, "Líder");
        }

        ConteudoIgreja c = pack.conteudo();
        LocalDate proxDomingo = proximoDomingo();
        LocalDate proxQuinta = proximaQuinta();
        Instant cultoDomingo = proxDomingo.atTime(9, 0).atZone(ZoneId.systemDefault()).toInstant();
        Instant cultoQuinta = proxQuinta.atTime(19, 0).atZone(ZoneId.systemDefault()).toInstant();

        List<User> escalaPortariaDom = new ArrayList<>();
        if (homem != null) {
            escalaPortariaDom.add(homem);
        }
        if (homem2 != null) {
            escalaPortariaDom.add(homem2);
        }
        if (!escalaPortariaDom.isEmpty()) {
            criarEscala(igreja, portaria, c.nomeFantasia() + " — Portaria domingo 9h", cultoDomingo, escalaPortariaDom);
            criarEscala(igreja, portaria, c.nomeFantasia() + " — Portaria quinta 19h", cultoQuinta, escalaPortariaDom);
        }
        List<User> escalaRecepcaoDom = new ArrayList<>();
        if (mulher != null) {
            escalaRecepcaoDom.add(mulher);
        }
        if (mulherRecepcao2 != null) {
            escalaRecepcaoDom.add(mulherRecepcao2);
        }
        if (!escalaRecepcaoDom.isEmpty()) {
            criarEscala(igreja, recepcao, c.nomeFantasia() + " — Recepção domingo 9h", cultoDomingo, escalaRecepcaoDom);
            criarEscala(igreja, recepcao, c.nomeFantasia() + " — Recepção quinta 19h", cultoQuinta, escalaRecepcaoDom);
        }
        if (mulherLimpeza != null) {
            criarEscala(
                igreja,
                limpeza,
                c.nomeFantasia() + " — Limpeza pós-culto",
                cultoDomingo.plus(2, ChronoUnit.HOURS),
                mulherLimpeza2 != null ? List.of(mulherLimpeza, mulherLimpeza2) : List.of(mulherLimpeza)
            );
        }

        Map<String, Departamento> mapa = new HashMap<>();
        mapa.put("portaria", portaria);
        mapa.put("recepcao", recepcao);
        mapa.put("limpeza", limpeza);
        return mapa;
    }

    private LocalDate proximaQuinta() {
        LocalDate hoje = LocalDate.now();
        int dias = (5 - hoje.getDayOfWeek().getValue() + 7) % 7;
        if (dias == 0) {
            dias = 7;
        }
        return hoje.plusDays(dias);
    }

    private Map<String, Departamento> mapearDepartamentosExistentes(List<Departamento> existentes) {
        Map<String, Departamento> mapa = new HashMap<>();
        for (Departamento d : existentes) {
            if (d.getCodigo() == CodigoDepartamento.PORTARIA) {
                mapa.put("portaria", d);
            } else if (d.getCodigo() == CodigoDepartamento.RECEPCAO) {
                mapa.put("recepcao", d);
            } else if (d.getCodigo() == CodigoDepartamento.LIMPEZA) {
                mapa.put("limpeza", d);
            }
            String nome = d.getNome() != null ? d.getNome().toLowerCase() : "";
            if (nome.contains("portaria")) {
                mapa.putIfAbsent("portaria", d);
            }
            if (nome.contains("recep")) {
                mapa.putIfAbsent("recepcao", d);
            }
            if (nome.contains("limpeza")) {
                mapa.putIfAbsent("limpeza", d);
            }
        }
        return mapa;
    }

    private void garantirAutomacaoEscalasIgreja(Igreja igreja, IgrejaPack pack, Map<String, User> usuarios) {
        if (escalaConfigAutomaticaRepository.findByIgrejaId(igreja.getId()).isEmpty()) {
            EscalaConfigAutomatica cfg = new EscalaConfigAutomatica();
            cfg.setIgreja(igreja);
            cfg.setMesesCiclo(3);
            cfg.setDiasAntecedencia(14);
            cfg.setAtivo(true);
            cfg.setAtualizadoEm(Instant.now());
            escalaConfigAutomaticaRepository.save(cfg);
        }

        User homem =
            usuarios.get(pack.cpfPortaria1()) != null
                ? usuarios.get(pack.cpfPortaria1())
                : usuarios.values().stream().filter(u -> u.getSexo() == Sexo.MASCULINO && !u.isDependente()).findFirst().orElse(null);
        User mulher =
            usuarios.get(pack.cpfRecepcao1()) != null
                ? usuarios.get(pack.cpfRecepcao1())
                : usuarios.values().stream().filter(u -> u.getSexo() == Sexo.FEMININO && !u.isDependente()).findFirst().orElse(null);

        Departamento portaria = buscarOuCriarDepartamentoAutomacao(igreja, "Portaria", CodigoDepartamento.PORTARIA, homem);
        Departamento recepcao = buscarOuCriarDepartamentoAutomacao(igreja, "Recepção", CodigoDepartamento.RECEPCAO, mulher);

        if (portaria == null || recepcao == null) {
            log.warn("DevSeed: igreja {} sem portaria/recepção — cultos não criados", igreja.getNome());
            return;
        }

        repararCultosSemRegras(igreja.getId(), portaria, recepcao);

        if (temCultosAutomacaoProntos(igreja.getId())) {
            log.info("DevSeed: cultos de automação já OK — {}", pack.conteudo().nomeFantasia());
            return;
        }

        String nome = pack.conteudo().nomeFantasia();
        log.info("DevSeed: cadastrando cultos de automação para {}", nome);
        criarCultoAutomacao(igreja, "Culto de quinta", DiaSemanaCulto.QUINTA, "19:00", portaria, recepcao);
        criarCultoAutomacao(igreja, "Culto de domingo", DiaSemanaCulto.DOMINGO, "09:00", portaria, recepcao);
    }

    private Departamento buscarOuCriarDepartamentoAutomacao(Igreja igreja, String nome, CodigoDepartamento codigo, User lider) {
        Optional<Departamento> existente = departamentoRepository
            .findByIgrejaIdOrderByNomeAsc(igreja.getId())
            .stream()
            .filter(d ->
                codigo.equals(d.getCodigo()) ||
                (d.getNome() != null && d.getNome().equalsIgnoreCase(nome)) ||
                (d.getNome() != null && d.getNome().toLowerCase().contains(nome.toLowerCase()))
            )
            .findFirst();
        if (existente.isPresent()) {
            Departamento d = existente.get();
            if (d.getCodigo() == null) {
                d.setCodigo(codigo);
                departamentoRepository.save(d);
            }
            return d;
        }
        return criarDepartamento(igreja, nome, codigo, lider);
    }

    private void repararCultosSemRegras(Long igrejaId, Departamento portaria, Departamento recepcao) {
        for (CultoRegistro culto : cultoRegistroRepository.findByIgrejaIdOrderByNomeAsc(igrejaId)) {
            if (!Boolean.TRUE.equals(culto.getAtivo())) {
                continue;
            }
            if (cultoEscalaRegraRepository.findByCultoRegistroId(culto.getId()).isEmpty()) {
                vincularRegraCulto(culto, portaria, RegraGeneroEscala.MASCULINO);
                vincularRegraCulto(culto, recepcao, RegraGeneroEscala.FEMININO);
            }
        }
    }

    private void seedEscalaAutomacao(Igreja igreja, Map<String, Departamento> deptos, IgrejaPack pack) {
        Map<String, User> usuarios = carregarUsuariosIgreja(igreja, pack);
        garantirAutomacaoEscalasIgreja(igreja, pack, usuarios);
    }

    private boolean temCultosAutomacaoProntos(Long igrejaId) {
        List<CultoRegistro> ativos = cultoRegistroRepository
            .findByIgrejaIdOrderByNomeAsc(igrejaId)
            .stream()
            .filter(c -> Boolean.TRUE.equals(c.getAtivo()))
            .toList();
        if (ativos.size() < 2) {
            return false;
        }
        long comRegras = ativos
            .stream()
            .filter(c -> !cultoEscalaRegraRepository.findByCultoRegistroId(c.getId()).isEmpty())
            .count();
        return comRegras >= 2;
    }

    private void criarCultoAutomacao(
        Igreja igreja,
        String nome,
        DiaSemanaCulto dia,
        String horario,
        Departamento portaria,
        Departamento recepcao
    ) {
        CultoRegistro culto = new CultoRegistro();
        culto.setIgreja(igreja);
        culto.setNome(nome);
        culto.setDiaSemana(dia);
        culto.setHorario(horario);
        culto.setAtivo(true);
        culto.setCriadoEm(Instant.now());
        culto = cultoRegistroRepository.save(culto);
        vincularRegraCulto(culto, portaria, RegraGeneroEscala.MASCULINO);
        vincularRegraCulto(culto, recepcao, RegraGeneroEscala.FEMININO);
    }

    private void vincularRegraCulto(CultoRegistro culto, Departamento departamento, RegraGeneroEscala genero) {
        CultoEscalaRegra regra = new CultoEscalaRegra();
        regra.setCultoRegistro(culto);
        regra.setDepartamento(departamento);
        regra.setRegraGenero(genero);
        regra.setAtivo(true);
        cultoEscalaRegraRepository.save(regra);
    }

    private Departamento criarDepartamento(Igreja igreja, String nome, CodigoDepartamento codigo, User lider) {
        Departamento d = new Departamento();
        d.setIgreja(igreja);
        d.setNome(nome);
        d.setCodigo(codigo);
        d.setOrientacoesServico(DepartamentoOrientacoesPadrao.sugerirPorCodigo(codigo));
        d.setAtivo(true);
        d.setLider(lider);
        d.setCriadoEm(Instant.now());
        return departamentoRepository.save(d);
    }

    private void vincularMembro(Departamento departamento, User user, String funcao) {
        DepartamentoMembro dm = new DepartamentoMembro();
        dm.setDepartamento(departamento);
        dm.setUser(user);
        dm.setFuncao(funcao);
        departamentoMembroRepository.save(dm);
    }

    private void criarEscala(Igreja igreja, Departamento departamento, String titulo, Instant dataEvento, List<User> membros) {
        Escala escala = new Escala();
        escala.setIgreja(igreja);
        escala.setDepartamento(departamento);
        escala.setTitulo(titulo);
        escala.setDataEvento(dataEvento);
        escala.setStatus(StatusEscalaPublicacao.PUBLICADA);
        escala.setObservacao("Escala mock dev.");
        escala.setCriadoEm(Instant.now());
        escala = escalaRepository.save(escala);
        for (User membro : membros) {
            EscalaItem item = new EscalaItem();
            item.setEscala(escala);
            item.setUser(membro);
            item.setFuncao("Voluntário");
            item.setConfirmado(true);
            item.setConfirmadoEm(Instant.now());
            escalaItemRepository.save(item);
        }
    }

    private void seedEventos(Igreja igreja, ConteudoIgreja conteudo, User membroH, User membroM) {
        if (eventoRepository.findAll().stream().anyMatch(e -> e.getIgreja() != null && igreja.getId().equals(e.getIgreja().getId()))) {
            return;
        }
        for (String[] ev : conteudo.eventos()) {
            int dias = Integer.parseInt(ev[3]);
            Instant inicio = LocalDate.now().plusDays(dias).atTime(Integer.parseInt(ev[4]), 0).atZone(ZoneId.systemDefault()).toInstant();
            Evento e = criarEvento(
                igreja,
                ev[0],
                ev[1],
                inicio,
                ev[2],
                true,
                80,
                CategoriaEvento.OUTRO,
                StatusEvento.PUBLICADO,
                PublicoEvento.INTERNO,
                null,
                null
            );
            inscreverEvento(e, membroH, true);
            inscreverEvento(e, membroM, true);
        }
    }

    /** Eventos ricos para testar o módulo evoluído (categorias, status, inscrições, check-in). */
    private void seedEventosModuloCompleto(Igreja igreja, Map<String, User> usuarios, IgrejaPack pack) {
        String marcador = "[EVT] " + pack.conteudo().nomeFantasia();
        if (
            eventoRepository
                .findAll()
                .stream()
                .anyMatch(e -> e.getIgreja() != null && igreja.getId().equals(e.getIgreja().getId()) && e.getTitulo() != null && e.getTitulo().startsWith(marcador))
        ) {
            return;
        }
        User pedro = usuarios.get(pack.cpfMembroH());
        User ana = usuarios.get(pack.cpfMembroM());
        User ricardo = membroCpfDerivado(usuarios, pack.cpfMembroH(), "61");
        User beatriz = membroCpfDerivado(usuarios, pack.cpfMembroM(), "71");
        User lider = usuarios.get(pack.cpfLider());

        ZoneId zone = ZoneId.of("America/Sao_Paulo");
        Instant cultoDomingo = LocalDate.now().plusDays(3).atTime(9, 30).atZone(zone).toInstant();
        Instant ebdSabado = LocalDate.now().plusDays(5).atTime(8, 0).atZone(zone).toInstant();
        Instant jovensSexta = LocalDate.now().plusDays(7).atTime(19, 30).atZone(zone).toInstant();
        Instant casaisSabado = LocalDate.now().plusDays(10).atTime(18, 0).atZone(zone).toInstant();
        Instant eventoPublico = LocalDate.now().plusDays(14).atTime(19, 0).atZone(zone).toInstant();
        Instant eventoPassado = LocalDate.now().minusDays(5).atTime(19, 0).atZone(zone).toInstant();
        Instant eventoAmanha = LocalDate.now().plusDays(1).atTime(19, 0).atZone(zone).toInstant();

        Evento culto = criarEvento(
            igreja,
            marcador + " — Culto dominical",
            "Culto de adoração e pregação da palavra.",
            cultoDomingo,
            "Templo principal",
            true,
            200,
            CategoriaEvento.CULTO,
            StatusEvento.PUBLICADO,
            PublicoEvento.INTERNO,
            "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800",
            null
        );
        Evento ebd = criarEvento(
            igreja,
            marcador + " — EBD",
            "Escola Bíblica Dominical — todas as classes.",
            ebdSabado,
            "Salão de aulas",
            true,
            60,
            CategoriaEvento.EBD,
            StatusEvento.PUBLICADO,
            PublicoEvento.INTERNO,
            null,
            null
        );
        Evento jovens = criarEvento(
            igreja,
            marcador + " — Encontro de jovens",
            "Louvor, palavra e comunhão para jovens.",
            jovensSexta,
            "Salão jovens",
            true,
            40,
            CategoriaEvento.JOVENS,
            StatusEvento.PUBLICADO,
            PublicoEvento.INTERNO,
            null,
            "https://forms.gle/exemplo-inscricao-jovens"
        );
        Evento casais = criarEvento(
            igreja,
            marcador + " — Encontro de casais",
            "Noite especial para casais — inscrições limitadas.",
            casaisSabado,
            "Salão social",
            true,
            30,
            CategoriaEvento.CASAIS,
            StatusEvento.PUBLICADO,
            PublicoEvento.INTERNO,
            null,
            null
        );
        casais.setPrazoCancelamentoInscricao(LocalDate.now().plusDays(8).atTime(23, 59).atZone(zone).toInstant());
        eventoRepository.save(casais);

        Evento publico = criarEvento(
            igreja,
            marcador + " — Conferência aberta",
            "Evento público divulgado no site da igreja.",
            eventoPublico,
            "Auditório",
            false,
            null,
            CategoriaEvento.TREINAMENTO,
            StatusEvento.PUBLICADO,
            PublicoEvento.PUBLICO,
            "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800",
            "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        );

        criarEvento(
            igreja,
            marcador + " — Rascunho interno",
            "Evento ainda não publicado — visível na gestão.",
            LocalDate.now().plusDays(20).atTime(10, 0).atZone(zone).toInstant(),
            "Sala de reuniões",
            false,
            20,
            CategoriaEvento.OUTRO,
            StatusEvento.RASCUNHO,
            PublicoEvento.INTERNO,
            null,
            null
        );

        Evento encerrado = criarEvento(
            igreja,
            marcador + " — Retiro (encerrado)",
            "Evento passado para testar aba Passados.",
            eventoPassado,
            "Chácara",
            false,
            50,
            CategoriaEvento.TREINAMENTO,
            StatusEvento.ENCERRADO,
            PublicoEvento.INTERNO,
            null,
            null
        );

        Evento amanha = criarEvento(
            igreja,
            marcador + " — Vigília de oração",
            "Vigília para testar lembrete de evento amanhã.",
            eventoAmanha,
            "Templo",
            true,
            100,
            CategoriaEvento.CULTO,
            StatusEvento.PUBLICADO,
            PublicoEvento.INTERNO,
            null,
            null
        );

        inscreverEvento(culto, pedro, false);
        inscreverEvento(culto, ana, true);
        inscreverEvento(culto, ricardo, false);
        inscreverEvento(ebd, pedro, false);
        inscreverEvento(ebd, beatriz, false);
        inscreverEvento(jovens, ana, false);
        inscreverEvento(jovens, beatriz, false);
        inscreverEvento(jovens, lider, false);
        inscreverEvento(casais, pedro, false);
        inscreverEvento(casais, ana, false);
        inscreverEvento(amanha, pedro, false);
        inscreverEvento(amanha, ana, false);
        inscreverEvento(encerrado, pedro, true);
        inscreverEvento(encerrado, ana, true);
    }

    private User membroCpfDerivado(Map<String, User> usuarios, String cpfBase, String sufixo) {
        if (cpfBase == null || cpfBase.length() < 3) {
            return null;
        }
        String cpf = cpfBase.substring(0, cpfBase.length() - 2) + sufixo;
        return usuarios.get(cpf);
    }

    private Evento criarEvento(
        Igreja igreja,
        String titulo,
        String descricao,
        Instant inicio,
        String local,
        boolean inscricoes,
        Integer capacidade,
        CategoriaEvento categoria,
        StatusEvento status,
        PublicoEvento publico,
        String imagemUrl,
        String linkExterno
    ) {
        Evento evento = new Evento();
        evento.setIgreja(igreja);
        evento.setTitulo(titulo);
        evento.setDescricao(descricao);
        evento.setDataInicio(inicio);
        evento.setDataFim(inicio.plus(2, ChronoUnit.HOURS));
        evento.setLocal(local);
        evento.setPublico(publico);
        evento.setInscricoesAbertas(inscricoes);
        evento.setCapacidade(capacidade);
        evento.setCategoria(categoria);
        evento.setStatus(status);
        evento.setImagemUrl(imagemUrl);
        evento.setLinkExterno(linkExterno);
        evento.setCriadoEm(Instant.now());
        return eventoRepository.save(evento);
    }

    private void inscreverEvento(Evento evento, User user, boolean checkIn) {
        if (user == null || evento == null) {
            return;
        }
        Optional<EventoInscricao> existente = eventoInscricaoRepository.findByEventoIdAndUserId(evento.getId(), user.getId());
        if (existente.isPresent()) {
            EventoInscricao inscricao = existente.get();
            inscricao.setStatus(StatusInscricaoEvento.ATIVA);
            inscricao.setConfirmado(checkIn);
            inscricao.setCanceladoEm(null);
            eventoInscricaoRepository.save(inscricao);
            return;
        }
        EventoInscricao inscricao = new EventoInscricao();
        inscricao.setEvento(evento);
        inscricao.setUser(user);
        inscricao.setConfirmado(checkIn);
        inscricao.setStatus(StatusInscricaoEvento.ATIVA);
        inscricao.setCriadoEm(Instant.now().minus(checkIn ? 2 : 0, ChronoUnit.DAYS));
        eventoInscricaoRepository.save(inscricao);
    }

    private void seedFinanceiro(Igreja igreja, ConteudoIgreja conteudo, String criadoPorLogin) {
        if (lancamentoRepository.findAll().stream().anyMatch(l -> l.getIgreja() != null && igreja.getId().equals(l.getIgreja().getId()) && l.getDescricao().contains(conteudo.nomeFantasia()))) {
            return;
        }
        LocalDate hoje = LocalDate.now();
        for (Object[] row : conteudo.financeiro()) {
            Lancamento l = new Lancamento();
            l.setIgreja(igreja);
            l.setTipo((TipoLancamento) row[0]);
            l.setCategoria((String) row[1]);
            l.setDescricao(conteudo.nomeFantasia() + " — " + row[2]);
            l.setValor(new BigDecimal((String) row[3]));
            l.setDataLancamento(hoje.minusDays((Integer) row[4]));
            l.setMetodoPagamento((String) row[5]);
            l.setCentroCusto((String) row[6]);
            l.setCriadoEm(Instant.now());
            l.setCriadoPor(criadoPorLogin);
            lancamentoRepository.save(l);
        }
    }

    private void seedLouvores(Igreja igreja, IgrejaPack pack) {
        if (!louvorRepository.findAllByIgrejaIdOrderByTituloAsc(igreja.getId()).isEmpty()) {
            return;
        }
        String[][] musicas = {
            { "Grande é o Senhor", "Hinos e Louvores", "G", "ADORACAO" },
            { "Oceanos", "Hillsong", "D", "ADORACAO" },
            { "Lugar Secreto", "Fernandinho", "A", "ADORACAO" },
            { "Raridade", "Anderson Freire", "C", "ADORACAO" },
            { "Tua Graça me Basta", "Paulo Cesar Baruk", "E", "ADORACAO" },
            { "Deus de Promessas", "Diante do Trono", "F", "JUBILO" },
            { "Celebramos", "Ministério Zoe", "A", "JUBILO" },
            { "Em Teu Altar", "Ministério Apascentar", "Bb", "CEIA" },
            { "Nada Além do Sangue", "Fernandinho", "C", "ADORACAO" },
            { "Bondade de Deus", "Bethel", "G", "ADORACAO" },
            { "Yeshua", "Ministério Avivah", "Am", "ADORACAO" },
            { "Reckless Love", "Cory Asbury", "D", "ADORACAO" },
            { "Santo Espírito", "Fhop Music", "E", "ADORACAO" },
            { "Estamos em Guerra", "Ministério Zoe", "F", "JUBILO" },
            { "Teu Amor Não Falha", "Nívea Soares", "A", "CEIA" },
        };
        List<Louvor> salvos = new ArrayList<>();
        for (String[] m : musicas) {
            Louvor louvor = new Louvor();
            louvor.setTitulo(m[0]);
            louvor.setArtista(m[1]);
            louvor.setTonalidade(m[2]);
            louvor.setTipo(TipoLouvor.valueOf(m[3]));
            louvor.setAtivo(true);
            louvor.setIgreja(igreja);
            louvor.setCifraConteudo("C | Am | F | G\n(Letra mock para testes)");
            salvos.add(louvorRepository.save(louvor));
        }
        criarGrupoLouvor(igreja, pack.conteudo().nomeFantasia() + " — Culto Dominical", 1, salvos.subList(0, 5));
        criarGrupoLouvor(igreja, pack.conteudo().nomeFantasia() + " — Culto de Quinta", 2, salvos.subList(5, 10));
        criarGrupoLouvor(igreja, pack.conteudo().nomeFantasia() + " — Ceia / Especial", 3, salvos.subList(10, 15));
    }

    private void criarGrupoLouvor(Igreja igreja, String nome, int ordemGrupo, List<Louvor> louvores) {
        GrupoLouvor grupo = new GrupoLouvor();
        grupo.setNome(nome);
        grupo.setOrdem(ordemGrupo);
        grupo.setIgreja(igreja);
        grupo = grupoLouvorRepository.save(grupo);
        int ordem = 1;
        for (Louvor louvor : louvores) {
            GrupoLouvorItem item = new GrupoLouvorItem();
            item.setGrupo(grupo);
            item.setLouvor(louvor);
            item.setOrdem(ordem++);
            grupoLouvorItemRepository.save(item);
        }
    }

    private void seedDevocionais(Igreja igreja, IgrejaPack pack) {
        if (!devocionalRepository.findAllByIgrejaIdOrderByDataPublicacaoDesc(igreja.getId(), PageRequest.of(0, 1)).isEmpty()) {
            return;
        }
        LocalDate hoje = LocalDate.now();
        String nome = pack.conteudo().nomeFantasia();
        for (int i = -3; i <= 3; i++) {
            Devocional d = new Devocional();
            d.setTitulo("Devocional " + nome + " — " + hoje.plusDays(i));
            d.setVersiculoBase("João 3:16");
            d.setTextoVersiculo("Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito.");
            d.setConteudo("Reflexão diária personalizada da " + pack.nome() + " para o dia " + hoje.plusDays(i) + ".");
            d.setDataPublicacao(hoje.plusDays(i));
            d.setIgreja(igreja);
            devocionalRepository.save(d);
        }
    }

    private void seedDocumentos(Igreja igreja, User uploader) {
        if (documentoIgrejaRepository.findAll().stream().anyMatch(d -> d.getIgreja() != null && igreja.getId().equals(d.getIgreja().getId()))) {
            return;
        }
        String[][] docs = {
            { "Estatuto social", "ESTATUTO" },
            { "Ata de assembleia 2025", "ATA" },
            { "CNPJ da igreja", "CNPJ" },
        };
        for (String[] doc : docs) {
            DocumentoIgreja d = new DocumentoIgreja();
            d.setIgreja(igreja);
            d.setUsuarioUpload(uploader);
            d.setNome(doc[0]);
            d.setDescricao("Documento mock para testes em dev.");
            d.setCategoria(CategoriaDocumentoIgreja.valueOf(doc[1]));
            d.setNomeArquivoOriginal(doc[0].replace(" ", "_") + ".pdf");
            d.setNomeArquivoArmazenado("seed/" + igreja.getSlug() + "/" + doc[1].toLowerCase() + ".pdf");
            d.setTipoArquivo("application/pdf");
            d.setTamanhoArquivo(1024L);
            d.setCaminhoArquivo("seed/" + igreja.getSlug() + "/" + doc[1].toLowerCase() + ".pdf");
            d.setDataDocumento(LocalDate.now().minusMonths(1));
            d.setDataUpload(Instant.now());
            d.setAtivo(true);
            documentoIgrejaRepository.save(d);
        }
    }

    private void seedCriancas(Igreja igreja, User pai, User mae, IgrejaPack pack) {
        if (!criancaRepository.findAll().stream().filter(c -> c.getIgreja() != null && igreja.getId().equals(c.getIgreja().getId())).toList().isEmpty()) {
            return;
        }
        String prefix = pack.conteudo().nomeFantasia();
        String[][] criancas = {
            { prefix + " — Miguel", "2018-03-10", "Berçário" },
            { prefix + " — Sofia", "2016-07-22", "Maternal" },
            { prefix + " — Enzo", "2014-11-05", "Primários" },
        };
        for (String[] c : criancas) {
            Crianca crianca = new Crianca();
            crianca.setIgreja(igreja);
            crianca.setNome(c[0]);
            crianca.setDataNascimento(LocalDate.parse(c[1]));
            crianca.setSala(c[2]);
            crianca.setAtivo(true);
            crianca = criancaRepository.save(crianca);
            if (mae != null) {
                CriancaResponsavel resp = new CriancaResponsavel();
                resp.setCrianca(crianca);
                resp.setUser(mae);
                resp.setParentesco("Mãe");
                criancaResponsavelRepository.save(resp);
            }
        }
    }

    private void seedDependentes(Igreja igreja, User pai, User mae, IgrejaPack pack) {
        if (pai == null || mae == null) {
            return;
        }
        if (userRepository.findAllByIgrejaIdAndActivatedIsTrue(igreja.getId()).stream().anyMatch(User::isDependente)) {
            return;
        }
        String prefix = pack.conteudo().nomeFantasia();
        List<DependenteSeed> dependentes = List.of(
            new DependenteSeed(prefix + " — Filho Teste Um", LocalDate.of(2015, 4, 8), pai.getId(), mae.getId()),
            new DependenteSeed(prefix + " — Filha Teste Dois", LocalDate.of(2017, 9, 12), pai.getId(), mae.getId())
        );
        for (DependenteSeed seed : dependentes) {
            DependenteCreateDTO dto = new DependenteCreateDTO();
            dto.setNome(seed.nome());
            dto.setBirthDate(seed.nascimento());
            dto.setPaiId(seed.paiId());
            dto.setMaeId(seed.maeId());
            User dep = userService.createDependente(dto);
            dep.setIgreja(igreja);
            userRepository.save(dep);
        }
    }

    private void seedSuporte(Igreja igreja, User solicitante, IgrejaPack pack) {
        if (solicitacaoSuporteRepository.findAll().stream().anyMatch(s -> s.getIgreja() != null && igreja.getId().equals(s.getIgreja().getId()))) {
            return;
        }
        SolicitacaoSuporte s = new SolicitacaoSuporte();
        s.setIgreja(igreja);
        s.setUsuarioSolicitante(solicitante);
        s.setNomeSolicitante(solicitante.getFirstName() + " " + solicitante.getLastName());
        s.setEmailSolicitante(solicitante.getEmail());
        s.setTelefoneSolicitante("11988887777");
        s.setTitulo("[" + pack.conteudo().nomeFantasia() + "] Dúvida sobre escalas");
        s.setDescricao("Ticket de teste da igreja " + pack.nome() + " — configurar automação de escalas.");
        s.setTipo(TipoSolicitacaoSuporte.DUVIDA);
        s.setPrioridade(PrioridadeSolicitacaoSuporte.MEDIA);
        s.setStatus(StatusSolicitacaoSuporte.ABERTA);
        solicitacaoSuporteRepository.save(s);
    }

    private LocalDate proximoDomingo() {
        LocalDate hoje = LocalDate.now();
        int dias = (7 - hoje.getDayOfWeek().getValue()) % 7;
        if (dias == 0) {
            dias = 7;
        }
        return hoje.plusDays(dias);
    }

    private void logarCredenciais() {
        log.info("========== CREDENCIAIS MOCK (dev) — CPF = login ==========");
        log.info("SUPER ADMIN (plataforma — somente 111...): 11111111111 / admin@SemearApp");
        log.info("--- Admin igreja Semear --- 12111111111 / semear121");
        log.info("--- Admin igreja Renovo --- 21111111111 / semear211");
        log.info("--- Admin igreja Monte Sião --- 31111111111 / semear311");
        log.info("--- Admin igreja Betânia --- 41111111111 / semear411");
        log.info("Pastores, secretarias, tesouraria etc. — hierarquia abaixo do admin da igreja");
        log.info("Tabela completa em COMANDOS-DEV.md | Somente @Profile dev");
        log.info("===========================================================");
    }

    private record ConteudoIgreja(
        String nomeFantasia,
        String[][] visitantes,
        String[][] avisos,
        String[][] informativos,
        Object[][] financeiro,
        String[][] eventos
    ) {}

    private record UsuarioSeed(
        String cpf,
        String firstName,
        String lastName,
        String email,
        PerfilAcesso perfil,
        Sexo sexo,
        String senha,
        int birthYear,
        int birthMonth,
        int birthDay
    ) {}

    private record DependenteSeed(String nome, LocalDate nascimento, Long paiId, Long maeId) {}

    private record IgrejaPack(
        String slug,
        String nome,
        String nomeFantasia,
        String cidade,
        String estado,
        String corPrimaria,
        String corSecundaria,
        String adminCpf,
        String adminSenha,
        String adminPrimeiroNome,
        String adminUltimoNome,
        String adminEmail,
        String cpfPastor,
        String cpfSecretaria,
        String cpfTesoureiro,
        String cpfLider,
        String cpfMembroH,
        String cpfMembroM,
        String cpfPortaria1,
        String cpfPortaria2,
        String cpfRecepcao1,
        String cpfRecepcao2,
        String cpfLimpeza1,
        String cpfLimpeza2,
        List<UsuarioSeed> equipePrincipal,
        List<UsuarioSeed> membrosExtras,
        ConteudoIgreja conteudo
    ) {
        String adminNome() {
            return adminPrimeiroNome + " " + adminUltimoNome;
        }

        List<String> todosCpfs() {
            List<String> cpfs = new ArrayList<>();
            cpfs.add(adminCpf);
            cpfs.add(cpfPastor);
            cpfs.add(cpfSecretaria);
            cpfs.add(cpfTesoureiro);
            cpfs.add(cpfLider);
            cpfs.add(cpfMembroH);
            cpfs.add(cpfMembroM);
            cpfs.add(cpfPortaria1);
            cpfs.add(cpfPortaria2);
            cpfs.add(cpfRecepcao1);
            cpfs.add(cpfRecepcao2);
            cpfs.add(cpfLimpeza1);
            cpfs.add(cpfLimpeza2);
            equipePrincipal.forEach(s -> cpfs.add(s.cpf()));
            membrosExtras.forEach(s -> cpfs.add(s.cpf()));
            return cpfs;
        }

        static final IgrejaPack SEMEAR = new IgrejaPack(
            "semear",
            "Igreja Semear",
            "Semear",
            "Fortaleza",
            "CE",
            "#1e3a5f",
            "#0d2137",
            "12111111111",
            "semear121",
            "Admin",
            "Semear",
            "admin.igreja@semear.test",
            "22222222222",
            "33333333333",
            "44444444444",
            "55555555555",
            "66666666666",
            "77777777777",
            "22222222201",
            "22222222202",
            "33333333301",
            "33333333302",
            "33333333303",
            "33333333304",
            List.of(),
            List.of(),
            conteudoSemear()
        );

        static final IgrejaPack RENOVO = new IgrejaPack(
            "renovo-vida",
            "Igreja Evangélica Renovo de Vida",
            "Renovo",
            "Fortaleza",
            "CE",
            "#2d6a4f",
            "#1b4332",
            "21111111111",
            "semear211",
            "Admin",
            "Renovo",
            "admin@renovo-vida.test",
            "21111111222",
            "21111111333",
            "21111111444",
            "21111111555",
            "21111111666",
            "21111111777",
            "21111112101",
            "21111112102",
            "21111112301",
            "21111112302",
            "21111112303",
            "21111112304",
            equipeRenovo(),
            extrasRenovo(),
            conteudoRenovo()
        );

        static final IgrejaPack MONTE_SIAO = new IgrejaPack(
            "monte-siao",
            "Comunidade Monte Sião",
            "Monte Sião",
            "Recife",
            "PE",
            "#5c4d7d",
            "#3d2c5e",
            "31111111111",
            "semear311",
            "Admin",
            "Monte Sião",
            "admin@monte-siao.test",
            "31111111222",
            "31111111333",
            "31111111444",
            "31111111555",
            "31111111666",
            "31111111777",
            "31111112101",
            "31111112102",
            "31111112301",
            "31111112302",
            "31111112303",
            "31111112304",
            equipeMonteSiao(),
            extrasMonteSiao(),
            conteudoMonteSiao()
        );

        static final IgrejaPack BETANIA = new IgrejaPack(
            "betania",
            "Igreja Batista Betânia",
            "Betânia",
            "Natal",
            "RN",
            "#b5651d",
            "#8b4513",
            "41111111111",
            "semear411",
            "Admin",
            "Betânia",
            "admin@betania.test",
            "41111111222",
            "41111111333",
            "41111111444",
            "41111111555",
            "41111111666",
            "41111111777",
            "41111112101",
            "41111112102",
            "41111112301",
            "41111112302",
            "41111112303",
            "41111112304",
            equipeBetania(),
            extrasBetania(),
            conteudoBetania()
        );

        private static List<UsuarioSeed> equipeRenovo() {
            return List.of(
                new UsuarioSeed("21111111222", "Paulo", "Menezes", "pastor@renovo-vida.test", PerfilAcesso.PASTOR, Sexo.MASCULINO, "semear212", 1976, 2, 10),
                new UsuarioSeed("21111111333", "Carla", "Dias", "secretaria@renovo-vida.test", PerfilAcesso.SECRETARIA, Sexo.FEMININO, "semear213", 1984, 8, 5),
                new UsuarioSeed("21111111444", "Eduardo", "Freitas", "tesouraria@renovo-vida.test", PerfilAcesso.TESOURARIA, Sexo.MASCULINO, "semear214", 1981, 11, 20),
                new UsuarioSeed("21111111555", "Rafael", "Nogueira", "louvor@renovo-vida.test", PerfilAcesso.LIDER, Sexo.MASCULINO, "semear215", 1990, 4, 3),
                new UsuarioSeed("21111111666", "Marcos", "Teixeira", "marcos@renovo-vida.test", PerfilAcesso.MEMBRO, Sexo.MASCULINO, "semear216", 1992, 6, 18),
                new UsuarioSeed("21111111777", "Larissa", "Moura", "larissa@renovo-vida.test", PerfilAcesso.MEMBRO, Sexo.FEMININO, "semear217", 1995, 9, 25)
            );
        }

        private static List<UsuarioSeed> extrasRenovo() {
            return List.of(
                new UsuarioSeed("21111112101", "Geraldo", "Castro", "portaria1@renovo-vida.test", PerfilAcesso.MEMBRO, Sexo.MASCULINO, "semear221", 1987, 1, 14),
                new UsuarioSeed("21111112102", "Vinícius", "Pacheco", "portaria2@renovo-vida.test", PerfilAcesso.MEMBRO, Sexo.MASCULINO, "semear222", 1991, 5, 8),
                new UsuarioSeed("21111112301", "Aline", "Borges", "recepcao1@renovo-vida.test", PerfilAcesso.MEMBRO, Sexo.FEMININO, "semear231", 1989, 3, 22),
                new UsuarioSeed("21111112302", "Vanessa", "Cardoso", "recepcao2@renovo-vida.test", PerfilAcesso.MEMBRO, Sexo.FEMININO, "semear232", 1993, 7, 11),
                new UsuarioSeed("21111112303", "Renata", "Farias", "limpeza1@renovo-vida.test", PerfilAcesso.MEMBRO, Sexo.FEMININO, "semear233", 1986, 10, 30),
                new UsuarioSeed("21111112304", "Tatiane", "Guedes", "limpeza2@renovo-vida.test", PerfilAcesso.MEMBRO, Sexo.FEMININO, "semear234", 1994, 12, 2),
                new UsuarioSeed("21111111661", "Thiago", "Holanda", "thiago@renovo-vida.test", PerfilAcesso.MEMBRO, Sexo.MASCULINO, "semear261", 1988, 4, 17),
                new UsuarioSeed("21111111771", "Priscila", "Ivo", "priscila@renovo-vida.test", PerfilAcesso.MEMBRO, Sexo.FEMININO, "semear271", 1996, 8, 9),
                new UsuarioSeed("21111111888", "José", "Visitante", "visitante@renovo-vida.test", PerfilAcesso.VISITANTE, Sexo.MASCULINO, "semear218", 1999, 2, 14)
            );
        }

        private static List<UsuarioSeed> equipeMonteSiao() {
            return List.of(
                new UsuarioSeed("31111111222", "Samuel", "Barros", "pastor@monte-siao.test", PerfilAcesso.PASTOR, Sexo.MASCULINO, "semear312", 1974, 5, 12),
                new UsuarioSeed("31111111333", "Helena", "Vasconcelos", "secretaria@monte-siao.test", PerfilAcesso.SECRETARIA, Sexo.FEMININO, "semear313", 1983, 9, 7),
                new UsuarioSeed("31111111444", "Otávio", "Cavalcanti", "tesouraria@monte-siao.test", PerfilAcesso.TESOURARIA, Sexo.MASCULINO, "semear314", 1979, 12, 1),
                new UsuarioSeed("31111111555", "Daniel", "Lacerda", "louvor@monte-siao.test", PerfilAcesso.LIDER, Sexo.MASCULINO, "semear315", 1988, 2, 28),
                new UsuarioSeed("31111111666", "Bruno", "Macedo", "bruno@monte-siao.test", PerfilAcesso.MEMBRO, Sexo.MASCULINO, "semear316", 1991, 6, 15),
                new UsuarioSeed("31111111777", "Camila", "Queiroz", "camila@monte-siao.test", PerfilAcesso.MEMBRO, Sexo.FEMININO, "semear317", 1994, 11, 3)
            );
        }

        private static List<UsuarioSeed> extrasMonteSiao() {
            return List.of(
                new UsuarioSeed("31111112101", "Francisco", "Arruda", "portaria1@monte-siao.test", PerfilAcesso.MEMBRO, Sexo.MASCULINO, "semear321", 1985, 3, 19),
                new UsuarioSeed("31111112102", "Igor", "Sena", "portaria2@monte-siao.test", PerfilAcesso.MEMBRO, Sexo.MASCULINO, "semear322", 1990, 8, 24),
                new UsuarioSeed("31111112301", "Débora", "Lins", "recepcao1@monte-siao.test", PerfilAcesso.MEMBRO, Sexo.FEMININO, "semear331", 1987, 1, 6),
                new UsuarioSeed("31111112302", "Gabriela", "Torres", "recepcao2@monte-siao.test", PerfilAcesso.MEMBRO, Sexo.FEMININO, "semear332", 1992, 4, 21),
                new UsuarioSeed("31111112303", "Sueli", "Paiva", "limpeza1@monte-siao.test", PerfilAcesso.MEMBRO, Sexo.FEMININO, "semear333", 1984, 7, 13),
                new UsuarioSeed("31111112304", "Michele", "Ramos", "limpeza2@monte-siao.test", PerfilAcesso.MEMBRO, Sexo.FEMININO, "semear334", 1993, 10, 8),
                new UsuarioSeed("31111111661", "Felipe", "Coelho", "felipe@monte-siao.test", PerfilAcesso.MEMBRO, Sexo.MASCULINO, "semear361", 1989, 5, 27),
                new UsuarioSeed("31111111771", "Juliana", "Peixoto", "juliana@monte-siao.test", PerfilAcesso.MEMBRO, Sexo.FEMININO, "semear371", 1997, 2, 14),
                new UsuarioSeed("31111111888", "José", "Visitante", "visitante@monte-siao.test", PerfilAcesso.VISITANTE, Sexo.MASCULINO, "semear318", 2000, 3, 8)
            );
        }

        private static List<UsuarioSeed> equipeBetania() {
            return List.of(
                new UsuarioSeed("41111111222", "Josué", "Montenegro", "pastor@betania.test", PerfilAcesso.PASTOR, Sexo.MASCULINO, "semear412", 1973, 6, 9),
                new UsuarioSeed("41111111333", "Ruth", "Aguiar", "secretaria@betania.test", PerfilAcesso.SECRETARIA, Sexo.FEMININO, "semear413", 1982, 10, 16),
                new UsuarioSeed("41111111444", "Manoel", "Correia", "tesouraria@betania.test", PerfilAcesso.TESOURARIA, Sexo.MASCULINO, "semear414", 1978, 3, 4),
                new UsuarioSeed("41111111555", "Leonardo", "Furtado", "louvor@betania.test", PerfilAcesso.LIDER, Sexo.MASCULINO, "semear415", 1987, 8, 22),
                new UsuarioSeed("41111111666", "Gustavo", "Miranda", "gustavo@betania.test", PerfilAcesso.MEMBRO, Sexo.MASCULINO, "semear416", 1990, 12, 11),
                new UsuarioSeed("41111111777", "Bianca", "Severino", "bianca@betania.test", PerfilAcesso.MEMBRO, Sexo.FEMININO, "semear417", 1993, 5, 30)
            );
        }

        private static List<UsuarioSeed> extrasBetania() {
            return List.of(
                new UsuarioSeed("41111112101", "Antônio", "Bezerra", "portaria1@betania.test", PerfilAcesso.MEMBRO, Sexo.MASCULINO, "semear421", 1986, 2, 18),
                new UsuarioSeed("41111112102", "Caio", "Dantas", "portaria2@betania.test", PerfilAcesso.MEMBRO, Sexo.MASCULINO, "semear422", 1991, 9, 5),
                new UsuarioSeed("41111112301", "Eliane", "Porto", "recepcao1@betania.test", PerfilAcesso.MEMBRO, Sexo.FEMININO, "semear431", 1988, 4, 26),
                new UsuarioSeed("41111112302", "Fernanda", "Sales", "recepcao2@betania.test", PerfilAcesso.MEMBRO, Sexo.FEMININO, "semear432", 1992, 11, 7),
                new UsuarioSeed("41111112303", "Luciana", "Tavares", "limpeza1@betania.test", PerfilAcesso.MEMBRO, Sexo.FEMININO, "semear433", 1985, 6, 14),
                new UsuarioSeed("41111112304", "Simone", "Viana", "limpeza2@betania.test", PerfilAcesso.MEMBRO, Sexo.FEMININO, "semear434", 1994, 1, 23),
                new UsuarioSeed("41111111661", "Rodrigo", "Xavier", "rodrigo@betania.test", PerfilAcesso.MEMBRO, Sexo.MASCULINO, "semear461", 1989, 7, 2),
                new UsuarioSeed("41111111771", "Tainá", "Zanetti", "taina@betania.test", PerfilAcesso.MEMBRO, Sexo.FEMININO, "semear471", 1996, 3, 19),
                new UsuarioSeed("41111111888", "José", "Visitante", "visitante@betania.test", PerfilAcesso.VISITANTE, Sexo.MASCULINO, "semear418", 2001, 1, 20)
            );
        }

        private static ConteudoIgreja conteudoSemear() {
            return new ConteudoIgreja(
                "Semear",
                new String[][] {
                    { "Felipe Andrade", "85977776666", "Indicação de membro", "CADASTRADO", "CONVIDADO", "Pedro Membro" },
                    { "Amanda Teixeira", "85966665555", "Instagram da igreja", "CONTATO_FEITO", "SOZINHO", "Redes sociais" },
                    { "Rafael Gomes", "85955554444", "Passou na frente do templo", "PARTICIPOU_CULTO", "SOZINHO", "—" },
                    { "Carla Duarte", "85944443333", "Convite do pastor", "INTEGRACAO", "CONVIDADO", "Pr. João" },
                    { "Bruno Ferreira", "85933332222", "Culto de quinta", "ACOMPANHAMENTO", "COM_ALGUEM", "Ana Membro" },
                    { "Débora Campos", "85922221111", "Amiga da secretária", "CADASTRADO", "CONVIDADO", "Maria Secretária" },
                    { "Henrique Pires", "85911110000", "Google Maps", "CONTATO_FEITO", "SOZINHO", "—" },
                    { "Isabela Rios", "85900009999", "Família de membro", "PARTICIPOU_CULTO", "COM_ALGUEM", "Ricardo Barbosa" },
                },
                new String[][] {
                    { "Culto de quinta — tema Esperança", "Culto de oração e ensino nesta quinta às 19h30 no templo Semear.", "NORMAL" },
                    { "URGENTE: reforma do estacionamento", "Estacionamento lateral interditado no sábado para obras.", "URGENTE" },
                    { "Horários da secretaria Semear", "Atendimento terça e quinta, 14h às 17h.", "FIXO" },
                    { "Campanha reforma do salão", "Contribua via PIX tesouraria — meta R$ 25.000.", "NORMAL" },
                    { "Ensaio louvor domingo", "Ensaio geral domingo às 8h — equipe de louvor Semear.", "NORMAL" },
                    { "EBI — inscrições abertas", "Escola Bíblica Infantil: vagas para berçário e maternal.", "NORMAL" },
                },
                new String[][] {
                    { "Bem-vindo à Semear", "Que alegria ter você conosco na Igreja Semear!", "BOAS_VINDAS", "TODOS", "ALTA", "true" },
                    { "Política de escalas Semear", "Escalas publicadas com 14 dias de antecedência. Confirme presença no app.", "INFORMATIVO", "MEMBROS", "NORMAL", "false" },
                    { "Retiro de jovens Semear", "Inscrições até sexta — fale com a secretaria.", "AVISO", "MEMBROS", "NORMAL", "false" },
                    { "Tesouraria — prestação de contas", "Assembleia de prestação de contas no domingo após o culto.", "INFORMATIVO", "LIDERANCA", "ALTA", "false" },
                    { "Novos membros", "Complete seu cadastro e participe de um grupo de célula.", "INFORMATIVO", "NOVOS_USUARIOS", "NORMAL", "true" },
                },
                new Object[][] {
                    { TipoLancamento.INCOME, "Dízimos", "Culto domingo manhã", "12500.00", 2, "PIX", "Culto" },
                    { TipoLancamento.INCOME, "Dízimos", "Culto domingo noite", "9800.00", 2, "Dinheiro", "Culto" },
                    { TipoLancamento.INCOME, "Ofertas", "Oferta missionária África", "3200.00", 5, "PIX", "Missões" },
                    { TipoLancamento.INCOME, "Ofertas", "Oferta construção", "4500.00", 8, "Transferência", "Obras" },
                    { TipoLancamento.INCOME, "Doações", "Doação anônima reforma", "1500.00", 12, "PIX", "Obras" },
                    { TipoLancamento.EXPENSE, "Manutenção", "Reparo ar-condicionado salão", "1850.00", 4, "PIX", "Infraestrutura" },
                    { TipoLancamento.EXPENSE, "Utilidades", "Conta de energia março", "1420.00", 7, "Boleto", "Infraestrutura" },
                    { TipoLancamento.EXPENSE, "Utilidades", "Internet e telefone", "380.00", 7, "Débito automático", "Infraestrutura" },
                    { TipoLancamento.EXPENSE, "Salários", "Honorários pastoral", "3500.00", 1, "Transferência", "Pessoal" },
                    { TipoLancamento.EXPENSE, "Material", "Material EBI e berçário", "620.00", 10, "Cartão", "Ministérios" },
                    { TipoLancamento.EXPENSE, "Eventos", "Coffee break encontro de casais", "340.00", 15, "PIX", "Eventos" },
                    { TipoLancamento.EXPENSE, "Missões", "Envio missionário local", "800.00", 20, "PIX", "Missões" },
                },
                new String[][] {
                    { "Noite de Louvor Semear", "Culto especial de adoração com convidados.", "Templo Semear", "10", "19" },
                    { "Encontro de Casais Semear", "Comunhão e palestra para casais da igreja.", "Salão social", "20", "9" },
                    { "Conferência Semear Jovem", "Três dias de louvor, palavra e comunhão.", "Auditório", "35", "18" },
                }
            );
        }

        private static ConteudoIgreja conteudoRenovo() {
            return new ConteudoIgreja(
                "Renovo",
                new String[][] {
                    { "Lucas Ceará", "85991112233", "Culto na praça Aldeota", "PARTICIPOU_CULTO", "SOZINHO", "—" },
                    { "Marina Sousa", "85992223344", "Convite da Larissa", "INTEGRACAO", "CONVIDADO", "Larissa Moura" },
                    { "Tiago Ribeiro", "85993334455", "Facebook Renovo", "CONTATO_FEITO", "SOZINHO", "Redes sociais" },
                    { "Patrícia Lopes", "85994445566", "Grupo de jovens", "ACOMPANHAMENTO", "COM_ALGUEM", "Rafael Nogueira" },
                    { "Eduardo Nascimento", "85995556677", "Família de membro", "CADASTRADO", "CONVIDADO", "Marcos Teixeira" },
                    { "Fernanda Bezerra", "85996667788", "Panfletagem bairro", "CONTATO_FEITO", "SOZINHO", "Equipe evangelismo" },
                    { "Gustavo Melo", "85997778899", "Culto de quinta Renovo", "PARTICIPOU_CULTO", "COM_ALGUEM", "Pr. Paulo" },
                    { "Helena Aragão", "85998889900", "Indicação de vizinha", "CADASTRADO", "CONVIDADO", "Carla Dias" },
                },
                new String[][] {
                    { "Culto de cura — Renovo", "Quarta-feira 19h30: culto de oração e cura no templo Renovo.", "NORMAL" },
                    { "URGENTE: água no templo", "Hoje não haverá água das 8h às 12h — usem o banheiro social.", "URGENTE" },
                    { "Mutirão de limpeza Renovo", "Sábado 8h: mutirão geral antes do culto dominical.", "NORMAL" },
                    { "Campanha cestas básicas", "Arrecadação de alimentos para famílias do bairro Aldeota.", "NORMAL" },
                    { "Ensaio coral Renovo", "Ensaio do coral sexta às 20h.", "NORMAL" },
                },
                new String[][] {
                    { "Bem-vindo ao Renovo", "A Comunidade Renovo de Vida te recebe de braços abertos!", "BOAS_VINDAS", "TODOS", "ALTA", "true" },
                    { "Células Renovo", "Participe de uma célula na sua região — fale com o pastor Paulo.", "INFORMATIVO", "MEMBROS", "NORMAL", "false" },
                    { "Prestação de contas Renovo", "Tesouraria publicará o relatório mensal no mural.", "INFORMATIVO", "LIDERANCA", "NORMAL", "false" },
                    { "Batismo nas águas", "Próximo batismo: inscrições na secretaria até dia 15.", "AVISO", "MEMBROS", "ALTA", "false" },
                },
                new Object[][] {
                    { TipoLancamento.INCOME, "Dízimos", "Culto domingo Renovo", "6800.00", 3, "PIX", "Culto" },
                    { TipoLancamento.INCOME, "Ofertas", "Oferta social Renovo", "1100.00", 5, "Dinheiro", "Social" },
                    { TipoLancamento.INCOME, "Doações", "Doação reforma cozinha", "2500.00", 9, "PIX", "Obras" },
                    { TipoLancamento.EXPENSE, "Social", "Cestas básicas — famílias Aldeota", "950.00", 6, "PIX", "Social" },
                    { TipoLancamento.EXPENSE, "Utilidades", "Energia elétrica Renovo", "780.00", 8, "Boleto", "Infraestrutura" },
                    { TipoLancamento.EXPENSE, "Manutenção", "Pintura fachada templo", "2200.00", 14, "Transferência", "Obras" },
                    { TipoLancamento.EXPENSE, "Material", "Som e microfones", "450.00", 11, "Cartão", "Louvor" },
                    { TipoLancamento.EXPENSE, "Eventos", "Lanche encontro de mulheres", "280.00", 18, "PIX", "Eventos" },
                    { TipoLancamento.INCOME, "Dízimos", "Culto de quinta Renovo", "2100.00", 1, "PIX", "Culto" },
                    { TipoLancamento.EXPENSE, "Salários", "Secretaria — honorários", "1200.00", 1, "Transferência", "Pessoal" },
                },
                new String[][] {
                    { "Vigília Renovo", "Vigília de oração da madrugada — traga sua Bíblia.", "Templo Renovo", "12", "22" },
                    { "Encontro de Mulheres Renovo", "Palestra e comunhão — tema Identidade em Cristo.", "Salão Renovo", "25", "14" },
                }
            );
        }

        private static ConteudoIgreja conteudoMonteSiao() {
            return new ConteudoIgreja(
                "Monte Sião",
                new String[][] {
                    { "Anderson Pernambuco", "81981112233", "Rádio local Recife", "CONTATO_FEITO", "SOZINHO", "—" },
                    { "Letícia Oliveira", "81982223344", "Convite da Camila", "PARTICIPOU_CULTO", "CONVIDADO", "Camila Queiroz" },
                    { "Robson Lima", "81983334455", "Caminhada evangelística", "INTEGRACAO", "COM_ALGUEM", "Equipe jovens" },
                    { "Vera Mendes", "81984445566", "Vizinha do templo", "CADASTRADO", "SOZINHO", "—" },
                    { "Paulo Henrique", "81985556677", "Instagram Monte Sião", "ACOMPANHAMENTO", "SOZINHO", "Redes sociais" },
                    { "Quitéria Ramos", "81986667788", "EBD convite", "CONTATO_FEITO", "CONVIDADO", "Helena Vasconcelos" },
                    { "Ricardo Nunes", "81987778899", "Culto domingo noite", "PARTICIPOU_CULTO", "COM_ALGUEM", "Bruno Macedo" },
                    { "Sandra Pontes", "81988889900", "Amiga de membro", "CADASTRADO", "CONVIDADO", "Juliana Peixoto" },
                },
                new String[][] {
                    { "Culto Monte Sião — domingo", "Cultos às 9h e 18h. Traga um visitante!", "NORMAL" },
                    { "URGENTE: chuva forte", "Culto de quinta transferido para o salão coberto.", "URGENTE" },
                    { "Projeto Monte Sião Social", "Arrecadação de roupas de inverno para comunidade carente.", "NORMAL" },
                    { "Escola de líderes", "Inscrições abertas — 8 encontros às terças.", "NORMAL" },
                    { "Ensaio banda Monte Sião", "Ensaio sábado 16h no subsolo.", "NORMAL" },
                },
                new String[][] {
                    { "Bem-vindo ao Monte Sião", "Comunidade Monte Sião — Recife/PE. Seja bem-vindo!", "BOAS_VINDAS", "TODOS", "ALTA", "true" },
                    { "Dízimos e ofertas Monte Sião", "Contribua via PIX da tesouraria — QR no mural.", "INFORMATIVO", "MEMBROS", "NORMAL", "false" },
                    { "Escalas automáticas", "Confirme sua escala em até 48h após publicação.", "INFORMATIVO", "MEMBROS", "ALTA", "true" },
                    { "Conselho de anciãos", "Reunião mensal — somente liderança convocada.", "AVISO", "LIDERANCA", "URGENTE", "false" },
                },
                new Object[][] {
                    { TipoLancamento.INCOME, "Dízimos", "Culto domingo manhã Monte Sião", "9200.00", 2, "PIX", "Culto" },
                    { TipoLancamento.INCOME, "Ofertas", "Oferta projeto social", "1800.00", 4, "Dinheiro", "Social" },
                    { TipoLancamento.INCOME, "Doações", "Instrumentos louvor", "3000.00", 10, "PIX", "Louvor" },
                    { TipoLancamento.EXPENSE, "Social", "Distribuição roupas inverno", "1200.00", 7, "PIX", "Social" },
                    { TipoLancamento.EXPENSE, "Utilidades", "Água e esgoto", "420.00", 9, "Boleto", "Infraestrutura" },
                    { TipoLancamento.EXPENSE, "Manutenção", "Conserto telhado salão", "3500.00", 16, "Transferência", "Obras" },
                    { TipoLancamento.EXPENSE, "Material", "Apostilas escola de líderes", "560.00", 12, "Cartão", "Ensino" },
                    { TipoLancamento.EXPENSE, "Eventos", "Transporte conferência jovens", "890.00", 20, "PIX", "Eventos" },
                    { TipoLancamento.INCOME, "Dízimos", "Culto quinta Monte Sião", "2400.00", 1, "PIX", "Culto" },
                    { TipoLancamento.EXPENSE, "Salários", "Equipe limpeza", "900.00", 1, "PIX", "Pessoal" },
                },
                new String[][] {
                    { "Conferência Monte Sião Jovem", "Três dias de louvor e palavra para jovens de Recife.", "Ginásio Monte Sião", "18", "19" },
                    { "Café com Pastores", "Encontro de networking ministerial — convite aberto.", "Salão principal", "30", "8" },
                }
            );
        }

        private static ConteudoIgreja conteudoBetania() {
            return new ConteudoIgreja(
                "Betânia",
                new String[][] {
                    { "Jonas Natal", "84991112233", "Batismo de prima", "PARTICIPOU_CULTO", "COM_ALGUEM", "Família Silva" },
                    { "Cristiane Freire", "84992223344", "EBD Betânia", "INTEGRACAO", "CONVIDADO", "Ruth Aguiar" },
                    { "Hélio Costa", "84993334455", "Panfletagem Ponta Negra", "CONTATO_FEITO", "SOZINHO", "—" },
                    { "Márcia Duarte", "84994445566", "Convite da Bianca", "CADASTRADO", "CONVIDADO", "Bianca Severino" },
                    { "Renan Souza", "84995556677", "Site da igreja", "ACOMPANHAMENTO", "SOZINHO", "Site Betânia" },
                    { "Olívia Martins", "84996667788", "Culto de quarta", "PARTICIPOU_CULTO", "COM_ALGUEM", "Gustavo Miranda" },
                    { "Paulo César", "84997778899", "Indicação pastoral", "CONTATO_FEITO", "CONVIDADO", "Pr. Josué" },
                    { "Rita Cavalcanti", "84998889900", "Grupo de mulheres", "CADASTRADO", "CONVIDADO", "Eliane Porto" },
                },
                new String[][] {
                    { "EBD Betânia — domingo", "Escola Bíblica Dominical às 8h — todas as classes.", "NORMAL" },
                    { "URGENTE: assembleia geral", "Assembleia extraordinária domingo após o culto.", "URGENTE" },
                    { "Reforma do batistério", "Obras no batistério — cultos no salão auxiliar.", "NORMAL" },
                    { "Campanha Bíblias Betânia", "Doe Bíblias para novos convertidos.", "NORMAL" },
                    { "Coro Betânia — ensaio", "Ensaio quinta 20h no templo.", "NORMAL" },
                },
                new String[][] {
                    { "Bem-vindo à Betânia", "Igreja Batista Betânia — Natal/RN. Graça e paz!", "BOAS_VINDAS", "TODOS", "ALTA", "true" },
                    { "EBD e classes", "Confira sua classe na secretaria ou no mural.", "INFORMATIVO", "MEMBROS", "NORMAL", "false" },
                    { "Tesouraria Betânia", "Relatório financeiro disponível para membros no balcão.", "INFORMATIVO", "LIDERANCA", "NORMAL", "false" },
                    { "Batismo Betânia", "Próximo batismo no batistério — inscrições abertas.", "AVISO", "MEMBROS", "ALTA", "false" },
                },
                new Object[][] {
                    { TipoLancamento.INCOME, "Dízimos", "Culto domingo Betânia", "7400.00", 3, "PIX", "Culto" },
                    { TipoLancamento.INCOME, "Ofertas", "Oferta EBD", "650.00", 3, "Dinheiro", "Ensino" },
                    { TipoLancamento.INCOME, "Doações", "Doação batistério", "5000.00", 11, "PIX", "Obras" },
                    { TipoLancamento.EXPENSE, "Obras", "Reforma batistério fase 1", "4200.00", 8, "Transferência", "Obras" },
                    { TipoLancamento.EXPENSE, "Utilidades", "Energia templo Betânia", "690.00", 7, "Boleto", "Infraestrutura" },
                    { TipoLancamento.EXPENSE, "Material", "Bíblias novos convertidos", "480.00", 13, "Cartão", "Ensino" },
                    { TipoLancamento.EXPENSE, "Manutenção", "Cadeiras salão principal", "1100.00", 15, "PIX", "Infraestrutura" },
                    { TipoLancamento.EXPENSE, "Eventos", "Lanche EBD especial", "220.00", 4, "PIX", "Eventos" },
                    { TipoLancamento.INCOME, "Dízimos", "Culto quarta Betânia", "1900.00", 1, "PIX", "Culto" },
                    { TipoLancamento.EXPENSE, "Salários", "Pastor — ajuda de custo", "2800.00", 1, "Transferência", "Pessoal" },
                },
                new String[][] {
                    { "Congresso Batista Betânia", "Congresso regional com preletores convidados.", "Templo Betânia", "22", "9" },
                    { "Noite de Testemunhos", "Compartilhe o que Deus tem feito — culto especial.", "Salão Betânia", "14", "19" },
                }
            );
        }
    }
}
