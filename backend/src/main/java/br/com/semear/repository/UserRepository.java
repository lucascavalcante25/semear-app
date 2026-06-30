package br.com.semear.repository;

import br.com.semear.domain.User;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the {@link User} entity.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    String USERS_BY_LOGIN_CACHE = "usersByLogin";

    String USERS_BY_EMAIL_CACHE = "usersByEmail";
    Optional<User> findOneByActivationKey(String activationKey);
    List<User> findAllByActivatedIsFalseAndActivationKeyIsNotNullAndCreatedDateBefore(Instant dateTime);
    Optional<User> findOneByResetKey(String resetKey);
    Optional<User> findOneByEmailIgnoreCase(String email);
    Optional<User> findOneByLogin(String login);
    List<User> findAllByBirthDateIsNotNullAndActivatedIsTrue();

    List<User> findAllByIgrejaIdAndBirthDateIsNotNullAndActivatedIsTrue(Long igrejaId);

    List<User> findAllByIgrejaIdAndActivatedIsTrue(Long igrejaId);

    @Query("SELECT u FROM User u WHERE u.birthDate IS NOT NULL AND (u.activated = true OR u.isDependente = true)")
    List<User> findAllComBirthDateParaAniversariantes();

    @EntityGraph(attributePaths = { "authorities", "igreja" })
    @Cacheable(cacheNames = USERS_BY_LOGIN_CACHE, unless = "#result == null")
    Optional<User> findOneWithAuthoritiesByLogin(String login);

    @EntityGraph(attributePaths = { "authorities", "igreja" })
    @Cacheable(cacheNames = USERS_BY_EMAIL_CACHE, unless = "#result == null")
    Optional<User> findOneWithAuthoritiesByEmailIgnoreCase(String email);

    Page<User> findAllByIdNotNullAndActivatedIsTrue(Pageable pageable);

    Page<User> findAllByIgrejaIdAndActivatedIsTrue(Long igrejaId, Pageable pageable);

    Page<User> findAllByIgrejaId(Long igrejaId, Pageable pageable);

    long countByIgrejaId(Long igrejaId);

    long countByIgrejaIdAndActivatedIsTrue(Long igrejaId);

    @Query(
        """
        SELECT u.igreja.id, u.igreja.nome, COUNT(u)
        FROM User u
        WHERE u.igreja IS NOT NULL AND u.activated = true
        GROUP BY u.igreja.id, u.igreja.nome
        ORDER BY COUNT(u) DESC
        """
    )
    List<Object[]> findTopIgrejasPorUsuariosAtivos(Pageable pageable);

    @Query(
        """
        SELECT DISTINCT u FROM User u JOIN u.authorities a
        WHERE a.name = :authority AND u.activated = true AND u.email IS NOT NULL
        """
    )
    List<User> findAllAtivosComAutoridade(@Param("authority") String authority);
}
