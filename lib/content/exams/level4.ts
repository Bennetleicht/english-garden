import type { Exam } from "../types";

/* ------------------------------------------------------------------ Abschlusstest Stufe 4 (B2) */

export const LEVEL4_EXAM: Exam = {
  level: 4,

  /* ---------------------------------------------------------------- Lückentext */
  cloze: {
    title: "Forty Years Later: Looking Back on My Move to England",
    intro:
      "Lies den Blogeintrag einer Frau, die vor vierzig Jahren nach England gezogen ist. Fülle die Lücken: Wähle bei den Auswahlfeldern die richtige Option, und schreib bei den freien Lücken die passende Form – der Hinweis in Klammern hilft dir.",
    text:
      "Last week I {1} a box of old letters in the attic, and they brought back so many memories. In 1984, when I was twenty-three, I left my small town near Hamburg and moved to Manchester to work as a nurse. My parents were worried, of course. I had already {2} the move twice, so this time I simply packed my suitcase and bought a one-way ticket before I could change my mind.\n\n" +
      "The first months were hard. I {3} used to the grey skies, and it took me ages to {4} driving on the left. Back home, I {5} cycle everywhere, but in Manchester the traffic frightened me. My English was {6} quite good on paper, but in real conversations I often understood only half of what people said. Still, on my first day I told the ward sister that I hoped to {7} a really good nurse one day.\n\n" +
      "My landlady, Mrs Doyle, was wonderful. She {8} after me as if I were her own daughter, and over endless cups of tea she taught me how people here really speak. Whenever I complained that something was too difficult, she would laugh and say, 'Nonsense, love, it's a piece of {9}!' I still hear her voice when I'm nervous.\n\n" +
      "Of course, there are things I regret. If I {10} how lonely the first winter would be, I would have joined a club or a choir much sooner. And I {11} my mother more often – phone calls to Germany were expensive back then, but she was always waiting by the phone. Still, moving abroad was the best decision of my life. If I hadn't found the courage to go, I {12} three wonderful British grandchildren today. These days the rain doesn't bother me any more – I'm used to it! So if you're dreaming of a new start somewhere, don't get cold feet.",
    gaps: [
      {
        options: ["came across", "came up", "came over", "got on with"],
        answer: 0,
        lesson: "phrasal-verbs",
        explanation: "zufällig finden = come across (Vergangenheit: came across).",
      },
      {
        answers: ["put off"],
        hint: "(put + Partikel: verschieben)",
        lesson: "phrasal-verbs",
        explanation: "verschieben = put off; nach „had already“ die 3. Form: put off.",
      },
      {
        answers: ["wasn't", "was not"],
        hint: "(not / be)",
        lesson: "used-to",
        explanation: "Damals nicht gewohnt sein = wasn't used to + Nomen.",
      },
      {
        options: ["get used to", "use to", "used to", "be use to"],
        answer: 0,
        lesson: "used-to",
        explanation: "sich gewöhnen an = get used to + -ing (driving).",
      },
      {
        answers: ["used to", "would"],
        hint: "(früher)",
        lesson: "used-to",
        explanation: "Frühere Gewohnheit, die vorbei ist: used to + Grundform (oder erzählend: would).",
      },
      {
        options: ["actually", "currently", "eventually", "possibly"],
        answer: 0,
        lesson: "false-friends",
        explanation: "eigentlich, tatsächlich = actually. eventually heißt „schließlich“.",
      },
      {
        options: ["become", "get", "receive", "will"],
        answer: 0,
        lesson: "false-friends",
        explanation: "werden = become (bekommen = get / receive).",
      },
      {
        answers: ["looked", "looked after"],
        hint: "(look)",
        lesson: "phrasal-verbs",
        explanation: "sich kümmern um = look after; in der Erzählung Vergangenheit: looked after.",
      },
      {
        options: ["cake", "bread", "pie", "biscuit"],
        answer: 0,
        lesson: "idioms",
        explanation: "a piece of cake = kinderleicht. Idioms haben eine feste Form.",
      },
      {
        answers: ["had known", "'d known"],
        hint: "(know)",
        lesson: "third-conditional",
        explanation: "If-Satz Typ 3: if + had + 3. Form (im if-Teil nie „would“).",
      },
      {
        answers: ["should have called", "should've called"],
        hint: "(should / call)",
        lesson: "third-conditional",
        explanation: "Bedauern über die Vergangenheit: should have + 3. Form = hätte … sollen.",
      },
      {
        options: ["wouldn't have", "wouldn't have had", "won't have", "hadn't had"],
        answer: 0,
        lesson: "third-conditional",
        explanation: "Gemischter If-Satz: Vergangenheit im if-Teil, Folge für heute („today“) → would + Grundform: wouldn't have.",
      },
    ],
  },

  /* ---------------------------------------------------------------- Grammatik */
  grammar: [
    {
      type: "gap",
      sentence: "If the weather had been better, we ___ (go) for a walk along the coast.",
      answers: ["would have gone", "would've gone", "'d have gone"],
      lesson: "third-conditional",
      explanation: "Typ 3, Hauptsatz: would have + 3. Form (go – went – gone).",
    },
    {
      type: "choice",
      sentence: "If I ___ so much coffee last night, I wouldn't be so tired now.",
      options: ["didn't drink", "hadn't drunk", "wouldn't have drunk", "haven't drunk"],
      answer: 1,
      lesson: "third-conditional",
      explanation: "Gemischt: gestern (had not + 3. Form) → Folge heute (wouldn't be … now).",
    },
    {
      type: "gap",
      sentence: "I wish you ___ (tell) me about the problem sooner – I could have helped.",
      answers: ["had told", "'d told"],
      lesson: "third-conditional",
      explanation: "Bedauern über die Vergangenheit: wish + had + 3. Form.",
    },
    {
      type: "choice",
      sentence: "When we lived in the countryside, we ___ go to bed at nine every night.",
      options: ["were used to", "used to", "got used to", "are used to"],
      answer: 1,
      lesson: "used-to",
      explanation: "Frühere Gewohnheit + Grundform (go) → used to. „be/get used to“ bräuchte -ing.",
    },
    {
      type: "gap",
      sentence: "Moving from a house to a small flat wasn't easy, but I've got used to ___ (have) less space.",
      answers: ["having"],
      lesson: "used-to",
      explanation: "get used to + -ing.",
    },
    {
      type: "choice",
      sentence: "My new neighbours are lovely – they've offered to ___ the house while I'm away.",
      options: ["keep an eye on", "keep an ear on", "have an eye at", "hold an eye on"],
      answer: 0,
      lesson: "idioms",
      explanation: "ein Auge haben auf = keep an eye on.",
    },
    {
      type: "gap",
      sentence: "We've run ___ of coffee – could you pick some up on your way home?",
      answers: ["out"],
      lesson: "phrasal-verbs",
      explanation: "Uns ist etwas ausgegangen = run out of.",
    },
    {
      type: "choice",
      sentence: "My son and his father-in-law don't really ___ each other.",
      options: ["get on with", "get on", "look after", "put off"],
      answer: 0,
      lesson: "phrasal-verbs",
      explanation: "gut miteinander auskommen = get on with.",
    },
    {
      type: "choice",
      sentence: "My sister cries at every sad film – she's very ___.",
      options: ["sensible", "sensitive", "sympathetic", "brave"],
      answer: 1,
      lesson: "false-friends",
      explanation: "sensibel = sensitive. sensible heißt „vernünftig“.",
    },
    {
      type: "gap",
      sentence: "I'm ___ (eigentlich) a teacher, but at the moment I'm working in a bookshop.",
      answers: ["actually"],
      lesson: "false-friends",
      explanation: "eigentlich = actually (aktuell = current).",
    },
    {
      type: "order",
      words: ["I", "will", "sleep", "on", "it", "and", "call", "you", "tomorrow"],
      translation: "Ich schlafe eine Nacht darüber und rufe dich morgen an.",
      lesson: "idioms",
      explanation: "sleep on it = eine Nacht darüber schlafen.",
    },
    {
      type: "order",
      words: ["If", "we", "had", "left", "earlier", "we", "wouldn't", "have", "missed", "the", "plane"],
      translation: "Wenn wir früher losgefahren wären, hätten wir den Flug nicht verpasst.",
      lesson: "third-conditional",
      explanation: "Typ 3: if + had + 3. Form, wouldn't have + 3. Form.",
    },
  ],

  /* ---------------------------------------------------------------- Leseverstehen */
  reading: {
    title: "More Than Just a Cuppa: How Britain's Tea Habits Are Changing",
    intro:
      "Lies den Artikel über die britische Teekultur aufmerksam. Beantworte danach die Fragen – es ist jeweils nur eine Antwort richtig. Du musst nicht jedes Wort kennen; achte auf den Zusammenhang.",
    text:
      "Ask people around the world what they associate with Britain, and tea will almost certainly be near the top of the list. For generations, the British have reached for the kettle in almost every situation: to celebrate good news, to comfort a friend after a shock, or simply to fill a quiet moment in the afternoon. Even today, millions of cups are drunk across the country every single day.\n\n" +
      "It wasn't always like this. When tea first arrived in England in the seventeenth century, it was so expensive that wealthy families kept their tea leaves in locked wooden boxes. Over the next two hundred years, as prices fell, tea gradually became the everyday drink of ordinary working families. Around the same time, the custom of afternoon tea – sandwiches, scones and cakes served in the late afternoon – became fashionable among the upper classes.\n\n" +
      "In recent years, however, things have started to change. Many younger Britons drink far less traditional black tea than their parents did. Coffee shops now line almost every high street, and supermarket shelves are full of herbal, green and fruit teas. Sales of ordinary tea bags have been falling for some time. \"People used to come in and simply ask for 'a tea',\" says Sarah Mills, who runs a small tea room in York. \"Now they want to know where the leaves come from and how long to brew them. Some of my younger customers have never had a proper pot of tea in their lives.\"\n\n" +
      "Yet tea has not lost its place in British life. In many offices, someone still makes a 'tea round' – a cup for every colleague, each made exactly the way that person likes it. And when something goes wrong, the first reaction in most homes is still to put the kettle on. \"Fashions come and go,\" Mills says with a smile, \"but old habits die hard. When people are upset, nobody says, 'Let me make you a flat white.'\"",
    questions: [
      {
        question: "Why did wealthy families keep their tea in locked boxes in the seventeenth century?",
        options: [
          "Because tea was very expensive.",
          "Because it was illegal to drink tea.",
          "Because the leaves went bad quickly in the light.",
          "Because tea was only for special occasions.",
        ],
        answer: 0,
        explanation: "Im zweiten Absatz steht: Tee war „so expensive“, dass reiche Familien ihn in verschlossenen Holzkisten aufbewahrten.",
      },
      {
        question: "What does the article say about younger Britons?",
        options: [
          "They have stopped drinking hot drinks completely.",
          "They drink less traditional black tea than their parents did.",
          "They prefer afternoon tea to coffee.",
          "They only drink tea in tea rooms.",
        ],
        answer: 1,
        explanation: "Dritter Absatz: „Many younger Britons drink far less traditional black tea than their parents did.“",
      },
      {
        question: "According to Sarah Mills, how have her customers changed?",
        options: [
          "They are more interested in where their tea comes from and how to make it.",
          "They no longer visit tea rooms at all.",
          "They always order coffee instead of tea.",
          "They complain more about the prices.",
        ],
        answer: 0,
        explanation: "Sarah Mills sagt, die Gäste wollen heute wissen, woher die Blätter kommen und wie lange man sie ziehen lässt.",
      },
      {
        question: "What is a 'tea round'?",
        options: [
          "A type of biscuit that is served with tea.",
          "A competition to make the best cup of tea.",
          "When one person makes tea for all their colleagues.",
          "A short break that everyone takes in the afternoon.",
        ],
        answer: 2,
        explanation: "Der Artikel erklärt es direkt: eine Tasse für jede Kollegin und jeden Kollegen, genau so, wie die Person ihn mag.",
      },
      {
        question: "What does Sarah Mills mean when she says \"old habits die hard\"?",
        options: [
          "Old traditions can be dangerous.",
          "It is difficult to stop doing things you have always done.",
          "Older people drink more tea than younger people.",
          "Habits usually change very quickly.",
        ],
        answer: 1,
        explanation: "„Old habits die hard“ ist ein Idiom: Alte Gewohnheiten legt man nur schwer ab. Deshalb kochen die Briten bei Problemen immer noch Tee.",
      },
    ],
  },
};
