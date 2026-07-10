package br.com.semear.service;

import br.com.semear.domain.Igreja;
import br.com.semear.domain.IgrejaCargo;
import br.com.semear.domain.IgrejaCargoModulo;
import br.com.semear.domain.User;
import br.com.semear.domain.UserIgrejaCargo;
import br.com.semear.domain.enumeration.NivelAcessoModulo;
import br.com.semear.repository.IgrejaCargoRepository;
import br.com.semear.repository.IgrejaRepository;
import br.com.semear.repository.UserIgrejaCargoRepository;
import br.com.semear.repository.UserRepository;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.service.dto.AdminUserDTO;
import br.com.semear.service.dto.IgrejaCargoDTO;
import br.com.semear.service.dto.ModuloPermissaoDTO;
import br.com.semear.web.rest.errors.BadRequestAlertException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class IgrejaCargoService {

    private static final String ENTITY = "igrejaCargo";

    public static final List<String> MODULOS = List.of(
        "dashboard",
        "biblia",
        "devocionais",
        "louvores",
        "membros",
        "visitantes",
        "comunicados",
        "financeiro",
        "oracao",
        "aprovar-pre-cadastros",
        "configuracoes",
        "departamentos",
        "escalas",
        "eventos"
    );

    private final IgrejaCargoRepository cargoRepository;
    private final UserIgrejaCargoRepository userCargoRepository;
    private final IgrejaRepository igrejaRepository;
    private final UserRepository userRepository;
    private final TenantService tenantService;

    public IgrejaCargoService(
        IgrejaCargoRepository cargoRepository,
        UserIgrejaCargoRepository userCargoRepository,
        IgrejaRepository igrejaRepository,
        UserRepository userRepository,
        TenantService tenantService
    ) {
        this.cargoRepository = cargoRepository;
        this.userCargoRepository = userCargoRepository;
        this.igrejaRepository = igrejaRepository;
        this.userRepository = userRepository;
        this.tenantService = tenantService;
    }

    @Transactional
    public List<IgrejaCargoDTO> listar() {
        Long igrejaId = tenantService.getIgrejaIdAtual();
        garantirCargosPadrao(igrejaId);
        return cargoRepository.findByIgrejaIdOrderByOrdemAscNomeAsc(igrejaId).stream().map(this::toDto).toList();
    }

    public IgrejaCargoDTO salvar(IgrejaCargoDTO dto) {
        validarGestao();
        Long igrejaId = tenantService.getIgrejaIdAtual();
        garantirCargosPadrao(igrejaId);

        IgrejaCargo cargo;
        if (dto.getId() != null) {
            cargo = cargoRepository.findByIdAndIgrejaId(dto.getId(), igrejaId).orElseThrow(this::naoEncontrado);
            if (Boolean.TRUE.equals(cargo.getSistema()) && dto.getCodigo() != null && !dto.getCodigo().equals(cargo.getCodigo())) {
                throw new BadRequestAlertException("Não é possível alterar o código de um cargo padrão", ENTITY, "codigoinvalido");
            }
        } else {
            cargo = new IgrejaCargo();
            cargo.setIgreja(tenantService.resolverIgrejaParaCriacao());
            cargo.setSistema(false);
            cargo.setCriadoEm(Instant.now());
            String codigo = normalizarCodigo(dto.getCodigo() != null ? dto.getCodigo() : dto.getNome());
            if (cargoRepository.existsByIgrejaIdAndCodigo(igrejaId, codigo)) {
                throw new BadRequestAlertException("Já existe um cargo com este código", ENTITY, "codigoduplicado");
            }
            cargo.setCodigo(codigo);
        }

        if (dto.getNome() == null || dto.getNome().isBlank()) {
            throw new BadRequestAlertException("Nome do cargo é obrigatório", ENTITY, "nomeobrigatorio");
        }
        cargo.setNome(dto.getNome().trim());
        cargo.setDescricao(dto.getDescricao() != null ? dto.getDescricao().trim() : null);
        if (dto.getOrdem() != null) {
            cargo.setOrdem(dto.getOrdem());
        }

        cargo.getModulos().clear();
        if (dto.getModulos() != null) {
            for (ModuloPermissaoDTO mp : dto.getModulos()) {
                if (mp.getModulo() == null || mp.getNivel() == null) continue;
                if (!MODULOS.contains(mp.getModulo())) continue;
                IgrejaCargoModulo item = new IgrejaCargoModulo();
                item.setCargo(cargo);
                item.setModulo(mp.getModulo());
                item.setNivel(mp.getNivel());
                cargo.getModulos().add(item);
            }
        }

        return toDto(cargoRepository.save(cargo));
    }

    public void excluir(Long id) {
        validarGestao();
        Long igrejaId = tenantService.getIgrejaIdAtual();
        IgrejaCargo cargo = cargoRepository.findByIdAndIgrejaId(id, igrejaId).orElseThrow(this::naoEncontrado);
        if (Boolean.TRUE.equals(cargo.getSistema())) {
            throw new BadRequestAlertException("Cargos padrão do sistema não podem ser excluídos", ENTITY, "cargosistema");
        }
        if (userCargoRepository.existsByCargoId(cargo.getId())) {
            throw new BadRequestAlertException("Este cargo está atribuído a membros. Remova as atribuições antes de excluir.", ENTITY, "cargoemuso");
        }
        cargoRepository.delete(cargo);
    }

    public void atribuirCargosUsuario(Long userId, List<Long> cargoIds) {
        if (userId == null) return;
        userCargoRepository.deleteByUserId(userId);
        if (cargoIds == null || cargoIds.isEmpty()) return;

        Long igrejaId = tenantService.getIgrejaIdAtual();
        Set<Long> unicos = new HashSet<>(cargoIds);
        for (Long cargoId : unicos) {
            IgrejaCargo cargo = cargoRepository.findByIdAndIgrejaId(cargoId, igrejaId).orElseThrow(this::naoEncontrado);
            UserIgrejaCargo atribuicao = new UserIgrejaCargo();
            atribuicao.setUser(userRepository.getReferenceById(userId));
            atribuicao.setCargo(cargo);
            atribuicao.setAtribuidoEm(Instant.now());
            userCargoRepository.save(atribuicao);
        }
    }

    public Set<String> derivarAuthoritiesDosCargos(List<Long> cargoIds) {
        if (cargoIds == null || cargoIds.isEmpty()) return Set.of();
        Long igrejaId = tenantService.getIgrejaIdAtual();
        Set<String> authorities = new LinkedHashSet<>();
        for (Long cargoId : cargoIds) {
            cargoRepository
                .findByIdAndIgrejaId(cargoId, igrejaId)
                .map(IgrejaCargo::getCodigo)
                .map(this::codigoParaAuthority)
                .ifPresent(authorities::add);
        }
        return authorities;
    }

    private String codigoParaAuthority(String codigo) {
        if (codigo == null) return null;
        return switch (codigo) {
            case "ADMIN_IGREJA" -> AuthoritiesConstants.ADMIN_IGREJA;
            case "PASTOR" -> AuthoritiesConstants.PASTOR;
            case "COPASTOR" -> AuthoritiesConstants.COPASTOR;
            case "SECRETARIA" -> AuthoritiesConstants.SECRETARIA;
            case "TESOURARIA" -> AuthoritiesConstants.TESOURARIA;
            case "LIDER" -> AuthoritiesConstants.LIDER;
            case "MEMBRO" -> AuthoritiesConstants.MEMBRO;
            case "VISITANTE" -> AuthoritiesConstants.VISITANTE;
            default -> null;
        };
    }

    @Transactional(readOnly = true)
    public List<Long> obterCargoIdsUsuario(Long userId) {
        if (userId == null) return List.of();
        return userCargoRepository.findByUserId(userId).stream().map(uc -> uc.getCargo().getId()).toList();
    }

    @Transactional(readOnly = true)
    public Map<String, NivelAcessoModulo> obterPermissoesDosCargosDoUsuario(Long userId) {
        List<UserIgrejaCargo> atribuicoes = userCargoRepository.findByUserId(userId);
        if (atribuicoes.isEmpty()) {
            return Map.of();
        }
        Map<String, NivelAcessoModulo> merged = new HashMap<>();
        for (UserIgrejaCargo atribuicao : atribuicoes) {
            if (atribuicao.getCargo() == null || atribuicao.getCargo().getModulos() == null) continue;
            for (IgrejaCargoModulo mod : atribuicao.getCargo().getModulos()) {
                merged.merge(
                    mod.getModulo(),
                    mod.getNivel(),
                    (atual, novo) ->
                        atual == NivelAcessoModulo.WRITE || novo == NivelAcessoModulo.WRITE
                            ? NivelAcessoModulo.WRITE
                            : NivelAcessoModulo.READ
                );
            }
        }
        return merged;
    }

    @Transactional(readOnly = true)
    public Map<String, NivelAcessoModulo> obterPermissoesEfetivasUsuario(User user) {
        if (user == null) return Map.of();
        Map<String, NivelAcessoModulo> merged = new HashMap<>();
        if (user.getId() != null) {
            aplicarMergeMap(merged, obterPermissoesDosCargosDoUsuario(user.getId()));
        }
        aplicarMergeMap(merged, parseModulos(user.getModules()));
        Map<String, NivelAcessoModulo> fromAuthorities = permissoesLegadoPorAuthorities(user);
        if (merged.isEmpty() || temAuthorityAcessoTotal(user) || temAuthorityComDefaultsMerge(user)) {
            aplicarMergeMap(merged, fromAuthorities);
        }
        return merged;
    }

    public void sincronizarCargosDeAutoridades(User user) {
        if (user == null || user.getId() == null || user.getIgreja() == null) return;
        if (!userCargoRepository.findByUserId(user.getId()).isEmpty()) return;

        Long igrejaId = user.getIgreja().getId();
        garantirCargosPadrao(igrejaId);
        List<Long> cargoIds = new ArrayList<>();
        for (String authority : user.getAuthorities().stream().map(a -> a.getName()).toList()) {
            String codigo = authorityParaCodigo(authority);
            if (codigo == null) continue;
            cargoRepository.findByIgrejaIdAndCodigo(igrejaId, codigo).ifPresent(c -> cargoIds.add(c.getId()));
        }
        if (!cargoIds.isEmpty()) {
            atribuirCargosUsuario(user.getId(), cargoIds);
        }
    }

    @Transactional
    public void garantirCargosPadrao(Long igrejaId) {
        if (igrejaId == null) return;
        if (cargoRepository.countByIgrejaId(igrejaId) == 0) {
            Igreja igreja = igrejaRepository.findById(igrejaId).orElseThrow(this::naoEncontrado);
            List<CargoTemplate> templates = templatesPadrao();
            for (CargoTemplate template : templates) {
                IgrejaCargo cargo = new IgrejaCargo();
                cargo.setIgreja(igreja);
                cargo.setCodigo(template.codigo());
                cargo.setNome(template.nome());
                cargo.setDescricao(template.descricao());
                cargo.setSistema(true);
                cargo.setOrdem(template.ordem());
                cargo.setCriadoEm(Instant.now());
                for (ModuloPermissaoDTO mp : template.modulos()) {
                    IgrejaCargoModulo item = new IgrejaCargoModulo();
                    item.setCargo(cargo);
                    item.setModulo(mp.getModulo());
                    item.setNivel(mp.getNivel());
                    cargo.getModulos().add(item);
                }
                cargoRepository.save(cargo);
            }
        }
        repararModulosCargosSistema(igrejaId);
    }

    /** Cargos de sistema criados antes de novos módulos (ex.: departamentos, escalas) não recebiam atualização automática. */
    private void repararModulosCargosSistema(Long igrejaId) {
        Map<String, CargoTemplate> templatesByCodigo = templatesPadrao()
            .stream()
            .collect(Collectors.toMap(CargoTemplate::codigo, t -> t));
        for (IgrejaCargo cargo : cargoRepository.findByIgrejaIdOrderByOrdemAscNomeAsc(igrejaId)) {
            if (!Boolean.TRUE.equals(cargo.getSistema())) continue;
            CargoTemplate template = templatesByCodigo.get(cargo.getCodigo());
            if (template == null) continue;
            Set<String> existentes = cargo
                .getModulos()
                .stream()
                .map(IgrejaCargoModulo::getModulo)
                .collect(Collectors.toSet());
            boolean changed = false;
            for (ModuloPermissaoDTO mp : template.modulos()) {
                if (!existentes.contains(mp.getModulo())) {
                    IgrejaCargoModulo item = new IgrejaCargoModulo();
                    item.setCargo(cargo);
                    item.setModulo(mp.getModulo());
                    item.setNivel(mp.getNivel());
                    cargo.getModulos().add(item);
                    changed = true;
                }
            }
            if (changed) {
                cargoRepository.save(cargo);
            }
        }
    }

    public void enriquecerAdminUserDto(User user, AdminUserDTO dto) {
        enriquecerAdminUserDto(user, dto, false);
    }

    /** Migra cargos a partir das authorities — usar apenas em transações de escrita (ex.: login). */
    public void enriquecerAdminUserDtoComMigracao(User user, AdminUserDTO dto) {
        enriquecerAdminUserDto(user, dto, true);
    }

    private void enriquecerAdminUserDto(User user, AdminUserDTO dto, boolean migrarCargos) {
        if (user == null || dto == null || user.getId() == null) return;
        if (user.getIgreja() != null) {
            garantirCargosPadrao(user.getIgreja().getId());
            if (migrarCargos) {
                sincronizarCargosDeAutoridades(user);
            }
        }
        dto.setCargoIds(new HashSet<>(obterCargoIdsUsuario(user.getId())));
        dto.setPermissoesEfetivas(new HashSet<>(formatarPermissoesMap(obterPermissoesEfetivasUsuario(user))));
    }

    private Map<String, NivelAcessoModulo> parseModulos(String modulesCsv) {
        Map<String, NivelAcessoModulo> result = new HashMap<>();
        if (modulesCsv == null || modulesCsv.isBlank()) return result;
        for (String item : modulesCsv.split(",")) {
            String trimmed = item.trim();
            if (trimmed.isEmpty()) continue;
            int colonIdx = trimmed.indexOf(':');
            if (colonIdx >= 0) {
                String module = trimmed.substring(0, colonIdx).trim();
                String access = trimmed.substring(colonIdx + 1).trim().toUpperCase(Locale.ROOT);
                if (MODULOS.contains(module) && ("READ".equals(access) || "WRITE".equals(access))) {
                    result.put(module, NivelAcessoModulo.valueOf(access));
                }
            } else if (MODULOS.contains(trimmed)) {
                result.put(trimmed, NivelAcessoModulo.WRITE);
            }
        }
        return result;
    }

    private IgrejaCargoDTO toDto(IgrejaCargo cargo) {
        IgrejaCargoDTO dto = new IgrejaCargoDTO();
        dto.setId(cargo.getId());
        dto.setCodigo(cargo.getCodigo());
        dto.setNome(cargo.getNome());
        dto.setDescricao(cargo.getDescricao());
        dto.setSistema(cargo.getSistema());
        dto.setOrdem(cargo.getOrdem());
        dto.setModulos(
            cargo.getModulos().stream()
                .map(m -> new ModuloPermissaoDTO(m.getModulo(), m.getNivel()))
                .sorted((a, b) -> a.getModulo().compareTo(b.getModulo()))
                .toList()
        );
        return dto;
    }

    private Map<String, NivelAcessoModulo> permissoesLegadoPorAuthorities(User user) {
        Map<String, NivelAcessoModulo> result = new HashMap<>();
        Set<String> authorities = user.getAuthorities().stream().map(a -> a.getName()).collect(Collectors.toSet());

        if (authorities.stream().anyMatch(a -> Set.of(
            AuthoritiesConstants.ADMIN,
            AuthoritiesConstants.ADMIN_IGREJA,
            AuthoritiesConstants.PASTOR,
            AuthoritiesConstants.COPASTOR
        ).contains(a))) {
            for (String m : MODULOS) result.put(m, NivelAcessoModulo.WRITE);
            return result;
        }

        aplicarModulos(result, authorities.contains(AuthoritiesConstants.SECRETARIA), modulosSecretaria(), NivelAcessoModulo.WRITE);
        aplicarModulos(result, authorities.contains(AuthoritiesConstants.TESOURARIA), modulosTesouraria(), NivelAcessoModulo.WRITE);
        if (authorities.contains(AuthoritiesConstants.LIDER)) {
            aplicarLista(result, modulosLiderWrite(), NivelAcessoModulo.WRITE);
            aplicarLista(result, List.of("membros", "visitantes", "comunicados"), NivelAcessoModulo.READ);
        }
        if (authorities.contains(AuthoritiesConstants.MEMBRO)) {
            aplicarLista(result, List.of("dashboard", "biblia", "devocionais", "comunicados", "eventos", "configuracoes"), NivelAcessoModulo.READ);
            aplicarLista(result, List.of("oracao"), NivelAcessoModulo.WRITE);
        }
        if (authorities.contains(AuthoritiesConstants.VISITANTE)) {
            aplicarLista(result, List.of("biblia", "oracao", "configuracoes"), NivelAcessoModulo.READ);
        }
        return result;
    }

    private void aplicarModulos(Map<String, NivelAcessoModulo> result, boolean condicao, List<String> mods, NivelAcessoModulo nivel) {
        if (!condicao) return;
        aplicarLista(result, mods, nivel);
    }

    private void aplicarLista(Map<String, NivelAcessoModulo> result, List<String> mods, NivelAcessoModulo nivel) {
        for (String m : mods) {
            result.merge(
                m,
                nivel,
                (atual, novo) ->
                    atual == NivelAcessoModulo.WRITE || novo == NivelAcessoModulo.WRITE
                        ? NivelAcessoModulo.WRITE
                        : NivelAcessoModulo.READ
            );
        }
    }

    private void aplicarMergeMap(Map<String, NivelAcessoModulo> target, Map<String, NivelAcessoModulo> source) {
        for (Map.Entry<String, NivelAcessoModulo> entry : source.entrySet()) {
            target.merge(
                entry.getKey(),
                entry.getValue(),
                (atual, novo) ->
                    atual == NivelAcessoModulo.WRITE || novo == NivelAcessoModulo.WRITE
                        ? NivelAcessoModulo.WRITE
                        : NivelAcessoModulo.READ
            );
        }
    }

    private boolean temAuthorityAcessoTotal(User user) {
        Set<String> authorities = user.getAuthorities().stream().map(a -> a.getName()).collect(Collectors.toSet());
        return authorities
            .stream()
            .anyMatch(a ->
                Set.of(
                    AuthoritiesConstants.ADMIN,
                    AuthoritiesConstants.ADMIN_IGREJA,
                    AuthoritiesConstants.PASTOR,
                    AuthoritiesConstants.COPASTOR
                ).contains(a)
            );
    }

    private boolean temAuthorityComDefaultsMerge(User user) {
        Set<String> authorities = user.getAuthorities().stream().map(a -> a.getName()).collect(Collectors.toSet());
        return authorities
            .stream()
            .anyMatch(a ->
                Set.of(
                    AuthoritiesConstants.SECRETARIA,
                    AuthoritiesConstants.TESOURARIA,
                    AuthoritiesConstants.LIDER
                ).contains(a)
            );
    }

    private List<String> formatarPermissoesMap(Map<String, NivelAcessoModulo> map) {
        return map.entrySet().stream().map(e -> e.getKey() + ":" + e.getValue().name()).sorted().toList();
    }

    private String normalizarCodigo(String raw) {
        if (raw == null || raw.isBlank()) return "CARGO_" + System.currentTimeMillis();
        return raw
            .trim()
            .toUpperCase(Locale.ROOT)
            .replaceAll("[^A-Z0-9]+", "_")
            .replaceAll("^_|_$", "");
    }

    private String authorityParaCodigo(String authority) {
        if (authority == null) return null;
        return switch (authority) {
            case AuthoritiesConstants.ADMIN_IGREJA -> "ADMIN_IGREJA";
            case AuthoritiesConstants.PASTOR -> "PASTOR";
            case AuthoritiesConstants.COPASTOR -> "COPASTOR";
            case AuthoritiesConstants.SECRETARIA -> "SECRETARIA";
            case AuthoritiesConstants.TESOURARIA -> "TESOURARIA";
            case AuthoritiesConstants.LIDER -> "LIDER";
            case AuthoritiesConstants.MEMBRO -> "MEMBRO";
            case AuthoritiesConstants.VISITANTE -> "VISITANTE";
            default -> null;
        };
    }

    private void validarGestao() {
        User user = tenantService.getUsuarioAtual();
        boolean ok = user
            .getAuthorities()
            .stream()
            .anyMatch(a ->
                Objects.equals(a.getName(), AuthoritiesConstants.ADMIN) ||
                Objects.equals(a.getName(), AuthoritiesConstants.ADMIN_IGREJA) ||
                Objects.equals(a.getName(), AuthoritiesConstants.PASTOR) ||
                Objects.equals(a.getName(), AuthoritiesConstants.COPASTOR)
            );
        if (!ok && !tenantService.isSuperAdmin()) {
            throw new BadRequestAlertException("Acesso restrito à administração da igreja", ENTITY, "acessonegado");
        }
    }

    private List<String> modulosSecretaria() {
        return List.of(
            "dashboard", "biblia", "devocionais", "louvores", "membros", "visitantes", "comunicados",
            "oracao", "departamentos", "escalas", "cultos", "eventos", "aprovar-pre-cadastros", "configuracoes"
        );
    }

    private List<String> modulosTesouraria() {
        return List.of("dashboard", "biblia", "devocionais", "comunicados", "financeiro", "oracao", "configuracoes");
    }

    private List<String> modulosLiderWrite() {
        return List.of(
            "dashboard", "biblia", "devocionais", "louvores", "oracao", "departamentos", "escalas", "cultos", "eventos", "configuracoes", "comunicados"
        );
    }

    private List<CargoTemplate> templatesPadrao() {
        List<CargoTemplate> list = new ArrayList<>();
        list.add(new CargoTemplate("ADMIN_IGREJA", "Administrador da Igreja", "Acesso total à gestão da igreja", 0, writeAll()));
        list.add(new CargoTemplate("PASTOR", "Pastor", "Liderança pastoral com acesso completo", 1, writeAll()));
        list.add(new CargoTemplate("COPASTOR", "Co-pastor", "Liderança com acesso completo", 2, writeAll()));
        list.add(new CargoTemplate("SECRETARIA", "Secretaria", "Gestão administrativa e secretaria", 3, writeList(modulosSecretaria())));
        list.add(new CargoTemplate("TESOURARIA", "Tesouraria", "Gestão financeira", 4, writeList(modulosTesouraria())));
        list.add(
            new CargoTemplate(
                "LIDER",
                "Líder de ministério",
                "Coordenação de departamentos e escalas",
                5,
                merge(
                    writeList(modulosLiderWrite()),
                    readList(List.of("membros", "visitantes"))
                )
            )
        );
        list.add(
            new CargoTemplate(
                "MEMBRO",
                "Membro",
                "Acesso padrão de membros da igreja",
                6,
                merge(
                    readList(List.of("dashboard", "biblia", "devocionais", "comunicados", "eventos", "cultos", "configuracoes")),
                    writeList(List.of("oracao"))
                )
            )
        );
        list.add(
            new CargoTemplate(
                "VISITANTE",
                "Visitante",
                "Acesso limitado para visitantes",
                7,
                readList(List.of("biblia", "oracao", "configuracoes"))
            )
        );
        return list;
    }

    private List<ModuloPermissaoDTO> writeAll() {
        return MODULOS.stream().map(m -> new ModuloPermissaoDTO(m, NivelAcessoModulo.WRITE)).toList();
    }

    private List<ModuloPermissaoDTO> writeList(List<String> mods) {
        return mods.stream().map(m -> new ModuloPermissaoDTO(m, NivelAcessoModulo.WRITE)).toList();
    }

    private List<ModuloPermissaoDTO> readList(List<String> mods) {
        return mods.stream().map(m -> new ModuloPermissaoDTO(m, NivelAcessoModulo.READ)).toList();
    }

    private List<ModuloPermissaoDTO> merge(List<ModuloPermissaoDTO>... groups) {
        Map<String, NivelAcessoModulo> map = new HashMap<>();
        for (List<ModuloPermissaoDTO> group : groups) {
            for (ModuloPermissaoDTO mp : group) {
                map.merge(
                    mp.getModulo(),
                    mp.getNivel(),
                    (a, b) -> a == NivelAcessoModulo.WRITE || b == NivelAcessoModulo.WRITE ? NivelAcessoModulo.WRITE : NivelAcessoModulo.READ
                );
            }
        }
        return map.entrySet().stream().map(e -> new ModuloPermissaoDTO(e.getKey(), e.getValue())).toList();
    }

    private BadRequestAlertException naoEncontrado() {
        return new BadRequestAlertException("Cargo não encontrado", ENTITY, "naoencontrado");
    }

    private record CargoTemplate(String codigo, String nome, String descricao, int ordem, List<ModuloPermissaoDTO> modulos) {}
}
