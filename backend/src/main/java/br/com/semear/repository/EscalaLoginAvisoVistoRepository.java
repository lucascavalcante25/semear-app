package br.com.semear.repository;

import br.com.semear.domain.EscalaLoginAvisoVisto;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EscalaLoginAvisoVistoRepository extends JpaRepository<EscalaLoginAvisoVisto, Long> {
    boolean existsByUserIdAndEscalaItemId(Long userId, Long escalaItemId);
    Optional<EscalaLoginAvisoVisto> findByUserIdAndEscalaItemId(Long userId, Long escalaItemId);
}
