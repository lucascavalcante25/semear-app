package br.com.semear.repository;

import br.com.semear.domain.ComunicadoBanner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComunicadoBannerRepository extends JpaRepository<ComunicadoBanner, Long> {}
