package br.com.semear.repository;

import br.com.semear.domain.UserIgrejaCargo;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserIgrejaCargoRepository extends JpaRepository<UserIgrejaCargo, Long> {
    @EntityGraph(attributePaths = { "cargo", "cargo.modulos" })
    List<UserIgrejaCargo> findByUserId(Long userId);

    @EntityGraph(attributePaths = { "cargo", "cargo.modulos", "user" })
    @Query("SELECT uic FROM UserIgrejaCargo uic WHERE uic.user.id IN :userIds")
    List<UserIgrejaCargo> findByUserIdIn(@Param("userIds") Collection<Long> userIds);

    @Modifying
    @Query("DELETE FROM UserIgrejaCargo uic WHERE uic.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

    boolean existsByCargoId(Long cargoId);
}
