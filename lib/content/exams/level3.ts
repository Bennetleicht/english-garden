import type { Exam } from "../types";

/* ------------------------------------------------------------------ Abschlusstest Stufe 3: Flüssig ausdrücken */

export const LEVEL3_EXAM: Exam = {
  level: 3,

  /* ---------------------------------------------------------------- Lückentext */
  cloze: {
    title: "How Millbrook Saved Its Bakery",
    intro:
      "Lies diesen Zeitungsartikel über eine Dorfbäckerei. Fülle die Lücken: Bei manchen wählst du die richtige Form aus, bei anderen schreibst du sie selbst – die Grundform steht in Klammern dahinter.",
    text:
      "Last spring, the people of Millbrook received some bad news. Harper's Bakery, {1} had stood on the high street since 1938, was going to close. The owner, Margaret Harper, {2} the villagers that she could no longer afford the rising rent and energy bills. \"If nothing {3} (change), I will have to shut the doors in June,\" she explained at a village meeting. Many people could not imagine {4} their day without her fresh bread and famous apple cake.\n\n" +
      "Then Peter Collins, a retired teacher, suggested {5} (set) up a community fund. \"If every family in the village {6} (give) just five pounds a month, we would save the bakery,\" he said. The idea spread quickly. Families organised cake sales, the pub held a quiz night, and even the vicar collected money after the Sunday service. Within three weeks, more than £20,000 {7} (raise). A local builder offered {8} the old ovens for free, and the children from the primary school painted a colourful new sign for the shop window.\n\n" +
      "In September, the bakery {9} by the mayor in front of a cheering crowd. Margaret, {10} grandfather had founded the business, could hardly believe it. She told reporters that she {11} (feel) like the luckiest baker in England. Today the shop is busier than ever, and on Saturdays there is even a small queue outside the door.\n\n" +
      "Last week I asked Margaret {12} she would ever retire. She laughed and pointed at the customers who were waiting patiently for their morning rolls. \"Not as long as this village needs bread,\" she replied.",
    gaps: [
      {
        options: ["who", "which", "where", "whose"],
        answer: 1,
        lesson: "relative-clauses",
        explanation: "Die Bäckerei ist eine Sache, und es folgt eine Zusatzinfo zwischen Kommas → which.",
      },
      {
        options: ["said", "told", "asked", "spoke"],
        answer: 1,
        lesson: "reported-speech",
        explanation: "Direkt danach steht eine Person (the villagers) → told.",
      },
      {
        answers: ["changes"],
        hint: "(change)",
        lesson: "conditionals",
        explanation: "If-Satz Typ 1 (I will have to …): Im if-Teil steht das Simple Present, „nothing“ ist Einzahl → changes.",
      },
      {
        options: ["start", "to start", "starting", "started"],
        answer: 2,
        lesson: "gerund-infinitive",
        explanation: "imagine + -ing: imagine starting.",
      },
      {
        answers: ["setting"],
        hint: "(set)",
        lesson: "gerund-infinitive",
        explanation: "suggest + -ing: suggested setting up. Achtung: doppeltes t.",
      },
      {
        answers: ["gave"],
        hint: "(give)",
        lesson: "conditionals",
        explanation: "If-Satz Typ 2 (… we would save): Im if-Teil steht das Simple Past → gave.",
      },
      {
        answers: ["was raised", "had been raised"],
        hint: "(raise)",
        lesson: "passive",
        explanation: "Das Geld sammelt sich nicht selbst → Passiv in der Vergangenheit: was raised (oder had been raised).",
      },
      {
        options: ["repairing", "to repair", "repair", "repaired"],
        answer: 1,
        lesson: "gerund-infinitive",
        explanation: "offer + to + Grundform: offered to repair.",
      },
      {
        options: ["reopened", "was reopened", "has reopened", "is reopening"],
        answer: 1,
        lesson: "passive",
        explanation: "„by the mayor“ zeigt: Die Bäckerei wurde vom Bürgermeister eröffnet → Passiv in der Vergangenheit: was reopened.",
      },
      {
        answers: ["whose"],
        hint: "(open)",
        lesson: "relative-clauses",
        explanation: "„deren Großvater“ → whose.",
      },
      {
        answers: ["felt"],
        hint: "(feel)",
        lesson: "reported-speech",
        explanation: "Nach „told“ rückt die Zeit zurück: „I feel …“ → she felt (feel – felt – felt).",
      },
      {
        options: ["that", "if", "what", "do"],
        answer: 1,
        lesson: "reported-speech",
        explanation: "Indirekte Ja/Nein-Frage → if (oder whether).",
      },
    ],
  },

  /* ---------------------------------------------------------------- Grammatik gemischt */
  grammar: [
    {
      lesson: "conditionals",
      type: "choice",
      sentence: "I'll lend you my car as long as you ___ careful with it.",
      options: ["will be", "are", "would be", "were"],
      answer: 1,
      explanation: "„as long as“ funktioniert wie „if“ (Typ 1): Simple Present, kein will.",
    },
    {
      lesson: "conditionals",
      type: "gap",
      sentence: "If the museum ___ (not / be) closed on Mondays, we could go there today.",
      answers: ["weren't", "were not", "wasn't", "was not"],
      explanation: "Typ 2 (could im Hauptsatz – das Museum ist ja geschlossen): verneintes Simple Past von be.",
    },
    {
      lesson: "conditionals",
      type: "order",
      words: ["What", "would", "you", "do", "if", "you", "were", "in", "my", "position"],
      translation: "Was würdest du tun, wenn du in meiner Lage wärst?",
      explanation: "Typ 2 als Frage: What would you do + if + Simple Past (were).",
    },
    {
      lesson: "passive",
      type: "choice",
      sentence: "The village church, which ___ at the moment, will reopen at Easter.",
      options: ["is restored", "is being restored", "has restored", "is restoring"],
      answer: 1,
      explanation: "„at the moment“ und die Kirche restauriert sich nicht selbst → Present Progressive Passiv: is being restored.",
    },
    {
      lesson: "passive",
      type: "gap",
      sentence: "More than 300 guests ___ (invite) to the opening of the new library next month.",
      answers: ["will be invited", "'ll be invited", "are going to be invited", "are being invited"],
      explanation: "Zukunft („next month“) im Passiv: will be + 3. Form.",
    },
    {
      lesson: "passive",
      type: "choice",
      sentence: "„Hier darf nicht geraucht werden.“ =",
      options: [
        "Smoking must not be allowed here.",
        "Smoking is not allowed here.",
        "Smoking is not allowing here.",
        "Smoking will not allowed here.",
      ],
      answer: 1,
      explanation: "Typisches Schild-Passiv im Simple Present: is (not) + 3. Form.",
    },
    {
      lesson: "relative-clauses",
      type: "gap",
      sentence: "Is there a shop near here ___ I can buy stamps?",
      answers: ["where"],
      explanation: "Ort + „wo“ → where.",
    },
    {
      lesson: "relative-clauses",
      type: "order",
      words: ["The", "man", "whose", "car", "was", "stolen", "has", "called", "the", "police"],
      translation: "Der Mann, dessen Auto gestohlen wurde, hat die Polizei gerufen.",
      explanation: "whose = dessen. Der Relativsatz (whose car was stolen) steht direkt hinter „The man“.",
    },
    {
      lesson: "reported-speech",
      type: "gap",
      sentence: "„Have you been to Ireland?“ → She asked me if I ___ (be) to Ireland.",
      answers: ["had been", "'d been"],
      explanation: "Indirekte Frage: normale Satzstellung, Present Perfect wird zu Past Perfect.",
    },
    {
      lesson: "reported-speech",
      type: "choice",
      sentence: "„Please don't touch the paintings.“ → The guard told the children ___ the paintings.",
      options: ["not touch", "to not touching", "not to touch", "don't touch"],
      answer: 2,
      explanation: "Verneinte Aufforderung: tell + Person + not to + Grundform.",
    },
    {
      lesson: "gerund-infinitive",
      type: "gap",
      sentence: "Thank you so much for ___ (invite) us to your daughter's wedding.",
      answers: ["inviting"],
      explanation: "Nach einer Präposition (for) steht immer die -ing-Form.",
    },
    {
      lesson: "gerund-infinitive",
      type: "choice",
      sentence: "„Ich habe vor zwei Jahren aufgehört, Kaffee zu trinken.“ = I stopped ___ coffee two years ago.",
      options: ["drinking", "to drink", "drink", "to drinking"],
      answer: 0,
      explanation: "stop + -ing = mit etwas aufhören. „stopped to drink“ hieße: angehalten, um Kaffee zu trinken.",
    },
  ],

  /* ---------------------------------------------------------------- Leseverstehen */
  reading: {
    title: "It's Never Too Late to Learn",
    intro:
      "Lies den Artikel darüber, warum es gut für das Gehirn ist, im späteren Leben eine Sprache zu lernen. Beantworte dann die Fragen – es ist jeweils nur eine Antwort richtig.",
    text:
      "Many people believe that learning a new language is something for children. \"I'm too old for that,\" they say, or \"My memory isn't good enough any more.\" However, scientists who study the brain have found that this is simply not true. Adults of all ages can learn a language successfully, and the process itself seems to be very good for them.\n\n" +
      "When we learn new words and grammar, the brain has to work hard. It builds new connections between nerve cells, and some studies suggest that certain areas of the brain can even grow. Researchers in Edinburgh, for example, found that older people who spoke two or more languages often did better in tests of memory and attention than people who spoke only one – even when they had started learning later in life.\n\n" +
      "Of course, adults learn differently from children. A child picks up a language by listening and playing, while an adult usually wants to understand the rules. This is not a disadvantage. Adults have more experience, they know how they learn best, and they are often more patient and better organised. Many teachers say that their older students are the most motivated people in the class.\n\n" +
      "There is also a social side. Language courses are a good way to meet new people, and travelling becomes much more enjoyable when you can talk to people in their own language. Experts recommend practising a little every day instead of studying for hours once a week. Fifteen minutes with a book, an app or a film can make a real difference. The most important thing, they say, is not to be afraid of making mistakes.",
    questions: [
      {
        question: "What do many people believe about learning a language?",
        options: [
          "It is easier for adults than for children.",
          "It is mainly something for young people.",
          "It is bad for your memory.",
          "It is only useful for travelling.",
        ],
        answer: 1,
        explanation: "Gleich im ersten Satz: Viele glauben, Sprachenlernen sei etwas für Kinder („something for children“).",
      },
      {
        question: "What happens in the brain when we learn a language?",
        options: [
          "It becomes tired and slower.",
          "It forgets older information.",
          "It builds new connections between nerve cells.",
          "Nothing changes after the age of sixty.",
        ],
        answer: 2,
        explanation: "Im zweiten Absatz steht: „It builds new connections between nerve cells.“",
      },
      {
        question: "What did the researchers in Edinburgh find?",
        options: [
          "Only people who learned languages as children had a better memory.",
          "Older people who spoke two or more languages often did better in memory tests.",
          "People who spoke one language were better at paying attention.",
          "Learning a language later in life has no effect.",
        ],
        answer: 1,
        explanation: "Ältere Menschen mit zwei oder mehr Sprachen schnitten bei Gedächtnis- und Aufmerksamkeitstests oft besser ab – auch wenn sie spät angefangen hatten.",
      },
      {
        question: "According to the article, what is an advantage of adult learners?",
        options: [
          "They learn mainly by playing.",
          "They never make mistakes.",
          "They have more experience and are often more patient.",
          "They don't need to understand the rules.",
        ],
        answer: 2,
        explanation: "Im dritten Absatz: Erwachsene haben mehr Erfahrung und sind oft geduldiger und besser organisiert.",
      },
      {
        question: "What do experts recommend?",
        options: [
          "Studying for several hours once a week.",
          "Only learning with a teacher.",
          "Practising a little every day.",
          "Avoiding mistakes at all costs.",
        ],
        answer: 2,
        explanation: "Experten empfehlen, jeden Tag ein bisschen zu üben, statt einmal pro Woche stundenlang zu lernen.",
      },
    ],
  },
};
