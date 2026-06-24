package br.com.semear.repository;

import br.com.semear.domain.DocumentoIgreja;
import br.com.semear.domain.enumeration.CategoriaDocumentoIgreja;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentoIgrejaRepository extends JpaRepository<DocumentoIgreja, Long> {
    List<DocumentoIgreja> findByIgrejaIdAndAtivoTrueOrderByDataUploadDesc(Long igrejaId);

    List<DocumentoIgreja> findByIgrejaIdAndCategoriaAndAtivoTrueOrderByDataUploadDesc(
        Long igrejaId,
        CategoriaDocumentoIgreja categoria
    );

    List<DocumentoIgreja> findByIgrejaIdAndNomeContainingIgnoreCaseAndAtivoTrueOrderByDataUploadDesc(Long igrejaId, String nome);

    Optional<DocumentoIgreja> findByIdAndIgrejaId(Long id, Long igrejaId);

    List<DocumentoIgreja> findByIgrejaIdAndAtivoTrueAndDataValidadeBetweenOrderByDataValidadeAsc(
        Long igrejaId,
        java.time.LocalDate inicio,
        java.time.LocalDate fim
    );

    List<DocumentoIgreja> findByIgrejaIdAndAtivoTrueAndDataValidadeLessThanEqualOrderByDataValidadeAsc(
        Long igrejaId,
        java.time.LocalDate dataLimite
    );
}
