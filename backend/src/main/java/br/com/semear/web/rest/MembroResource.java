package br.com.semear.web.rest;

import br.com.semear.config.Constants;
import br.com.semear.domain.User;
import br.com.semear.repository.UserRepository;
import br.com.semear.service.UserService;
import br.com.semear.service.dto.AdminUserDTO;
import br.com.semear.service.dto.DependenteCreateDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Objects;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/membros")
public class MembroResource {

    private static final List<String> ALLOWED_ORDERED_PROPERTIES = Collections.unmodifiableList(
        Arrays.asList(
            "id", "login", "firstName", "lastName", "email", "activated", "langKey",
            "createdBy", "createdDate", "lastModifiedBy", "lastModifiedDate"
        )
    );

    private static final Logger LOG = LoggerFactory.getLogger(MembroResource.class);

    private static final String AUTORIZACAO_GESTAO_MEMBROS =
        "hasAnyAuthority('ROLE_SUPER_ADMIN','ROLE_ADMIN','ROLE_ADMIN_IGREJA','ROLE_PASTOR','ROLE_COPASTOR','ROLE_SECRETARIA','ROLE_LIDER')";

    private final UserRepository userRepository;
    private final UserService userService;

    public MembroResource(UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    private static boolean onlyContainsAllowedProperties(Pageable pageable) {
        return pageable.getSort().stream()
            .map(Sort.Order::getProperty)
            .allMatch(ALLOWED_ORDERED_PROPERTIES::contains);
    }

    /**
     * {@code GET  /membros} : Lista todos os membros (usuários e dependentes).
     * Acessível por ADMIN, PASTOR, COPASTOR, SECRETARIA e LIDER.
     */
    @GetMapping("")
    @PreAuthorize(AUTORIZACAO_GESTAO_MEMBROS)
    public ResponseEntity<List<AdminUserDTO>> listarMembros(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to list members");
        if (!onlyContainsAllowedProperties(pageable)) {
            return ResponseEntity.badRequest().build();
        }
        Page<AdminUserDTO> page = userService.getAllManagedUsers(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    public record AniversarianteVM(Long id, String name, LocalDate birthDate, String imageUrl) {}

    @GetMapping("/aniversariantes")
    public List<AniversarianteVM> listarAniversariantes(@RequestParam(name = "days", required = false, defaultValue = "7") int days) {
        int janela = Math.max(1, Math.min(days, 60));
        LOG.debug("REST request to get upcoming birthdays (days={})", janela);

        LocalDate hoje = LocalDate.now();
        LocalDate limite = hoje.plusDays(janela);

        return userRepository.findAllComBirthDateParaAniversariantes().stream()
            .map(u -> new Object[] { u, proximoAniversario(hoje, u.getBirthDate()) })
            .filter(arr -> arr[1] != null)
            .filter(arr -> {
                LocalDate prox = (LocalDate) arr[1];
                return (!prox.isBefore(hoje)) && (!prox.isAfter(limite));
            })
            .sorted(Comparator.comparing(arr -> (LocalDate) arr[1]))
            .limit(20)
            .map(arr -> {
                User u = (User) arr[0];
                LocalDate prox = (LocalDate) arr[1];
                String name = montarNome(u);
                String avatarUrl = temAvatar(u) ? "/api/avatars/" + u.getId() : null;
                return new AniversarianteVM(u.getId(), name, prox, avatarUrl);
            })
            .collect(Collectors.toList());
    }

    /**
     * {@code GET /membros/aniversariantes/calendario} : todos os aniversariantes do ano, ordenados por mês/dia.
     */
    @GetMapping("/aniversariantes/calendario")
    public List<AniversarianteVM> listarCalendarioAniversariantes() {
        LOG.debug("REST request to get birthday calendar");

        return userRepository.findAllComBirthDateParaAniversariantes().stream()
            .sorted(
                Comparator.comparing((User u) -> u.getBirthDate().getMonthValue())
                    .thenComparing(u -> u.getBirthDate().getDayOfMonth())
                    .thenComparing(MembroResource::montarNome, String.CASE_INSENSITIVE_ORDER)
            )
            .map(u -> {
                String name = montarNome(u);
                String avatarUrl = temAvatar(u) ? "/api/avatars/" + u.getId() : null;
                return new AniversarianteVM(u.getId(), name, u.getBirthDate(), avatarUrl);
            })
            .collect(Collectors.toList());
    }

    private static boolean temAvatar(User u) {
        return (u.getImageData() != null && u.getImageData().length > 0)
            || (u.getImageUrl() != null && !u.getImageUrl().isBlank());
    }

    private static String montarNome(User u) {
        String first = u.getFirstName();
        String last = u.getLastName();
        String full = (Objects.toString(first, "") + " " + Objects.toString(last, "")).trim();
        return full.isBlank() ? u.getLogin() : full;
    }

    private static LocalDate proximoAniversario(LocalDate hoje, LocalDate birthDate) {
        if (birthDate == null) return null;
        LocalDate thisYear = LocalDate.of(hoje.getYear(), birthDate.getMonth(), birthDate.getDayOfMonth());
        if (!thisYear.isBefore(hoje)) return thisYear;
        return thisYear.plusYears(1);
    }

    /**
     * {@code GET /membros/:login} : obtém um membro da igreja atual.
     */
    @GetMapping("/{login}")
    @PreAuthorize(AUTORIZACAO_GESTAO_MEMBROS)
    public ResponseEntity<AdminUserDTO> obterMembro(
        @PathVariable("login") @Pattern(regexp = Constants.LOGIN_REGEX) String login
    ) {
        LOG.debug("REST request to get member : {}", login);
        return ResponseUtil.wrapOrNotFound(userService.getManagedUser(login));
    }

    /**
     * {@code PUT /membros} : atualiza um membro da igreja atual.
     */
    @PutMapping("")
    @PreAuthorize(AUTORIZACAO_GESTAO_MEMBROS)
    public ResponseEntity<AdminUserDTO> atualizarMembro(@Valid @RequestBody AdminUserDTO userDTO) {
        LOG.debug("REST request to update member : {}", userDTO);
        return ResponseUtil.wrapOrNotFound(userService.updateManagedUser(userDTO));
    }

    /**
     * {@code DELETE /membros/:login} : remove um membro da igreja atual.
     */
    @DeleteMapping("/{login}")
    @PreAuthorize(AUTORIZACAO_GESTAO_MEMBROS)
    public ResponseEntity<Void> excluirMembro(@PathVariable("login") @Pattern(regexp = Constants.LOGIN_REGEX) String login) {
        LOG.debug("REST request to delete member : {}", login);
        userService.deleteManagedUser(login);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/dependentes")
    @PreAuthorize(AUTORIZACAO_GESTAO_MEMBROS)
    public ResponseEntity<AdminUserDTO> criarDependente(@Valid @RequestBody DependenteCreateDTO dto) throws URISyntaxException {
        LOG.debug("REST request to create dependente: {}", dto.getNome());
        User created = userService.createDependente(dto);
        AdminUserDTO result = new AdminUserDTO(created);
        return ResponseEntity.created(new URI("/api/admin/users/" + created.getLogin()))
            .body(result);
    }

}

