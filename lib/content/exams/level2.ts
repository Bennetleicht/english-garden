import type { Exam } from "../types";

/* ------------------------------------------------------------------ Abschlusstest Stufe 2: Sicher im Gespräch */

export const LEVEL2_EXAM: Exam = {
  level: 2,

  /* ---------------------------------------------------------------- Teil 1: Lückentext */
  cloze: {
    title: "My First Trip to Ireland",
    intro:
      "Maria schreibt ihrer Freundin Helen einen Brief über ihre erste Reise nach Irland und ihre Pläne für das nächste Jahr. Fülle die Lücken: Wähle die passende Form aus oder schreibe das Wort in Klammern in der richtigen Form.",
    text:
      "Dear Helen,\n\nI {1} back from my first trip to Ireland, and I have to tell you everything! As you know, I {2} Irish music for years, so this trip was a dream come true. Last month I finally {3} a cheap flight to Dublin, and off I went.\n\nDublin was much {4} than I expected – the streets were full of music, tourists and friendly people. On the second day I {5} the train to Galway. It moved {6} through green fields and past old stone walls, so I had lots of time to enjoy the view. In Galway I met an old fisherman in a pub. He spoke very {7}, and at first I understood almost nothing, but he was so kind that we laughed all evening. Honestly, it was the {8} holiday I've ever had.\n\nSo what do I {9} of Ireland? {10} you ask me, it's the perfect place for anyone who loves nature, music and good conversation. The weather wasn't always nice, of course, but nobody seemed to mind.\n\nAnd here's the big news: next year I {11} back with my sister – we decided on the phone last night. We {12} the ferry from Holyhead on the third of June; the tickets are already booked. Why don't you come with us? I'm sure you'd love it too.\n\nLove,\nMaria",
    gaps: [
      {
        hint: "(just / come)",
        answers: ["have just come", "'ve just come", "ve just come"],
        lesson: "present-perfect",
        explanation: "Die Rückkehr ist gerade eben passiert und jetzt wichtig → Present Perfect mit **just**: **have just come**.",
      },
      {
        options: ["have loved", "loved", "am loving"],
        answer: 0,
        lesson: "present-perfect",
        explanation: "Sie liebt irische Musik **seit Jahren** und immer noch → Present Perfect mit **for**: **have loved**.",
      },
      {
        hint: "(book)",
        answers: ["booked"],
        lesson: "perfect-vs-past",
        explanation: "**Last month** ist ein Zeitpunkt in der Vergangenheit → Past Simple: **booked**.",
      },
      {
        options: ["busy", "busier", "more busy", "busiest"],
        answer: 1,
        lesson: "comparison",
        explanation: "Vergleich mit **than**; busy endet auf -y → **busier**.",
      },
      {
        hint: "(take)",
        answers: ["took"],
        lesson: "perfect-vs-past",
        explanation: "**On the second day** – ein fester Zeitpunkt in der abgeschlossenen Reise → Past Simple: **took**.",
      },
      {
        hint: "(slow)",
        answers: ["slowly"],
        lesson: "adjective-adverb",
        explanation: "Es beschreibt, **wie** der Zug fuhr → Adverb: **slowly**.",
      },
      {
        options: ["quick", "quickly", "fastly"],
        answer: 1,
        lesson: "adjective-adverb",
        explanation: "Es beschreibt, **wie** er sprach → Adverb **quickly**. „fastly“ gibt es nicht.",
      },
      {
        hint: "(good)",
        answers: ["best"],
        lesson: "comparison",
        explanation: "Superlativ von good ist unregelmäßig: good – better – **the best**.",
      },
      {
        options: ["think", "mean", "feel"],
        answer: 0,
        lesson: "opinions",
        explanation: "„Was halte ich von …?“ = **What do I think of …?**",
      },
      {
        options: ["If", "When", "As"],
        answer: 0,
        lesson: "opinions",
        explanation: "Feste Wendung für eine Meinung: **If you ask me, …** = Wenn du mich fragst, …",
      },
      {
        hint: "(go)",
        answers: ["am going to go", "'m going to go", "m going to go", "am going", "'m going", "m going"],
        lesson: "future",
        explanation: "Ein bereits gefasster Plan (gestern besprochen) → **am going to go** oder **am going** (Present Progressive). **will** passt hier nicht, weil es keine spontane Entscheidung ist.",
      },
      {
        options: ["will take", "are taking", "take"],
        answer: 1,
        lesson: "future",
        explanation: "Feste Verabredung mit Datum, Tickets schon gebucht → Present Progressive: **are taking**.",
      },
    ],
  },

  /* ---------------------------------------------------------------- Teil 2: Grammatik gemischt */
  grammar: [
    {
      type: "gap",
      lesson: "present-perfect",
      sentence: "My grandson ___ (not / ring) me since his birthday.",
      answers: ["hasn't rung", "has not rung"],
      explanation: "**since** + bis heute → Present Perfect, verneint: **hasn't rung** (ring – rang – **rung**).",
    },
    {
      type: "choice",
      lesson: "perfect-vs-past",
      sentence: "We ___ in Spain for three weeks in 1995. It was our first holiday abroad.",
      options: ["have been", "were", "have gone"],
      answer: 1,
      explanation: "**in 1995** ist ein abgeschlossener Zeitpunkt → Past Simple **were**, obwohl „for three weeks“ dabeisteht.",
    },
    {
      type: "gap",
      lesson: "perfect-vs-past",
      sentence: "___ (you / see) the fireworks last night?",
      answers: ["did you see"],
      explanation: "**last night** → Past Simple; Frage mit **did** + Grundform: **Did you see**.",
    },
    {
      type: "choice",
      lesson: "future",
      sentence: "Oh, the shop is closed. Never mind, I ___ tomorrow.",
      options: ["come back", "'ll come back", "'m coming back"],
      answer: 1,
      explanation: "Eine spontane Entscheidung im Moment → **will** ('ll come back).",
    },
    {
      type: "gap",
      lesson: "future",
      sentence: "If it ___ (rain) tomorrow, we'll visit the museum instead.",
      answers: ["rains"],
      explanation: "Nach **if** steht kein will, sondern das Simple Present: **rains**.",
    },
    {
      type: "choice",
      lesson: "comparison",
      sentence: "Travelling by train is ___ than flying, but it's much more relaxing.",
      options: ["slow", "slower", "more slow", "slowest"],
      answer: 1,
      explanation: "Kurzes Adjektiv + **than** → **slower**.",
    },
    {
      type: "gap",
      lesson: "comparison",
      sentence: "This winter isn't ___ cold as last winter.",
      answers: ["as"],
      explanation: "„nicht so … wie“ = **not as … as**.",
    },
    {
      type: "choice",
      lesson: "adjective-adverb",
      sentence: "The children were playing so ___ that I fell asleep on the sofa.",
      options: ["quiet", "quietly", "quieter"],
      answer: 1,
      explanation: "Es beschreibt, **wie** sie spielten → Adverb **quietly**.",
    },
    {
      type: "gap",
      lesson: "adjective-adverb",
      sentence: "The fish tasted ___ (terrible), so we sent it back to the kitchen.",
      answers: ["terrible"],
      explanation: "Nach **taste** steht ein Adjektiv, kein Adverb: **tasted terrible**.",
    },
    {
      type: "choice",
      lesson: "opinions",
      sentence: "I'm afraid I ___ agree. I think the old town hall should stay.",
      options: ["don't", "am not", "not"],
      answer: 0,
      explanation: "**agree** ist ein Verb → Verneinung mit **don't**: I'm afraid I don't agree.",
    },
    {
      type: "order",
      lesson: "opinions",
      words: ["What", "do", "you", "think", "of", "the", "new", "garden", "centre"],
      translation: "Was hältst du von dem neuen Gartencenter?",
      explanation: "Nach der Meinung fragen: **What do you think of …?** (nicht „How“).",
    },
    {
      type: "order",
      lesson: "present-perfect",
      words: ["I", "have", "lived", "in", "this", "village", "since", "I", "retired"],
      translation: "Ich wohne in diesem Dorf, seit ich in Rente gegangen bin.",
      explanation: "„seit“ bis heute → Present Perfect **have lived** + **since** mit Startpunkt.",
    },
  ],

  /* ---------------------------------------------------------------- Teil 3: Leseverstehen */
  reading: {
    title: "Never Too Old to Sail",
    intro:
      "Lies den kurzen Zeitschriftenartikel über ein Rentnerpaar, das segeln gelernt hat. Beantworte danach die Fragen. Du musst nicht jedes Wort verstehen – achte auf die wichtigen Informationen.",
    text:
      "When Peter and Ann Walsh retired three years ago, their friends expected them to spend more time in their garden. Instead, the couple from Bristol decided to learn something completely new: sailing.\n\n\"We had always loved the sea, but we had never been on a sailing boat,\" says Ann, 67. \"One day we saw an advert for a beginners' course at the local sailing club, and Peter said, 'Why not?'\"\n\nThe first weeks were not easy. Peter, who worked as a bank manager for 35 years, found the ropes and knots confusing. \"I felt like a schoolboy again,\" he laughs. \"The instructors were half our age, but they were very patient with us.\" Ann learned the knots more quickly, but she was nervous when the wind was strong.\n\nToday, the couple sail almost every weekend from April to October. Last summer they spent two weeks sailing along the coast of Cornwall with two friends from the club. \"It was the best holiday we've ever had,\" says Peter. \"We slept on the boat, cooked simple meals and watched the stars at night.\"\n\nTheir advice for other retired people? \"Don't think you're too old,\" says Ann. \"Learning something new keeps your mind young. And if you make mistakes, just laugh about them.\" Next year, they are planning to sail to France.",
    questions: [
      {
        question: "Was haben die Freunde von Peter und Ann nach der Rente erwartet?",
        options: [
          "Dass sie mehr Zeit im Garten verbringen.",
          "Dass sie nach Frankreich ziehen.",
          "Dass sie segeln lernen.",
          "Dass sie wieder arbeiten gehen.",
        ],
        answer: 0,
        explanation: "Im ersten Absatz steht: „their friends expected them to spend more time in their garden“.",
      },
      {
        question: "Wie sind die beiden auf den Segelkurs gekommen?",
        options: [
          "Freunde haben ihnen davon erzählt.",
          "Sie haben eine Anzeige gesehen.",
          "Ihre Kinder haben ihnen den Kurs geschenkt.",
          "Peter ist früher schon gesegelt.",
        ],
        answer: 1,
        explanation: "Ann sagt: „we saw an advert for a beginners' course“ – sie haben eine Anzeige gesehen.",
      },
      {
        question: "Was fiel Peter am Anfang schwer?",
        options: [
          "Der starke Wind",
          "Die Seile und Knoten",
          "Die jungen Lehrer",
          "Das Kochen an Bord",
        ],
        answer: 1,
        explanation: "Peter „found the ropes and knots confusing“. Der starke Wind machte dagegen **Ann** nervös.",
      },
      {
        question: "Was haben sie letzten Sommer gemacht?",
        options: [
          "Sie waren zwei Wochen in Frankreich.",
          "Sie haben in Hotels an der Küste übernachtet.",
          "Sie sind mit zwei Freunden an der Küste von Cornwall entlanggesegelt.",
          "Sie haben einen Kurs für Fortgeschrittene gemacht.",
        ],
        answer: 2,
        explanation: "„Last summer they spent two weeks sailing along the coast of Cornwall with two friends“. Nach Frankreich wollen sie erst **nächstes Jahr**.",
      },
      {
        question: "Welchen Rat gibt Ann anderen Menschen im Ruhestand?",
        options: [
          "Man sollte zuerst mit jungen Leuten üben.",
          "Man ist nie zu alt für etwas Neues – und über Fehler sollte man lachen.",
          "Man sollte nur bei wenig Wind segeln.",
          "Man sollte sich ein eigenes Boot kaufen.",
        ],
        answer: 1,
        explanation: "Ann sagt: „Don't think you're too old … if you make mistakes, just laugh about them.“",
      },
    ],
  },
};
