// Daily verses for the SEMEAR app

export interface Verse {
  reference: string;
  text: string;
  book: string;
  chapter: number;
  verse: number | string;
}

export const dailyVerses: Verse[] = [
  {
    reference: "Salmos 1:3",
    text: "Ele é como árvore plantada junto a corrente de águas, que, no devido tempo, dá o seu fruto, e cuja folhagem não murcha; e tudo quanto ele faz será bem sucedido.",
    book: "Salmos",
    chapter: 1,
    verse: 3,
  },
  {
    reference: "Jeremias 29:11",
    text: "Porque eu bem sei os planos que estou projetando para vós, diz o Senhor; planos de paz e não de mal, para vos dar um futuro e uma esperança.",
    book: "Jeremias",
    chapter: 29,
    verse: 11,
  },
  {
    reference: "Filipenses 4:13",
    text: "Tudo posso naquele que me fortalece.",
    book: "Filipenses",
    chapter: 4,
    verse: 13,
  },
  {
    reference: "Isaías 41:10",
    text: "Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus; eu te fortaleço, e te ajudo, e te sustento com a minha destra fiel.",
    book: "Isaías",
    chapter: 41,
    verse: 10,
  },
  {
    reference: "Romanos 8:28",
    text: "Sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus, daqueles que são chamados segundo o seu propósito.",
    book: "Romanos",
    chapter: 8,
    verse: 28,
  },
  {
    reference: "Provérbios 3:5-6",
    text: "Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.",
    book: "Provérbios",
    chapter: 3,
    verse: "5-6",
  },
  {
    reference: "Mateus 11:28",
    text: "Vinde a mim, todos os que estais cansados e sobrecarregados, e eu vos aliviarei.",
    book: "Mateus",
    chapter: 11,
    verse: 28,
  },
  {
    reference: "João 3:16",
    text: "Porque Deus amou ao mundo de tal maneira que deu o seu Filho unigênito, para que todo o que nele crê não pereça, mas tenha a vida eterna.",
    book: "João",
    chapter: 3,
    verse: 16,
  },
  {
    reference: "Josué 1:9",
    text: "Não to mandei eu? Esforça-te e tem bom ânimo; não pasmes, nem te espantes, porque o Senhor, teu Deus, é contigo, por onde quer que andares.",
    book: "Josué",
    chapter: 1,
    verse: 9,
  },
  {
    reference: "Salmos 23:1",
    text: "O Senhor é o meu pastor; nada me faltará.",
    book: "Salmos",
    chapter: 23,
    verse: 1,
  },
];

export function getVerseOfTheDay(): Verse {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return dailyVerses[dayOfYear % dailyVerses.length];
}

export function getRandomVerse(): Verse {
  return dailyVerses[Math.floor(Math.random() * dailyVerses.length)];
}
