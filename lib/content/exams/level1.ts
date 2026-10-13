import type { Exam } from "../types";

/* ------------------------------------------------------------------ Abschlusstest Stufe 1 (A1/A2) */

export const LEVEL1_EXAM: Exam = {
  level: 1,

  /* ---------------------------------------------------------------- Lückentext */
  cloze: {
    title: "A Weekend in York",
    intro:
      "Lies die Geschichte von Ingrid, die ihre Enkelkinder in England besucht. Fülle die Lücken: Wähle bei den Auswahlfeldern die richtige Option, und schreib bei den freien Lücken die passende Form – der Hinweis in Klammern hilft dir.",
    text:
      "Ingrid is sixty-eight and lives in a small town near Hanover. Her daughter Anna married an Englishman, and the family lives in York with their two children, Lily and Sam. Every year Ingrid {1} them for a long weekend. This year she flew to Manchester {2} a Friday in October. The flight was short, but the train to York {3} very late.\n\n" +
      "When she finally arrived, Lily and Sam were on the platform with a big sign: 'Welcome, Oma!' '{4} was your train so late?' asked Lily. 'There was a problem with the signals,' Ingrid explained, and the children laughed and took her suitcase.\n\n" +
      "'How {5} you sleep, Oma?' Sam asked at breakfast the next morning. 'Very well, thank you!' After breakfast the whole family {6} along the old city walls. In the afternoon they visited a little tea room, and Sam {7} two huge pieces of chocolate cake. After dinner Lily asked, '{8} you play cards with us, Oma?' 'Of course!' said Ingrid, and they played until ten o'clock.\n\n" +
      "Now it is Sunday afternoon, and Ingrid {9} on the train back to Manchester. She is looking at the photos on her phone and smiling. Her flight leaves {10} six o'clock, so she {11} hurry – she has lots of time. Next year Anna and the children want to come to Germany. Ingrid {12} yet where they will all sleep, but she isn't worried. 'We'll find a way,' she thinks.",
    gaps: [
      {
        options: ["visit", "visits", "is visiting", "visiting"],
        answer: 1,
        lesson: "simple-present",
        explanation: "every year = regelmäßig → Simple Present; Ingrid = she → visits mit -s.",
      },
      {
        options: ["in", "on", "at"],
        answer: 1,
        lesson: "prepositions-time",
        explanation: "Ein bestimmter Tag (a Friday) → on.",
      },
      {
        answers: ["was"],
        hint: "(be)",
        lesson: "past-simple",
        explanation: "Vergangenheit von be bei the train (= it) → was.",
      },
      {
        options: ["Why", "Who", "Which", "What"],
        answer: 0,
        lesson: "questions",
        explanation: "Lily fragt nach dem Grund (Ingrid antwortet mit einem Grund) → why = warum.",
      },
      {
        answers: ["did"],
        hint: "(Hilfsverb)",
        lesson: "questions",
        explanation: "Frage nach der vergangenen Nacht mit dem Vollverb sleep → How did you sleep?",
      },
      {
        answers: ["walked"],
        hint: "(walk)",
        lesson: "past-simple",
        explanation: "Abgeschlossene Handlung in der Vergangenheit, regelmäßiges Verb → walked.",
      },
      {
        answers: ["ate"],
        hint: "(eat)",
        lesson: "past-simple",
        explanation: "eat ist unregelmäßig: eat → ate.",
      },
      {
        options: ["Can", "Must", "Do", "Are"],
        answer: 0,
        lesson: "modal-verbs",
        explanation: "Lily bittet Oma, mitzuspielen → Can you …? (Möglichkeit / Bitte).",
      },
      {
        answers: ["is sitting", "'s sitting"],
        hint: "(sit)",
        lesson: "present-progressive",
        explanation: "Now = gerade jetzt → is + sitting (t wird verdoppelt).",
      },
      {
        options: ["in", "on", "at"],
        answer: 2,
        lesson: "prepositions-time",
        explanation: "Uhrzeit → at six o'clock.",
      },
      {
        options: ["mustn't", "doesn't have to", "can't", "couldn't"],
        answer: 1,
        lesson: "modal-verbs",
        explanation: "Sie hat viel Zeit, es ist also nicht nötig → doesn't have to. mustn't wäre ein Verbot.",
      },
      {
        answers: ["doesn't know", "does not know"],
        hint: "(not / know)",
        lesson: "simple-present",
        explanation: "know ist ein Zustandsverb → Simple Present; bei she verneinst du mit doesn't + Grundform.",
      },
    ],
  },

  /* ---------------------------------------------------------------- Grammatik gemischt */
  grammar: [
    {
      type: "gap",
      sentence: "My neighbour ___ (wash) his car every Saturday.",
      answers: ["washes"],
      lesson: "simple-present",
      explanation: "Gewohnheit (every Saturday), he → -s; nach -sh wird es -es: washes.",
    },
    {
      type: "choice",
      sentence: "Can I call you back later? I ___ a cake right now.",
      options: ["bake", "am baking", "baked", "bakes"],
      answer: 1,
      lesson: "present-progressive",
      explanation: "right now → Present Progressive: am baking.",
    },
    {
      type: "gap",
      sentence: "We ___ (catch) the last bus home last night.",
      answers: ["caught"],
      lesson: "past-simple",
      explanation: "last night → Simple Past; catch ist unregelmäßig: caught.",
    },
    {
      type: "choice",
      sentence: "Our flight leaves ___ 7.15 on Monday morning.",
      options: ["in", "on", "at", "by"],
      answer: 2,
      lesson: "prepositions-time",
      explanation: "Uhrzeit → at 7.15 (und on Monday morning für den Tag).",
    },
    {
      type: "gap",
      sentence: "How long ___ you stay in Edinburgh last summer?",
      answers: ["did"],
      lesson: "questions",
      explanation: "last summer → Vergangenheit; Frage mit Vollverb stay → did.",
    },
    {
      type: "choice",
      sentence: "In Britain you ___ drive on the left. It's the law.",
      options: ["have to", "don't have to", "can't", "could"],
      answer: 0,
      lesson: "modal-verbs",
      explanation: "Eine Regel von außen (das Gesetz) → have to.",
    },
    {
      type: "order",
      words: ["Where", "did", "you", "buy", "those", "lovely", "flowers"],
      translation: "Wo hast du diese schönen Blumen gekauft?",
      lesson: "questions",
      explanation: "Fragewort + did + Subjekt + Grundform (buy, nicht bought).",
    },
    {
      type: "gap",
      sentence: "Normally I take the car, but this week I ___ (cycle) to work.",
      answers: ["am cycling", "'m cycling"],
      lesson: "present-progressive",
      explanation: "this week = vorübergehend, anders als sonst → am cycling.",
    },
    {
      type: "choice",
      sentence: "My parents ___ very happy when my first child was born.",
      options: ["are", "were", "was", "did"],
      answer: 1,
      lesson: "past-simple",
      explanation: "Vergangenheit von be bei they (my parents) → were.",
    },
    {
      type: "gap",
      sentence: "You ___ park here – this space is only for ambulances.",
      answers: ["mustn't", "must not", "can't", "cannot"],
      hint: "nicht dürfen",
      lesson: "modal-verbs",
      explanation: "Verbot → mustn't (oder can't). don't have to wäre falsch: Es geht nicht um „nicht nötig“.",
    },
    {
      type: "choice",
      sentence: "What time ___ the shops close on Saturdays?",
      options: ["do", "does", "are", "is"],
      answer: 0,
      lesson: "simple-present",
      explanation: "the shops = they (Mehrzahl) → do. Vorsicht: nicht does!",
    },
    {
      type: "order",
      words: ["My", "granddaughter", "was", "born", "on", "the", "fifth", "of", "May"],
      translation: "Meine Enkelin wurde am fünften Mai geboren.",
      lesson: "prepositions-time",
      explanation: "Datum → on: on the fifth of May.",
    },
  ],

  /* ---------------------------------------------------------------- Leseverstehen */
  reading: {
    title: "A New Life by the Sea",
    intro:
      "Lies die E-Mail, die Ingrid von ihrer Freundin Monika bekommen hat. Monika ist vor Kurzem nach England gezogen. Beantworte danach die Fragen.",
    text:
      "Hi Ingrid,\n\n" +
      "How are you? I'm sorry I didn't write last month – life in Brighton is very busy! We moved here in March, and I love it. Our flat is small, but it's only five minutes from the sea. Every morning I walk along the beach with our dog, Bruno. The air is fresh and the people are very friendly.\n\n" +
      "Peter started his new job at the hospital in April. He works long hours, but he likes his colleagues. I'm not working at the moment, but I'm doing an English course three mornings a week. My teacher is very patient, and I can understand much more now. I still can't understand people on the phone, though!\n\n" +
      "On Saturdays we often go to the market. Last weekend I bought fresh fish and cooked a big dinner for our new neighbours, Sue and Tom. They brought a bottle of wine and stayed until midnight.\n\n" +
      "Why don't you visit us in the summer? You don't have to book a hotel – we have a sofa bed in the living room. Write soon!\n\n" +
      "Love,\nMonika",
    questions: [
      {
        question: "Wann ist Monika nach Brighton gezogen?",
        options: ["Im März", "Im April", "Letzten Monat", "Im Sommer"],
        answer: 0,
        explanation: "„We moved here in March“ – im März. Im April hat Peter seinen neuen Job angefangen.",
      },
      {
        question: "Was macht Monika jeden Morgen?",
        options: [
          "Sie geht zu ihrem Englischkurs.",
          "Sie geht mit dem Hund am Strand spazieren.",
          "Sie geht auf den Markt.",
          "Sie arbeitet im Krankenhaus.",
        ],
        answer: 1,
        explanation: "„Every morning I walk along the beach with our dog“. Der Englischkurs ist nur an drei Vormittagen pro Woche.",
      },
      {
        question: "Was fällt Monika beim Englischen noch schwer?",
        options: ["Bücher zu lesen", "Mit ihrer Lehrerin zu sprechen", "Menschen am Telefon zu verstehen", "Auf dem Markt einzukaufen"],
        answer: 2,
        explanation: "„I still can't understand people on the phone“ – am Telefon versteht sie die Leute noch nicht.",
      },
      {
        question: "Was ist letztes Wochenende passiert?",
        options: [
          "Monika und Peter waren bei Sue und Tom zum Essen eingeladen.",
          "Monika hat für ihre neuen Nachbarn gekocht.",
          "Peter hat auf dem Markt Fisch gekauft.",
          "Die Nachbarn sind früh nach Hause gegangen.",
        ],
        answer: 1,
        explanation: "„I … cooked a big dinner for our new neighbours“. Die Nachbarn blieben bis Mitternacht.",
      },
      {
        question: "Was schlägt Monika vor?",
        options: [
          "Ingrid soll im Sommer kommen und auf dem Schlafsofa übernachten.",
          "Ingrid soll ein Hotel in Brighton buchen.",
          "Ingrid soll auch einen Englischkurs machen.",
          "Ingrid soll nach Brighton ziehen.",
        ],
        answer: 0,
        explanation: "„Why don't you visit us in the summer? You don't have to book a hotel – we have a sofa bed“.",
      },
    ],
  },
};
