package br.com.semear.service.util;

import java.time.LocalDate;
import java.util.List;

/** Mesma lógica do frontend ({@code src/data/verses.ts}) para o versículo rotativo diário. */
public final class VersiculoDoDiaUtils {

    public record Versiculo(String referencia, String texto) {}

    private static final List<Versiculo> VERSICULOS = List.of(
        new Versiculo(
            "Salmos 1:3",
            "Ele é como árvore plantada junto a corrente de águas, que, no devido tempo, dá o seu fruto, e cuja folhagem não murcha; e tudo quanto ele faz será bem sucedido."
        ),
        new Versiculo(
            "Jeremias 29:11",
            "Porque eu bem sei os planos que estou projetando para vós, diz o Senhor; planos de paz e não de mal, para vos dar um futuro e uma esperança."
        ),
        new Versiculo("Filipenses 4:13", "Tudo posso naquele que me fortalece."),
        new Versiculo(
            "Isaías 41:10",
            "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus; eu te fortaleço, e te ajudo, e te sustento com a minha destra fiel."
        ),
        new Versiculo(
            "Romanos 8:28",
            "Sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito."
        ),
        new Versiculo(
            "Provérbios 3:5-6",
            "Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas."
        ),
        new Versiculo("Mateus 11:28", "Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos aliviarei."),
        new Versiculo(
            "João 3:16",
            "Porque Deus amou ao mundo de tal maneira que deu o seu Filho unigênito, para que todo o que nele crê não pereça, mas tenha a vida eterna."
        ),
        new Versiculo(
            "Josué 1:9",
            "Não to mandei eu? Esforça-te e tem bom ânimo; não pasmes, nem te espantes, porque o Senhor, teu Deus, é contigo, por onde quer que andares."
        ),
        new Versiculo("Salmos 23:1", "O Senhor é o meu pastor; nada me faltará.")
    );

    private VersiculoDoDiaUtils() {}

    public static Versiculo obterVersiculoDoDia() {
        return obterVersiculoDoDia(LocalDate.now());
    }

    public static Versiculo obterVersiculoDoDia(LocalDate data) {
        int diaDoAno = data.getDayOfYear();
        return VERSICULOS.get(diaDoAno % VERSICULOS.size());
    }

    /** Limita o corpo da notificação push (FCM). */
    public static String truncarTexto(String texto, int max) {
        if (texto == null || texto.length() <= max) {
            return texto;
        }
        return texto.substring(0, max - 1).trim() + "…";
    }
}
