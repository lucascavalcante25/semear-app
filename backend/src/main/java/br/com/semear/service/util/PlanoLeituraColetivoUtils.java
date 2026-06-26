package br.com.semear.service.util;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Mesma lógica do frontend ({@code src/modules/bible/service.ts} — {@code gerarPlanoAnual}) para o plano
 * coletivo da igreja, usando {@code Igreja.dataInicioPlanoLeitura}.
 */
public final class PlanoLeituraColetivoUtils {

    private static final int TOTAL_DIAS = 365;

    private record LivroBiblia(String nome, int capitulos) {}

    private record CapituloLeitura(String livro, int capitulo) {}

    public record LeituraDoDia(int numeroDia, List<CapituloLeitura> leituras) {}

    /** Ordem canônica — espelha {@code src/data/bible-books.ts}. */
    private static final List<LivroBiblia> LIVROS = List.of(
        new LivroBiblia("Gênesis", 50),
        new LivroBiblia("Êxodo", 40),
        new LivroBiblia("Levítico", 27),
        new LivroBiblia("Números", 36),
        new LivroBiblia("Deuteronômio", 34),
        new LivroBiblia("Josué", 24),
        new LivroBiblia("Juízes", 21),
        new LivroBiblia("Rute", 4),
        new LivroBiblia("1 Samuel", 31),
        new LivroBiblia("2 Samuel", 24),
        new LivroBiblia("1 Reis", 22),
        new LivroBiblia("2 Reis", 25),
        new LivroBiblia("1 Crônicas", 29),
        new LivroBiblia("2 Crônicas", 36),
        new LivroBiblia("Esdras", 10),
        new LivroBiblia("Neemias", 13),
        new LivroBiblia("Ester", 10),
        new LivroBiblia("Jó", 42),
        new LivroBiblia("Salmos", 150),
        new LivroBiblia("Provérbios", 31),
        new LivroBiblia("Eclesiastes", 12),
        new LivroBiblia("Cânticos", 8),
        new LivroBiblia("Isaías", 66),
        new LivroBiblia("Jeremias", 52),
        new LivroBiblia("Lamentações", 5),
        new LivroBiblia("Ezequiel", 48),
        new LivroBiblia("Daniel", 12),
        new LivroBiblia("Oséias", 14),
        new LivroBiblia("Joel", 3),
        new LivroBiblia("Amós", 9),
        new LivroBiblia("Obadias", 1),
        new LivroBiblia("Jonas", 4),
        new LivroBiblia("Miquéias", 7),
        new LivroBiblia("Naum", 3),
        new LivroBiblia("Habacuque", 3),
        new LivroBiblia("Sofonias", 3),
        new LivroBiblia("Ageu", 2),
        new LivroBiblia("Zacarias", 14),
        new LivroBiblia("Malaquias", 4),
        new LivroBiblia("Mateus", 28),
        new LivroBiblia("Marcos", 16),
        new LivroBiblia("Lucas", 24),
        new LivroBiblia("João", 21),
        new LivroBiblia("Atos", 28),
        new LivroBiblia("Romanos", 16),
        new LivroBiblia("1 Coríntios", 16),
        new LivroBiblia("2 Coríntios", 13),
        new LivroBiblia("Gálatas", 6),
        new LivroBiblia("Efésios", 6),
        new LivroBiblia("Filipenses", 4),
        new LivroBiblia("Colossenses", 4),
        new LivroBiblia("1 Tessalonicenses", 5),
        new LivroBiblia("2 Tessalonicenses", 3),
        new LivroBiblia("1 Timóteo", 6),
        new LivroBiblia("2 Timóteo", 4),
        new LivroBiblia("Tito", 3),
        new LivroBiblia("Filemom", 1),
        new LivroBiblia("Hebreus", 13),
        new LivroBiblia("Tiago", 5),
        new LivroBiblia("1 Pedro", 5),
        new LivroBiblia("2 Pedro", 3),
        new LivroBiblia("1 João", 5),
        new LivroBiblia("2 João", 1),
        new LivroBiblia("3 João", 1),
        new LivroBiblia("Judas", 1),
        new LivroBiblia("Apocalipse", 22)
    );

    private static final List<List<CapituloLeitura>> DIAS_PLANO = gerarDiasPlano();

    private PlanoLeituraColetivoUtils() {}

    public static Optional<LeituraDoDia> obterLeituraDoDia(LocalDate dataInicioPlano, LocalDate hoje) {
        if (dataInicioPlano == null || hoje.isBefore(dataInicioPlano)) {
            return Optional.empty();
        }
        int indice = (int) Math.min(ChronoUnit.DAYS.between(dataInicioPlano, hoje), TOTAL_DIAS - 1);
        if (indice < 0 || indice >= DIAS_PLANO.size()) {
            return Optional.empty();
        }
        return Optional.of(new LeituraDoDia(indice + 1, DIAS_PLANO.get(indice)));
    }

    /** Texto curto para notificação push. */
    public static String formatarMensagem(LeituraDoDia leitura) {
        String trechos = leitura.leituras().stream().limit(3).map(c -> c.livro() + " " + c.capitulo()).collect(Collectors.joining(", "));
        if (leitura.leituras().size() > 3) {
            trechos += "…";
        }
        return "Dia " + leitura.numeroDia() + " — " + trechos;
    }

    private static List<List<CapituloLeitura>> gerarDiasPlano() {
        List<CapituloLeitura> capitulos = new ArrayList<>();
        for (LivroBiblia livro : LIVROS) {
            for (int cap = 1; cap <= livro.capitulos(); cap++) {
                capitulos.add(new CapituloLeitura(livro.nome(), cap));
            }
        }
        int base = capitulos.size() / TOTAL_DIAS;
        int resto = capitulos.size() % TOTAL_DIAS;
        List<List<CapituloLeitura>> dias = new ArrayList<>(TOTAL_DIAS);
        int cursor = 0;
        for (int i = 0; i < TOTAL_DIAS; i++) {
            int tamanho = base + (i < resto ? 1 : 0);
            dias.add(new ArrayList<>(capitulos.subList(cursor, cursor + tamanho)));
            cursor += tamanho;
        }
        return dias;
    }
}
