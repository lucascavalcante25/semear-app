package br.com.semear.service;

import br.com.semear.config.Constants;
import br.com.semear.domain.Authority;
import br.com.semear.domain.User;
import br.com.semear.repository.AuthorityRepository;
import br.com.semear.repository.UserRepository;
import br.com.semear.security.AuthoritiesConstants;
import br.com.semear.security.SecurityUtils;
import br.com.semear.service.dto.AdminUserDTO;
import br.com.semear.service.dto.DependenteCreateDTO;
import br.com.semear.web.rest.errors.EmailAlreadyUsedException;
import br.com.semear.service.dto.UserDTO;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.CacheManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import tech.jhipster.security.RandomUtil;

/**
 * Service class for managing users.
 */
@Service
@Transactional
public class UserService {

    private static final Logger LOG = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuthorityRepository authorityRepository;

    private final CacheManager cacheManager;

    @Value("${semear.upload-dir:${user.home}/semear-app/uploads}")
    private String uploadDir;

    private static final String[] ALLOWED_AVATAR_TYPES = {
        "image/jpeg", "image/png", "image/gif", "image/webp"
    };

    public UserService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        AuthorityRepository authorityRepository,
        CacheManager cacheManager
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authorityRepository = authorityRepository;
        this.cacheManager = cacheManager;
    }

    public Optional<User> activateRegistration(String key) {
        LOG.debug("Activating user for activation key {}", key);
        return userRepository
            .findOneByActivationKey(key)
            .map(user -> {
                // activate given user for the registration key.
                user.setActivated(true);
                user.setActivationKey(null);
                this.clearUserCaches(user);
                LOG.debug("Activated user: {}", user);
                return user;
            });
    }

    public Optional<User> completePasswordReset(String newPassword, String key) {
        LOG.debug("Reset user password for reset key {}", key);
        return userRepository
            .findOneByResetKey(key)
            .filter(user -> user.getResetDate().isAfter(Instant.now().minus(1, ChronoUnit.DAYS)))
            .map(user -> {
                user.setPassword(passwordEncoder.encode(newPassword));
                user.setResetKey(null);
                user.setResetDate(null);
                this.clearUserCaches(user);
                return user;
            });
    }

    public Optional<User> requestPasswordReset(String mail) {
        return userRepository
            .findOneByEmailIgnoreCase(mail)
            .filter(User::isActivated)
            .map(user -> {
                user.setResetKey(RandomUtil.generateResetKey());
                user.setResetDate(Instant.now());
                this.clearUserCaches(user);
                return user;
            });
    }

    public User registerUser(AdminUserDTO userDTO, String password) {
        userRepository
            .findOneByLogin(userDTO.getLogin().toLowerCase())
            .ifPresent(existingUser -> {
                boolean removed = removeNonActivatedUser(existingUser);
                if (!removed) {
                    throw new UsernameAlreadyUsedException();
                }
            });
        userRepository
            .findOneByEmailIgnoreCase(userDTO.getEmail())
            .ifPresent(existingUser -> {
                boolean removed = removeNonActivatedUser(existingUser);
                if (!removed) {
                    throw new EmailAlreadyUsedException();
                }
            });
        User newUser = new User();
        String encryptedPassword = passwordEncoder.encode(password);
        newUser.setLogin(userDTO.getLogin().toLowerCase());
        // new user gets initially a generated password
        newUser.setPassword(encryptedPassword);
        newUser.setFirstName(userDTO.getFirstName());
        newUser.setLastName(userDTO.getLastName());
        if (userDTO.getEmail() != null) {
            newUser.setEmail(userDTO.getEmail().toLowerCase());
        }
        newUser.setImageUrl(userDTO.getImageUrl());
        newUser.setLangKey(userDTO.getLangKey());
        // new user is not active
        newUser.setActivated(false);
        // new user gets registration key
        newUser.setActivationKey(RandomUtil.generateActivationKey());
        Set<Authority> authorities = new HashSet<>();
        authorityRepository.findById(AuthoritiesConstants.USER).ifPresent(authorities::add);
        newUser.setAuthorities(authorities);
        userRepository.save(newUser);
        this.clearUserCaches(newUser);
        LOG.debug("Created Information for User: {}", newUser);
        return newUser;
    }

    private boolean removeNonActivatedUser(User existingUser) {
        if (existingUser.isActivated()) {
            return false;
        }
        userRepository.delete(existingUser);
        userRepository.flush();
        this.clearUserCaches(existingUser);
        return true;
    }

    public User createUser(AdminUserDTO userDTO) {
        User user = new User();
        user.setLogin(userDTO.getLogin().toLowerCase());
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        if (userDTO.getEmail() != null) {
            user.setEmail(userDTO.getEmail().toLowerCase());
        }
        user.setImageUrl(userDTO.getImageUrl());
        if (userDTO.getLangKey() == null) {
            user.setLangKey(Constants.DEFAULT_LANGUAGE); // default language
        } else {
            user.setLangKey(userDTO.getLangKey());
        }
        String encryptedPassword = passwordEncoder.encode(RandomUtil.generatePassword());
        user.setPassword(encryptedPassword);
        user.setResetKey(RandomUtil.generateResetKey());
        user.setResetDate(Instant.now());
        user.setActivated(true);
        if (userDTO.getModules() != null && !userDTO.getModules().isEmpty()) {
            user.setModules(String.join(",", userDTO.getModules()));
        }
        if (userDTO.getAuthorities() != null && !userDTO.getAuthorities().isEmpty()) {
            Set<Authority> authorities = userDTO
                .getAuthorities()
                .stream()
                .map(authorityRepository::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toSet());
            user.setAuthorities(authorities);
        } else {
            authorityRepository.findById(AuthoritiesConstants.USER).ifPresent(a -> user.setAuthorities(Set.of(a)));
        }
        userRepository.save(user);
        this.clearUserCaches(user);
        LOG.debug("Created Information for User: {}", user);
        return user;
    }

    /**
     * Cria dependente (criança/jovem sem login).
     * Dependentes não podem fazer login e não aparecem como opção de login.
     */
    public User createDependente(DependenteCreateDTO dto) {
        String nome = dto.getNome() != null ? dto.getNome().trim() : "";
        if (nome.isBlank()) {
            throw new IllegalArgumentException("Nome é obrigatório");
        }
        if (dto.getBirthDate() == null) {
            throw new IllegalArgumentException("Data de nascimento é obrigatória");
        }

        String login;
        int tentativas = 0;
        do {
            login = "dep-" + UUID.randomUUID().toString().substring(0, 8).toLowerCase();
            if (userRepository.findOneByLogin(login).isEmpty()) {
                break;
            }
            tentativas++;
            if (tentativas > 10) {
                throw new RuntimeException("Não foi possível gerar login único para dependente");
            }
        } while (true);

        String[] partes = nome.split("\\s+", 2);
        String firstName = partes[0];
        String lastName = partes.length > 1 ? partes[1] : "";

        User user = new User();
        user.setLogin(login);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setBirthDate(dto.getBirthDate());
        user.setPassword(passwordEncoder.encode(RandomUtil.generatePassword()));
        user.setActivated(false);
        user.setDependente(true);
        user.setLangKey(Constants.DEFAULT_LANGUAGE);

        if (dto.getPaiId() != null) {
            User pai = userRepository.findById(dto.getPaiId())
                .orElseThrow(() -> new IllegalArgumentException("Pai não encontrado"));
            if (pai.isDependente()) {
                throw new IllegalArgumentException("O pai selecionado não pode ser dependente");
            }
            user.setPai(pai);
        }
        if (dto.getMaeId() != null) {
            User mae = userRepository.findById(dto.getMaeId())
                .orElseThrow(() -> new IllegalArgumentException("Mãe não encontrada"));
            if (mae.isDependente()) {
                throw new IllegalArgumentException("A mãe selecionada não pode ser dependente");
            }
            user.setMae(mae);
        }

        userRepository.save(user);
        this.clearUserCaches(user);
        LOG.debug("Created dependente: {}", user.getLogin());
        return user;
    }

    /**
     * Cria usuário a partir de pré-cadastro aprovado, usando a senha informada no cadastro.
     */
    public User createUserFromPreCadastro(AdminUserDTO userDTO, String plainPassword) {
        if (userRepository.findOneByLogin(userDTO.getLogin().toLowerCase()).isPresent()) {
            throw new UsernameAlreadyUsedException();
        }
        if (userRepository.findOneByEmailIgnoreCase(userDTO.getEmail()).isPresent()) {
            throw new EmailAlreadyUsedException();
        }
        User user = new User();
        user.setLogin(userDTO.getLogin().toLowerCase());
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setEmail(userDTO.getEmail().toLowerCase());
        user.setPassword(passwordEncoder.encode(plainPassword));
        user.setLangKey(Constants.DEFAULT_LANGUAGE);
        user.setActivated(true);
        user.setPhone(userDTO.getPhone());
        user.setPhoneSecondary(userDTO.getPhoneSecondary());
        user.setPhoneEmergency(userDTO.getPhoneEmergency());
        user.setNomeContatoEmergencia(userDTO.getNomeContatoEmergencia());
        user.setLogradouro(userDTO.getLogradouro());
        user.setNumero(userDTO.getNumero());
        user.setComplemento(userDTO.getComplemento());
        user.setBairro(userDTO.getBairro());
        user.setCidade(userDTO.getCidade());
        user.setEstado(userDTO.getEstado());
        user.setCep(userDTO.getCep());
        if (userDTO.getModules() != null && !userDTO.getModules().isEmpty()) {
            user.setModules(String.join(",", userDTO.getModules()));
        }
        if (userDTO.getAuthorities() != null && !userDTO.getAuthorities().isEmpty()) {
            Set<Authority> authorities = userDTO
                .getAuthorities()
                .stream()
                .map(authorityRepository::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toSet());
            user.setAuthorities(authorities);
        } else {
            authorityRepository.findById(AuthoritiesConstants.USER).ifPresent(a -> user.setAuthorities(Set.of(a)));
        }
        userRepository.save(user);
        this.clearUserCaches(user);
        LOG.debug("Created User from PreCadastro: {}", user.getLogin());
        return user;
    }

    /**
     * Update all information for a specific user, and return the modified user.
     *
     * @param userDTO user to update.
     * @return updated user.
     */
    public Optional<AdminUserDTO> updateUser(AdminUserDTO userDTO) {
        return Optional.of(userRepository.findById(userDTO.getId()))
            .filter(Optional::isPresent)
            .map(Optional::get)
            .map(user -> {
                this.clearUserCaches(user);
                user.setLogin(userDTO.getLogin().toLowerCase());
                user.setFirstName(userDTO.getFirstName());
                user.setLastName(userDTO.getLastName());
                if (userDTO.getEmail() != null) {
                    user.setEmail(userDTO.getEmail().toLowerCase());
                }
                user.setImageUrl(userDTO.getImageUrl());
                user.setActivated(userDTO.isActivated());
                user.setLangKey(userDTO.getLangKey());
                if (userDTO.getModules() != null) {
                    user.setModules(userDTO.getModules().isEmpty() ? null : String.join(",", userDTO.getModules()));
                }
                Set<Authority> managedAuthorities = user.getAuthorities();
                managedAuthorities.clear();
                if (userDTO.getAuthorities() != null && !userDTO.getAuthorities().isEmpty()) {
                    userDTO
                        .getAuthorities()
                        .stream()
                        .map(authorityRepository::findById)
                        .filter(Optional::isPresent)
                        .map(Optional::get)
                        .forEach(managedAuthorities::add);
                }
                userRepository.save(user);
                this.clearUserCaches(user);
                LOG.debug("Changed Information for User: {}", user);
                return user;
            })
            .map(AdminUserDTO::new);
    }

    public void deleteUser(String login) {
        userRepository
            .findOneByLogin(login)
            .ifPresent(user -> {
                userRepository.delete(user);
                this.clearUserCaches(user);
                LOG.debug("Deleted User: {}", user);
            });
    }

    /**
     * Update basic information (first name, last name, email, language) for the current user.
     *
     * @param firstName first name of user.
     * @param lastName  last name of user.
     * @param email     email id of user.
     * @param langKey   language key.
     * @param imageUrl  image URL of user.
     */
    public void updateUser(
        String firstName,
        String lastName,
        String email,
        String langKey,
        String imageUrl,
        String phone,
        String phoneSecondary,
        String phoneEmergency,
        String nomeContatoEmergencia,
        String logradouro,
        String numero,
        String complemento,
        String bairro,
        String cidade,
        String estado,
        String cep
    ) {
        SecurityUtils.getCurrentUserLogin()
            .flatMap(userRepository::findOneByLogin)
            .ifPresent(user -> {
                user.setFirstName(firstName);
                user.setLastName(lastName);
                if (email != null) {
                    user.setEmail(email.toLowerCase());
                }
                user.setLangKey(langKey);
                user.setImageUrl(imageUrl);
                user.setPhone(phone);
                user.setPhoneSecondary(phoneSecondary);
                user.setPhoneEmergency(phoneEmergency);
                user.setNomeContatoEmergencia(nomeContatoEmergencia);
                user.setLogradouro(logradouro);
                user.setNumero(numero);
                user.setComplemento(complemento);
                user.setBairro(bairro);
                user.setCidade(cidade);
                user.setEstado(estado);
                user.setCep(cep);
                userRepository.save(user);
                this.clearUserCaches(user);
                LOG.debug("Changed Information for User: {}", user);
            });
    }

    public Optional<AdminUserDTO> updateAvatar(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return Optional.empty();
        }
        String contentType = file.getContentType();
        if (contentType == null || !isAllowedAvatarType(contentType)) {
            throw new IllegalArgumentException("Tipo de arquivo não permitido. Use JPEG, PNG, GIF ou WebP.");
        }
        return SecurityUtils.getCurrentUserLogin()
            .flatMap(userRepository::findOneByLogin)
            .map(user -> {
                try {
                    String oldImageUrl = user.getImageUrl();
                    byte[] bytes = file.getBytes();
                    user.setImageData(bytes);
                    user.setImageContentType(contentType);
                    user.setImageUrl("db"); // Marca que avatar está no banco
                    // Remove arquivo antigo do disco se existir (migração de avatares antigos)
                    if (oldImageUrl != null && !oldImageUrl.isBlank() && !"db".equals(oldImageUrl)) {
                        try {
                            Path oldPath = Paths.get(uploadDir, oldImageUrl).toAbsolutePath().normalize();
                            if (Files.exists(oldPath)) {
                                Files.delete(oldPath);
                            }
                        } catch (IOException ignored) {
                            // Ignora se não conseguir remover arquivo antigo
                        }
                    }
                    userRepository.save(user);
                    this.clearUserCaches(user);
                    LOG.debug("User avatar updated (stored in DB): {}", user.getLogin());
                    return new AdminUserDTO(user);
                } catch (IOException e) {
                    LOG.error("Erro ao salvar avatar", e);
                    throw new RuntimeException("Erro ao salvar avatar: " + e.getMessage());
                }
            });
    }

    public Optional<AdminUserDTO> removeAvatar() {
        return SecurityUtils.getCurrentUserLogin()
            .flatMap(userRepository::findOneByLogin)
            .map(user -> {
                try {
                    String oldImageUrl = user.getImageUrl();
                    user.setImageData(null);
                    user.setImageContentType(null);
                    user.setImageUrl(null);
                    if (oldImageUrl != null && !oldImageUrl.isBlank() && !"db".equals(oldImageUrl)) {
                        Path oldPath = Paths.get(uploadDir, oldImageUrl).toAbsolutePath().normalize();
                        if (Files.exists(oldPath)) {
                            Files.delete(oldPath);
                        }
                    }
                    userRepository.save(user);
                    this.clearUserCaches(user);
                    LOG.debug("User avatar removed: {}", user.getLogin());
                    return new AdminUserDTO(user);
                } catch (IOException e) {
                    LOG.error("Erro ao remover avatar", e);
                    throw new RuntimeException("Erro ao remover avatar: " + e.getMessage());
                }
            });
    }

    public Optional<byte[]> getAvatarBytes() {
        return SecurityUtils.getCurrentUserLogin()
            .flatMap(userRepository::findOneByLogin)
            .flatMap(this::readAvatarBytes);
    }

    public Optional<AvatarResult> getAvatarForCurrentUser() {
        return SecurityUtils.getCurrentUserLogin()
            .flatMap(userRepository::findOneByLogin)
            .flatMap(this::readAvatar);
    }

    public Optional<byte[]> getAvatarBytesByUserId(Long userId) {
        return userRepository.findById(userId)
            .flatMap(this::readAvatarBytes);
    }

    public record AvatarResult(byte[] bytes, String contentType) {}

    public Optional<AvatarResult> getAvatarByUserId(Long userId) {
        return userRepository.findById(userId)
            .flatMap(this::readAvatar);
    }

    private Optional<byte[]> readAvatarBytes(User user) {
        return readAvatar(user).map(AvatarResult::bytes);
    }

    private Optional<AvatarResult> readAvatar(User user) {
        if (user.getImageData() != null && user.getImageData().length > 0) {
            String contentType = user.getImageContentType();
            if (contentType == null || contentType.isBlank()) {
                contentType = "image/jpeg";
            }
            return Optional.of(new AvatarResult(user.getImageData(), contentType));
        }
        if (user.getImageUrl() != null && !user.getImageUrl().isBlank() && !"db".equals(user.getImageUrl())) {
            try {
                Path targetPath = Paths.get(uploadDir, user.getImageUrl()).toAbsolutePath().normalize();
                if (Files.exists(targetPath)) {
                    byte[] bytes = Files.readAllBytes(targetPath);
                    return Optional.of(new AvatarResult(bytes, "image/jpeg"));
                }
            } catch (IOException e) {
                LOG.error("Erro ao ler avatar do disco", e);
            }
        }
        return Optional.empty();
    }

    private static boolean isAllowedAvatarType(String contentType) {
        for (String allowed : ALLOWED_AVATAR_TYPES) {
            if (contentType.startsWith(allowed) || contentType.equals(allowed)) {
                return true;
            }
        }
        return false;
    }

    private static String getImageExtension(String contentType) {
        if (contentType == null) return ".jpg";
        if (contentType.contains("png")) return ".png";
        if (contentType.contains("gif")) return ".gif";
        if (contentType.contains("webp")) return ".webp";
        return ".jpg";
    }

    @Transactional
    public void changePassword(String currentClearTextPassword, String newPassword) {
        SecurityUtils.getCurrentUserLogin()
            .flatMap(userRepository::findOneByLogin)
            .ifPresent(user -> {
                String currentEncryptedPassword = user.getPassword();
                if (!passwordEncoder.matches(currentClearTextPassword, currentEncryptedPassword)) {
                    throw new InvalidPasswordException();
                }
                String encryptedPassword = passwordEncoder.encode(newPassword);
                user.setPassword(encryptedPassword);
                this.clearUserCaches(user);
                LOG.debug("Changed password for User: {}", user);
            });
    }

    @Transactional(readOnly = true)
    public Page<AdminUserDTO> getAllManagedUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(AdminUserDTO::new);
    }

    @Transactional(readOnly = true)
    public Page<UserDTO> getAllPublicUsers(Pageable pageable) {
        return userRepository.findAllByIdNotNullAndActivatedIsTrue(pageable).map(UserDTO::new);
    }

    @Transactional(readOnly = true)
    public Optional<User> getUserWithAuthoritiesByLogin(String login) {
        return userRepository.findOneWithAuthoritiesByLogin(login);
    }

    @Transactional(readOnly = true)
    public Optional<User> getUserWithAuthorities() {
        return SecurityUtils.getCurrentUserLogin().flatMap(userRepository::findOneWithAuthoritiesByLogin);
    }

    /**
     * Not activated users should be automatically deleted after 3 days.
     * <p>
     * This is scheduled to get fired every day, at 01:00 (am).
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void removeNotActivatedUsers() {
        userRepository
            .findAllByActivatedIsFalseAndActivationKeyIsNotNullAndCreatedDateBefore(Instant.now().minus(3, ChronoUnit.DAYS))
            .forEach(user -> {
                LOG.debug("Deleting not activated user {}", user.getLogin());
                userRepository.delete(user);
                this.clearUserCaches(user);
            });
    }

    /**
     * Gets a list of all the authorities.
     * @return a list of all the authorities.
     */
    @Transactional(readOnly = true)
    public List<String> getAuthorities() {
        return authorityRepository.findAll().stream().map(Authority::getName).toList();
    }

    private void clearUserCaches(User user) {
        Objects.requireNonNull(cacheManager.getCache(UserRepository.USERS_BY_LOGIN_CACHE)).evictIfPresent(user.getLogin());
        if (user.getEmail() != null) {
            Objects.requireNonNull(cacheManager.getCache(UserRepository.USERS_BY_EMAIL_CACHE)).evictIfPresent(user.getEmail());
        }
    }

}
