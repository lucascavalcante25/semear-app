package br.com.semear.repository;

import br.com.semear.domain.EventoBanner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventoBannerRepository extends JpaRepository<EventoBanner, Long> {}
