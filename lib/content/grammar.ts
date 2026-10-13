/**
 * Grammatik-Lektionen. Erklärungen auf Deutsch, Übungen auf Englisch.
 * In Texten markiert **so** eine Hervorhebung.
 *
 * Übungstypen:
 * - gap:    Lückentext, "___" markiert die Lücke, `answers` enthält alle akzeptierten Lösungen
 * - choice: Auswahl aus mehreren Möglichkeiten
 * - order:  Satzbau – die Wörter in `words` stehen in der richtigen Reihenfolge und werden gemischt angezeigt
 */

export type Block =
  | { kind: "text"; text: string }
  | { kind: "rule"; title: string; text: string }
  | { kind: "examples"; items: { en: string; de: string }[] }
  | { kind: "tip"; text: string };

export type Exercise =
  | { type: "gap"; sentence: string; answers: string[]; hint?: string; explanation: string }
  | { type: "choice"; sentence: string; options: string[]; answer: number; explanation: string }
  | { type: "order"; words: string[]; translation: string; explanation: string };

export interface Lesson {
  slug: string;
  level: number;
  title: string;
  subtitle: string;
  blocks: Block[];
  exercises: Exercise[];
}

export const LESSONS: Lesson[] = [
  /* ------------------------------------------------------------------ Stufe 1 */
  {
    slug: "simple-present",
    level: 1,
    title: "Simple Present",
    subtitle: "Gewohnheiten, Fakten und der Alltag",
    blocks: [
      {
        kind: "text",
        text: "Das **Simple Present** benutzt du für Dinge, die regelmäßig passieren oder immer gelten: Gewohnheiten, Routinen und Tatsachen.",
      },
      {
        kind: "rule",
        title: "So wird es gebildet",
        text: "Grundform des Verbs: **I / you / we / they work**. Nur bei **he / she / it** hängst du ein **-s** an: **she works**. Bei Verben auf -s, -sh, -ch, -o wird es **-es**: **he goes, she watches**.",
      },
      {
        kind: "rule",
        title: "Verneinung und Fragen",
        text: "Mit **don't / doesn't** verneinen, mit **do / does** fragen. Achtung: Nach **does / doesn't** steht das Verb wieder **ohne -s**: **She doesn't work. Does she work?**",
      },
      {
        kind: "examples",
        items: [
          { en: "I drink tea every morning.", de: "Ich trinke jeden Morgen Tee." },
          { en: "My husband reads the newspaper.", de: "Mein Mann liest die Zeitung." },
          { en: "We don't eat meat.", de: "Wir essen kein Fleisch." },
          { en: "Does your daughter live nearby?", de: "Wohnt deine Tochter in der Nähe?" },
        ],
      },
      {
        kind: "tip",
        text: "Signalwörter: **always, usually, often, sometimes, never, every day, on Mondays**. Häufigkeitswörter stehen vor dem Verb: **I often go …**",
      },
    ],
    exercises: [
      { type: "gap", sentence: "My friend ___ (live) in London.", answers: ["lives"], explanation: "he/she/it → -s: she lives." },
      { type: "gap", sentence: "We ___ (not / like) cold weather.", answers: ["don't like", "do not like"], explanation: "Bei we: don't + Grundform." },
      { type: "choice", sentence: "___ your husband play golf?", options: ["Do", "Does", "Is", "Has"], answer: 1, explanation: "Frage bei he/she/it mit does." },
      { type: "gap", sentence: "She ___ (watch) the news every evening.", answers: ["watches"], explanation: "Verben auf -ch bekommen -es: watches." },
      {
        type: "order",
        words: ["I", "usually", "go", "shopping", "on", "Saturdays"],
        translation: "Ich gehe normalerweise samstags einkaufen.",
        explanation: "Häufigkeitswort (usually) steht vor dem Verb.",
      },
    ],
  },
  {
    slug: "present-progressive",
    level: 1,
    title: "Present Progressive",
    subtitle: "Was gerade jetzt passiert",
    blocks: [
      {
        kind: "text",
        text: "Im Deutschen sagen wir „Ich lese gerade“. Im Englischen gibt es dafür eine eigene Zeit: das **Present Progressive** (auch Present Continuous).",
      },
      {
        kind: "rule",
        title: "So wird es gebildet",
        text: "**am / is / are + Verb mit -ing**: **I am reading. She is cooking. They are sleeping.**",
      },
      {
        kind: "rule",
        title: "Simple Present oder Progressive?",
        text: "Regelmäßig / immer → **Simple Present** (I work in a bank). Gerade jetzt / vorübergehend → **Progressive** (I'm working from home this week).",
      },
      {
        kind: "examples",
        items: [
          { en: "Listen! The birds are singing.", de: "Hör mal! Die Vögel singen." },
          { en: "I'm cooking dinner at the moment.", de: "Ich koche gerade Abendessen." },
          { en: "She usually drives, but today she's taking the bus.", de: "Normalerweise fährt sie Auto, aber heute nimmt sie den Bus." },
        ],
      },
      {
        kind: "tip",
        text: "Verben wie **like, love, know, want, understand, believe** stehen fast nie in der -ing-Form: **I know** (nicht: I'm knowing).",
      },
    ],
    exercises: [
      { type: "gap", sentence: "Be quiet, please. The baby ___ (sleep).", answers: ["is sleeping", "'s sleeping"], explanation: "Gerade jetzt → is + -ing." },
      { type: "choice", sentence: "I ___ coffee every morning.", options: ["am drinking", "drink", "drinking", "drinks"], answer: 1, explanation: "Gewohnheit (every morning) → Simple Present." },
      { type: "choice", sentence: "Where is Tom? – He ___ in the garden.", options: ["works", "work", "is working", "working"], answer: 2, explanation: "Was er gerade tut → Progressive." },
      { type: "gap", sentence: "I ___ (understand) what you mean.", answers: ["understand"], explanation: "understand steht nicht in der -ing-Form." },
      {
        type: "order",
        words: ["We", "are", "staying", "with", "friends", "this", "week"],
        translation: "Wir wohnen diese Woche bei Freunden.",
        explanation: "Vorübergehende Situation → Progressive.",
      },
    ],
  },
  {
    slug: "past-simple",
    level: 1,
    title: "Simple Past",
    subtitle: "Abgeschlossenes in der Vergangenheit",
    blocks: [
      {
        kind: "text",
        text: "Mit dem **Simple Past** erzählst du, was zu einem bestimmten Zeitpunkt in der Vergangenheit passiert ist – zum Beispiel gestern oder im letzten Urlaub.",
      },
      {
        kind: "rule",
        title: "Regelmäßige Verben",
        text: "Einfach **-ed** anhängen: **work → worked, visit → visited, stop → stopped**. Die Form ist für alle Personen gleich.",
      },
      {
        kind: "rule",
        title: "Unregelmäßige Verben",
        text: "Viele häufige Verben sind unregelmäßig und müssen gelernt werden: **go → went, see → saw, have → had, buy → bought, eat → ate, take → took, meet → met**.",
      },
      {
        kind: "rule",
        title: "Verneinung und Fragen",
        text: "Mit **didn't / did** – und danach wieder die **Grundform**: **I didn't go. Did you see it?** (nicht: Did you saw)",
      },
      {
        kind: "examples",
        items: [
          { en: "We visited my aunt yesterday.", de: "Wir haben gestern meine Tante besucht." },
          { en: "I went to the market last Saturday.", de: "Ich war letzten Samstag auf dem Markt." },
          { en: "Did you enjoy the concert?", de: "Hat dir das Konzert gefallen?" },
        ],
      },
      {
        kind: "tip",
        text: "Signalwörter: **yesterday, last week, two days ago, in 2010, when I was young**. Achtung: Wo wir im Deutschen oft „habe … gemacht“ sagen, steht im Englischen das Simple Past!",
      },
    ],
    exercises: [
      { type: "gap", sentence: "I ___ (go) to the cinema yesterday.", answers: ["went"], explanation: "go → went (unregelmäßig)." },
      { type: "gap", sentence: "We ___ (visit) Scotland two years ago.", answers: ["visited"], explanation: "Regelmäßig: visit + -ed." },
      { type: "choice", sentence: "Did you ___ the email?", options: ["saw", "see", "seen", "seeing"], answer: 1, explanation: "Nach did steht die Grundform." },
      { type: "gap", sentence: "She ___ (not / buy) the dress.", answers: ["didn't buy", "did not buy"], explanation: "Verneinung: didn't + Grundform." },
      {
        type: "order",
        words: ["We", "met", "our", "friends", "last", "night"],
        translation: "Wir haben gestern Abend unsere Freunde getroffen.",
        explanation: "meet → met; Zeitangabe am Satzende.",
      },
    ],
  },
  {
    slug: "prepositions-time",
    level: 1,
    title: "in, on, at",
    subtitle: "Präpositionen der Zeit",
    blocks: [
      {
        kind: "text",
        text: "Bei Zeitangaben benutzt das Englische drei kleine Wörter. Eine einfache Eselsbrücke: von **groß (in)** über **mittel (on)** bis **genau (at)**.",
      },
      {
        kind: "rule",
        title: "in – längere Zeiträume",
        text: "Monate, Jahre, Jahreszeiten, Tageszeiten: **in May, in 1985, in summer, in the morning, in the evening**.",
      },
      {
        kind: "rule",
        title: "on – Tage",
        text: "Wochentage und Daten: **on Monday, on 3rd May, on my birthday, on Christmas Day, on Sunday morning**.",
      },
      {
        kind: "rule",
        title: "at – genaue Zeitpunkte",
        text: "Uhrzeiten und feste Ausdrücke: **at 8 o'clock, at noon, at night, at the weekend (britisch), at Christmas**.",
      },
      {
        kind: "tip",
        text: "Vor **this, next, last, every** steht gar keine Präposition: **I'll call you next Monday.** (nicht: on next Monday)",
      },
    ],
    exercises: [
      { type: "gap", sentence: "My birthday is ___ June.", answers: ["in"], explanation: "Monate → in." },
      { type: "gap", sentence: "The shop closes ___ 6 o'clock.", answers: ["at"], explanation: "Uhrzeit → at." },
      { type: "gap", sentence: "We always have a big lunch ___ Sunday.", answers: ["on"], explanation: "Wochentag → on." },
      { type: "choice", sentence: "I'll see you ___ next week.", options: ["in", "on", "at", "–"], answer: 3, explanation: "Vor next steht keine Präposition." },
      { type: "choice", sentence: "I like to read ___ the evening.", options: ["in", "on", "at", "by"], answer: 0, explanation: "Tageszeit → in the evening (aber: at night)." },
    ],
  },
  {
    slug: "questions",
    level: 1,
    title: "Fragen stellen",
    subtitle: "Mit do, does, did und Fragewörtern",
    blocks: [
      {
        kind: "text",
        text: "Im Deutschen stellen wir einfach das Verb nach vorne („Magst du …?“). Im Englischen brauchst du dafür meist ein **Hilfsverb**.",
      },
      {
        kind: "rule",
        title: "Die Satzstellung",
        text: "**(Fragewort) + Hilfsverb + Subjekt + Verb**: **Where do you live? What did she say? How often does he call?**",
      },
      {
        kind: "rule",
        title: "Ohne do: bei be, can und Co.",
        text: "Mit **am/is/are, was/were, can, will, have got** brauchst du kein do – nur umstellen: **Are you tired? Can you help me? Was it nice?**",
      },
      {
        kind: "examples",
        items: [
          { en: "What do you do?", de: "Was machst du beruflich?" },
          { en: "How long did you stay?", de: "Wie lange bist du geblieben?" },
          { en: "Where can I buy tickets?", de: "Wo kann ich Fahrkarten kaufen?" },
          { en: "Who called you?", de: "Wer hat dich angerufen?" },
        ],
      },
      {
        kind: "tip",
        text: "Fragewörter: **what** (was), **where** (wo), **when** (wann), **why** (warum), **who** (wer), **how** (wie), **how much / how many** (wie viel / wie viele).",
      },
    ],
    exercises: [
      { type: "choice", sentence: "Where ___ you live?", options: ["are", "do", "does", "is"], answer: 1, explanation: "Frage mit Vollverb live → do." },
      { type: "choice", sentence: "___ you tired?", options: ["Do", "Are", "Does", "Have"], answer: 1, explanation: "Mit be kein do: Are you …?" },
      { type: "gap", sentence: "What ___ you have for breakfast this morning?", answers: ["did"], explanation: "Vergangenheit → did." },
      { type: "gap", sentence: "How often ___ your son visit you?", answers: ["does"], explanation: "your son = he → does." },
      {
        type: "order",
        words: ["When", "did", "you", "arrive", "in", "London"],
        translation: "Wann bist du in London angekommen?",
        explanation: "Fragewort + did + Subjekt + Grundform.",
      },
    ],
  },

  /* ------------------------------------------------------------------ Stufe 2 */
  {
    slug: "present-perfect",
    level: 2,
    title: "Present Perfect",
    subtitle: "Die Brücke zwischen Vergangenheit und Jetzt",
    blocks: [
      {
        kind: "text",
        text: "Das **Present Perfect** sieht aus wie das deutsche Perfekt, wird aber anders benutzt: Es verbindet die Vergangenheit mit der **Gegenwart**. Wann genau etwas passiert ist, ist dabei unwichtig.",
      },
      {
        kind: "rule",
        title: "So wird es gebildet",
        text: "**have / has + 3. Verbform**: **I have seen, she has finished, we have been**. Kurz: **I've, she's, we've**.",
      },
      {
        kind: "rule",
        title: "Wann benutze ich es?",
        text: "1. **Erfahrungen im Leben**: I've been to Rome. 2. **Ergebnis ist jetzt wichtig**: I've lost my keys (ich finde sie nicht). 3. **Etwas dauert bis jetzt an**: We've lived here for 20 years.",
      },
      {
        kind: "rule",
        title: "for und since",
        text: "**for** + Zeitraum (for ten years, for a week). **since** + Zeitpunkt (since 2005, since Monday). Beide heißen auf Deutsch oft „seit“!",
      },
      {
        kind: "tip",
        text: "Signalwörter: **ever, never, already, yet, just, so far, for, since**. „Ich wohne seit 20 Jahren hier“ heißt **I have lived here for 20 years** – nicht „I live here since …“.",
      },
    ],
    exercises: [
      { type: "gap", sentence: "I ___ (never / be) to America.", answers: ["have never been", "'ve never been"], explanation: "Lebenserfahrung → have never been." },
      { type: "choice", sentence: "We have known each other ___ 30 years.", options: ["since", "for", "ago", "from"], answer: 1, explanation: "Zeitraum → for." },
      { type: "choice", sentence: "She has worked here ___ 2019.", options: ["for", "since", "ago", "in"], answer: 1, explanation: "Zeitpunkt → since." },
      { type: "gap", sentence: "Have you ___ (finish) the book yet?", answers: ["finished"], explanation: "3. Form: finished." },
      {
        type: "order",
        words: ["I", "have", "just", "made", "some", "tea"],
        translation: "Ich habe gerade Tee gemacht.",
        explanation: "just steht zwischen have und der 3. Form.",
      },
    ],
  },
  {
    slug: "perfect-vs-past",
    level: 2,
    title: "Present Perfect oder Simple Past?",
    subtitle: "Die häufigste Stolperfalle für Deutschsprachige",
    blocks: [
      {
        kind: "text",
        text: "Die Grundfrage lautet: **Wird ein abgeschlossener Zeitpunkt genannt oder gemeint?** Dann Simple Past. Geht es um das Ergebnis oder Erfahrungen bis heute? Dann Present Perfect.",
      },
      {
        kind: "rule",
        title: "Simple Past – „Wann?“ ist klar",
        text: "**I saw that film last week. She called me yesterday. We met in 1982.** Auch beim Erzählen von Geschichten.",
      },
      {
        kind: "rule",
        title: "Present Perfect – kein fester Zeitpunkt",
        text: "**I've seen that film** (irgendwann, ich kenne ihn). **She has called three times today** (der Tag ist noch nicht vorbei).",
      },
      {
        kind: "examples",
        items: [
          { en: "Have you ever been to Ireland? – Yes, I went there in 2018.", de: "Warst du schon mal in Irland? – Ja, 2018." },
          { en: "I've lost my glasses. I lost them at the station.", de: "Ich habe meine Brille verloren. Ich habe sie am Bahnhof verloren." },
        ],
      },
      {
        kind: "tip",
        text: "Typisches Muster im Gespräch: Man **beginnt mit dem Present Perfect** (Have you ever …?) und **erzählt dann im Simple Past** weiter (Yes, we went there …).",
      },
    ],
    exercises: [
      { type: "choice", sentence: "I ___ him yesterday.", options: ["have seen", "saw", "have saw", "see"], answer: 1, explanation: "yesterday → Simple Past." },
      { type: "choice", sentence: "___ you ever tried Indian food?", options: ["Did", "Have", "Do", "Were"], answer: 1, explanation: "ever / Erfahrung → Present Perfect." },
      { type: "gap", sentence: "We ___ (move) here in 1995.", answers: ["moved"], explanation: "in 1995 = abgeschlossener Zeitpunkt → Simple Past." },
      { type: "gap", sentence: "Oh no! I ___ (forget) my umbrella.", answers: ["have forgotten", "'ve forgotten"], explanation: "Ergebnis jetzt wichtig → Present Perfect." },
      { type: "choice", sentence: "When ___ you start learning English?", options: ["have", "did", "has", "do"], answer: 1, explanation: "Frage mit when → Simple Past." },
    ],
  },
  {
    slug: "future",
    level: 2,
    title: "will oder going to?",
    subtitle: "Über die Zukunft sprechen",
    blocks: [
      {
        kind: "text",
        text: "Für die Zukunft gibt es im Englischen mehrere Formen. Die zwei wichtigsten sind **will** und **going to**.",
      },
      {
        kind: "rule",
        title: "going to – Pläne und klare Anzeichen",
        text: "Etwas ist schon **geplant** oder man **sieht es kommen**: **We're going to visit my sister in May. Look at the sky – it's going to rain.**",
      },
      {
        kind: "rule",
        title: "will – spontane Entscheidungen, Angebote, Vermutungen",
        text: "**The phone is ringing – I'll get it! I think you'll like the book. I'll help you with that.**",
      },
      {
        kind: "rule",
        title: "Present Progressive – feste Termine",
        text: "Für verabredete Termine: **I'm meeting Anna on Friday. We're flying to Spain tomorrow.**",
      },
      {
        kind: "tip",
        text: "Achtung, False Friend: **I will** heißt „ich werde“ – nicht „ich will“! „Ich will“ heißt **I want to**.",
      },
    ],
    exercises: [
      { type: "choice", sentence: "We've booked the tickets. We ___ see the musical.", options: ["will", "are going to", "go", "would"], answer: 1, explanation: "Bereits geplant → going to." },
      { type: "choice", sentence: "That bag looks heavy. I ___ carry it for you.", options: ["'ll", "'m going to", "am", "would"], answer: 0, explanation: "Spontanes Angebot → will." },
      { type: "choice", sentence: "„Ich will ein Eis.“ =", options: ["I will an ice cream.", "I want an ice cream.", "I would ice cream.", "I go to ice cream."], answer: 1, explanation: "wollen = want." },
      { type: "gap", sentence: "I think it ___ be a lovely evening.", answers: ["will", "'ll"], explanation: "Vermutung → will." },
      {
        type: "order",
        words: ["I'm", "meeting", "my", "sister", "on", "Friday"],
        translation: "Ich treffe meine Schwester am Freitag.",
        explanation: "Fester Termin → Present Progressive.",
      },
    ],
  },
  {
    slug: "comparison",
    level: 2,
    title: "Vergleiche",
    subtitle: "bigger, more beautiful, as … as",
    blocks: [
      {
        kind: "rule",
        title: "Kurze Adjektive: -er / -est",
        text: "Einsilbige (und zweisilbige auf -y) Adjektive: **old → older → the oldest, big → bigger → the biggest, happy → happier → the happiest**.",
      },
      {
        kind: "rule",
        title: "Lange Adjektive: more / most",
        text: "**beautiful → more beautiful → the most beautiful, interesting → more interesting**.",
      },
      {
        kind: "rule",
        title: "Unregelmäßig",
        text: "**good → better → the best, bad → worse → the worst, far → further → the furthest**.",
      },
      {
        kind: "rule",
        title: "than und as … as",
        text: "„als“ heißt **than**: **She is older than me.** Gleichheit: **as … as**: **It's as cold as yesterday. It isn't as expensive as I thought.**",
      },
      {
        kind: "tip",
        text: "Häufiger Fehler: „more better“ gibt es nicht – nur **better**. Und „als“ ist nicht „as“: **bigger than**, nicht „bigger as“.",
      },
    ],
    exercises: [
      { type: "gap", sentence: "London is ___ (big) than Manchester.", answers: ["bigger"], explanation: "big → bigger (Konsonant verdoppelt)." },
      { type: "gap", sentence: "This is the ___ (good) cake I've ever eaten!", answers: ["best"], explanation: "good → better → best." },
      { type: "choice", sentence: "The film was more exciting ___ the book.", options: ["as", "than", "then", "like"], answer: 1, explanation: "als = than." },
      { type: "choice", sentence: "My garden is not ___ big as yours.", options: ["so", "as", "more", "than"], answer: 1, explanation: "Vergleich der Gleichheit: as … as." },
      { type: "gap", sentence: "Italian is ___ (easy) than German, I think.", answers: ["easier"], explanation: "-y wird zu -ier: easier." },
    ],
  },
  {
    slug: "opinions",
    level: 2,
    title: "Meinungen ausdrücken",
    subtitle: "Zustimmen, widersprechen, höflich bleiben",
    blocks: [
      {
        kind: "text",
        text: "In englischen Gesprächen wird oft etwas **weicher und höflicher** formuliert als im Deutschen. Ein paar feste Wendungen helfen sehr.",
      },
      {
        kind: "rule",
        title: "Meinung sagen",
        text: "**I think … / In my opinion, … / I feel that … / If you ask me, … / Personally, I …**",
      },
      {
        kind: "rule",
        title: "Zustimmen und widersprechen",
        text: "Zustimmen: **I agree. / Absolutely. / That's true.** Höflich widersprechen: **I'm not so sure. / I see your point, but … / I don't really agree.**",
      },
      {
        kind: "rule",
        title: "Verneinung beim Meinen",
        text: "Im Englischen wird das **think** verneint: **I don't think it's a good idea.** (statt: I think it's not a good idea – das klingt sehr direkt)",
      },
      {
        kind: "tip",
        text: "Achtung: „Ich bin einverstanden / Ich stimme zu“ heißt **I agree** – nicht „I am agree“.",
      },
    ],
    exercises: [
      { type: "choice", sentence: "„Ich stimme dir zu.“ =", options: ["I am agree with you.", "I agree with you.", "I agree you.", "I give you right."], answer: 1, explanation: "agree ist ein Verb: I agree with you." },
      { type: "choice", sentence: "Which sounds most natural?", options: ["I think it's not true.", "I don't think it's true.", "I think not it's true.", "I not think it's true."], answer: 1, explanation: "Im Englischen verneint man think." },
      { type: "gap", sentence: "In my ___, the old town is the nicest part.", answers: ["opinion"], explanation: "in my opinion = meiner Meinung nach." },
      { type: "gap", sentence: "I see your ___, but I think it's too expensive.", answers: ["point"], explanation: "I see your point = Ich verstehe, was du meinst." },
      {
        type: "order",
        words: ["I'm", "not", "so", "sure", "about", "that"],
        translation: "Da bin ich mir nicht so sicher.",
        explanation: "Höflich widersprechen.",
      },
    ],
  },

  /* ------------------------------------------------------------------ Stufe 3 */
  {
    slug: "conditionals",
    level: 3,
    title: "If-Sätze Typ 1 & 2",
    subtitle: "Was passiert, wenn …",
    blocks: [
      {
        kind: "rule",
        title: "Typ 1 – realistisch / möglich",
        text: "**If + Simple Present, … will + Grundform**: **If it rains tomorrow, we will stay at home.** Im if-Teil steht **nie will**!",
      },
      {
        kind: "rule",
        title: "Typ 2 – unwahrscheinlich / gedacht",
        text: "**If + Simple Past, … would + Grundform**: **If I had more time, I would learn Spanish.** (Ich habe aber keine Zeit.)",
      },
      {
        kind: "rule",
        title: "If I were you …",
        text: "Für Ratschläge: **If I were you, I would call her.** (Wenn ich du wäre …) – auch bei I/he/she ist **were** stilistisch am schönsten.",
      },
      {
        kind: "examples",
        items: [
          { en: "If you need help, I'll come over.", de: "Wenn du Hilfe brauchst, komme ich vorbei." },
          { en: "If we lived by the sea, I would swim every day.", de: "Wenn wir am Meer wohnten, würde ich jeden Tag schwimmen." },
        ],
      },
      {
        kind: "tip",
        text: "Der häufigste Fehler: „If I would have …“. Im if-Teil steht **kein would**: **If I had** …, **I would** …",
      },
    ],
    exercises: [
      { type: "gap", sentence: "If it ___ (be) sunny tomorrow, we'll have a picnic.", answers: ["is"], explanation: "Typ 1: if + Simple Present." },
      { type: "choice", sentence: "If I won the lottery, I ___ a house in Cornwall.", options: ["will buy", "would buy", "buy", "bought"], answer: 1, explanation: "Typ 2: would + Grundform." },
      { type: "choice", sentence: "If I ___ you, I would take the train.", options: ["am", "would be", "were", "will be"], answer: 2, explanation: "If I were you …" },
      { type: "gap", sentence: "If she ___ (have) more time, she would read more.", answers: ["had"], explanation: "Typ 2: if + Simple Past." },
      {
        type: "order",
        words: ["If", "you", "call", "me", "I", "will", "pick", "you", "up"],
        translation: "Wenn du mich anrufst, hole ich dich ab.",
        explanation: "Typ 1: if + Present, will + Grundform.",
      },
    ],
  },
  {
    slug: "passive",
    level: 3,
    title: "Das Passiv",
    subtitle: "Wenn die Handlung wichtiger ist als die Person",
    blocks: [
      {
        kind: "text",
        text: "Das Passiv benutzt man, wenn es egal oder unbekannt ist, **wer** etwas tut – oder wenn die Sache selbst im Mittelpunkt steht. In Zeitungen und Nachrichten ist es sehr häufig.",
      },
      {
        kind: "rule",
        title: "So wird es gebildet",
        text: "**Form von be + 3. Verbform**. Gegenwart: **English is spoken here.** Vergangenheit: **The castle was built in 1250.** Present Perfect: **The window has been repaired.**",
      },
      {
        kind: "rule",
        title: "Wer hat es getan? → by",
        text: "**The book was written by Jane Austen.** (von Jane Austen)",
      },
      {
        kind: "examples",
        items: [
          { en: "The museum is visited by thousands of people every year.", de: "Das Museum wird jedes Jahr von Tausenden besucht." },
          { en: "My bike was stolen last night.", de: "Mein Fahrrad wurde letzte Nacht gestohlen." },
          { en: "Dinner will be served at 7.", de: "Das Abendessen wird um 7 serviert." },
        ],
      },
      {
        kind: "tip",
        text: "Deutsches „wurde“ entspricht meist **was/were + 3. Form**. Deutsches „man“ wird oft zum Passiv: „Man spricht hier Englisch“ → **English is spoken here.**",
      },
    ],
    exercises: [
      { type: "gap", sentence: "The letters ___ (deliver) every morning.", answers: ["are delivered"], explanation: "Gegenwart Plural: are + 3. Form." },
      { type: "gap", sentence: "This house ___ (build) in 1920.", answers: ["was built"], explanation: "Vergangenheit: was + built." },
      { type: "choice", sentence: "The Mona Lisa was painted ___ Leonardo da Vinci.", options: ["from", "of", "by", "with"], answer: 2, explanation: "Urheber im Passiv → by." },
      { type: "choice", sentence: "„Man hat das Problem gelöst.“ =", options: ["Man has solved the problem.", "The problem has been solved.", "The problem has solved.", "The problem is solving."], answer: 1, explanation: "„man“ → Passiv: has been solved." },
      {
        type: "order",
        words: ["Breakfast", "is", "served", "from", "7", "to", "10"],
        translation: "Frühstück wird von 7 bis 10 serviert.",
        explanation: "is + served.",
      },
    ],
  },
  {
    slug: "relative-clauses",
    level: 3,
    title: "Relativsätze",
    subtitle: "who, which, that und whose",
    blocks: [
      {
        kind: "text",
        text: "Mit Relativsätzen verbindest du zwei Informationen elegant zu einem Satz – wie im Deutschen mit „der, die, das“.",
      },
      {
        kind: "rule",
        title: "who – für Personen",
        text: "**The woman who lives next door is a nurse.**",
      },
      {
        kind: "rule",
        title: "which – für Dinge und Tiere",
        text: "**The book which I'm reading is very exciting.**",
      },
      {
        kind: "rule",
        title: "that – für beides (umgangssprachlich)",
        text: "**The man that I met … / The car that he bought …** – sehr häufig im gesprochenen Englisch.",
      },
      {
        kind: "rule",
        title: "whose – dessen / deren",
        text: "**That's the neighbour whose dog barks all night.**",
      },
      {
        kind: "tip",
        text: "Ist das Relativpronomen das **Objekt**, darf man es weglassen: **The book (that) I'm reading …** – das klingt sehr natürlich.",
      },
    ],
    exercises: [
      { type: "choice", sentence: "The doctor ___ helped me was very kind.", options: ["which", "who", "whose", "what"], answer: 1, explanation: "Person → who." },
      { type: "choice", sentence: "This is the cake ___ my mother always made.", options: ["who", "which", "whose", "where"], answer: 1, explanation: "Ding → which (oder that)." },
      { type: "choice", sentence: "I have a friend ___ son lives in Canada.", options: ["who", "which", "whose", "that"], answer: 2, explanation: "dessen → whose." },
      { type: "gap", sentence: "The film ___ we watched yesterday was boring.", answers: ["that", "which"], explanation: "that oder which – im Gespräch wird es hier oft sogar ganz weggelassen." },
      {
        type: "order",
        words: ["The", "man", "who", "called", "you", "is", "my", "uncle"],
        translation: "Der Mann, der dich angerufen hat, ist mein Onkel.",
        explanation: "Person → who.",
      },
    ],
  },
  {
    slug: "reported-speech",
    level: 3,
    title: "Indirekte Rede",
    subtitle: "Wiedergeben, was jemand gesagt hat",
    blocks: [
      {
        kind: "text",
        text: "Wenn du erzählst, was jemand gesagt hat, rückt die Zeit im Englischen meist **einen Schritt in die Vergangenheit** (Backshift), wenn das Einleitungsverb in der Vergangenheit steht (said, told).",
      },
      {
        kind: "rule",
        title: "Die Zeitverschiebung",
        text: "**am/is → was, are → were, Present → Past, will → would, can → could, Past / Present Perfect → had + 3. Form**.",
      },
      {
        kind: "examples",
        items: [
          { en: "\"I'm tired.\" → She said (that) she was tired.", de: "Sie sagte, sie sei müde." },
          { en: "\"I will call you.\" → He said he would call me.", de: "Er sagte, er würde mich anrufen." },
          { en: "\"We can't come.\" → They told us they couldn't come.", de: "Sie sagten uns, sie könnten nicht kommen." },
        ],
      },
      {
        kind: "rule",
        title: "say oder tell?",
        text: "**tell** braucht immer eine Person: **She told me … ** **say** steht ohne Person (oder mit „to“): **She said (to me) …**",
      },
      {
        kind: "tip",
        text: "Fragen werden zu Aussagesätzen: \"Where do you live?\" → **She asked me where I lived.** (nicht: where did I live)",
      },
    ],
    exercises: [
      { type: "gap", sentence: "\"I am hungry.\" → He said he ___ hungry.", answers: ["was"], explanation: "am → was." },
      { type: "gap", sentence: "\"I will help you.\" → She said she ___ help me.", answers: ["would"], explanation: "will → would." },
      { type: "choice", sentence: "She ___ me that she was moving to Spain.", options: ["said", "told", "says", "spoke"], answer: 1, explanation: "Mit Person (me) → told." },
      { type: "choice", sentence: "\"Where do you work?\" → He asked me where ___.", options: ["did I work", "I worked", "do I work", "I work did"], answer: 1, explanation: "Indirekte Frage = Aussagesatzstellung." },
      { type: "gap", sentence: "\"I can swim.\" → My grandson said he ___ swim.", answers: ["could"], explanation: "can → could." },
    ],
  },

  /* ------------------------------------------------------------------ Stufe 4 */
  {
    slug: "third-conditional",
    level: 4,
    title: "If-Sätze Typ 3 & Bedauern",
    subtitle: "would have, should have, could have",
    blocks: [
      {
        kind: "text",
        text: "Mit diesen Formen sprichst du über eine Vergangenheit, die **anders hätte sein können** – über Bedauern, Erleichterung oder verpasste Chancen.",
      },
      {
        kind: "rule",
        title: "Typ 3",
        text: "**If + had + 3. Form, … would have + 3. Form**: **If we had left earlier, we would have caught the train.** (Sind wir aber nicht.)",
      },
      {
        kind: "rule",
        title: "should have / could have",
        text: "**I should have called her.** (Ich hätte sie anrufen sollen.) **You could have asked me!** (Du hättest mich fragen können!)",
      },
      {
        kind: "rule",
        title: "I wish …",
        text: "Bedauern über die Gegenwart: **I wish I had more time.** Über die Vergangenheit: **I wish I had learned English earlier.**",
      },
      {
        kind: "tip",
        text: "Gesprochen klingt **would have** oft wie „would’ve“ und **should have** wie „should’ve“. Geschrieben wird es aber nie „would of“!",
      },
    ],
    exercises: [
      { type: "gap", sentence: "If I had known, I ___ (come) earlier.", answers: ["would have come", "would've come"], explanation: "Typ 3: would have + 3. Form." },
      { type: "choice", sentence: "If she ___ the bus, she would have been on time.", options: ["didn't miss", "hadn't missed", "wouldn't miss", "hasn't missed"], answer: 1, explanation: "Typ 3: if + had + 3. Form." },
      { type: "choice", sentence: "„Ich hätte mehr üben sollen.“ =", options: ["I should practise more.", "I should have practised more.", "I would practise more.", "I had practised more."], answer: 1, explanation: "should have + 3. Form." },
      { type: "gap", sentence: "I wish I ___ (learn) to play the piano as a child.", answers: ["had learned", "had learnt", "'d learned", "'d learnt"], explanation: "Bedauern über Vergangenes: wish + had + 3. Form." },
      {
        type: "order",
        words: ["You", "could", "have", "told", "me", "earlier"],
        translation: "Du hättest es mir früher sagen können.",
        explanation: "could have + 3. Form.",
      },
    ],
  },
  {
    slug: "used-to",
    level: 4,
    title: "used to, be used to, get used to",
    subtitle: "Drei Formen, die sich zum Verwechseln ähnlich sehen",
    blocks: [
      {
        kind: "rule",
        title: "used to + Grundform – früher",
        text: "Etwas war früher so, ist es heute aber nicht mehr: **I used to live in Munich. We used to go camping every summer.**",
      },
      {
        kind: "rule",
        title: "be used to + -ing – gewohnt sein",
        text: "**I'm used to getting up early.** (Ich bin es gewohnt.) Danach steht ein Nomen oder ein Verb mit **-ing**!",
      },
      {
        kind: "rule",
        title: "get used to + -ing – sich gewöhnen",
        text: "**I'm getting used to driving on the left.** (Ich gewöhne mich gerade daran.)",
      },
      {
        kind: "examples",
        items: [
          { en: "I didn't use to like olives, but now I love them.", de: "Früher mochte ich keine Oliven, jetzt liebe ich sie." },
          { en: "She isn't used to the cold weather yet.", de: "Sie ist das kalte Wetter noch nicht gewohnt." },
        ],
      },
      {
        kind: "tip",
        text: "Verneinung und Frage bei „früher“: **didn't use to / Did you use to …?** (ohne d)",
      },
    ],
    exercises: [
      { type: "gap", sentence: "When I was young, I ___ (früher) play tennis.", answers: ["used to"], explanation: "Früher → used to + Grundform." },
      { type: "choice", sentence: "I'm used to ___ in a big city.", options: ["live", "living", "lived", "lives"], answer: 1, explanation: "be used to + -ing." },
      { type: "choice", sentence: "It took me months to ___ the new job.", options: ["get used to", "use to", "used to", "be use to"], answer: 0, explanation: "sich gewöhnen → get used to." },
      { type: "choice", sentence: "Did you ___ have a dog?", options: ["used to", "use to", "using to", "be used to"], answer: 1, explanation: "Frage: Did you use to …?" },
      {
        type: "order",
        words: ["We", "used", "to", "spend", "every", "summer", "at", "the", "lake"],
        translation: "Früher haben wir jeden Sommer am See verbracht.",
        explanation: "used to + Grundform.",
      },
    ],
  },
  {
    slug: "false-friends",
    level: 4,
    title: "False Friends",
    subtitle: "Wörter, die deutsch aussehen – aber etwas anderes bedeuten",
    blocks: [
      {
        kind: "text",
        text: "Manche englische Wörter sehen deutschen Wörtern zum Verwechseln ähnlich – meinen aber etwas ganz anderes. Diese hier sind die tückischsten.",
      },
      {
        kind: "examples",
        items: [
          { en: "become = werden", de: "bekommen = get / receive" },
          { en: "eventually = schließlich", de: "eventuell = possibly / maybe" },
          { en: "actually = eigentlich, tatsächlich", de: "aktuell = current / up to date" },
          { en: "gift = Geschenk", de: "Gift = poison" },
          { en: "chef = Koch / Köchin", de: "Chef = boss" },
          { en: "sensible = vernünftig", de: "sensibel = sensitive" },
          { en: "handy = praktisch", de: "Handy = mobile phone" },
          { en: "brave = mutig", de: "brav = good, well-behaved" },
        ],
      },
      {
        kind: "tip",
        text: "Ein Klassiker im Restaurant: „Can I become a steak?“ bedeutet „Kann ich ein Steak werden?“ – richtig ist **Could I have / get a steak, please?**",
      },
    ],
    exercises: [
      { type: "choice", sentence: "„Ich habe ein Paket bekommen.“ =", options: ["I have become a parcel.", "I got a parcel.", "I became a parcel.", "I have a parcel become."], answer: 1, explanation: "bekommen = get / receive." },
      { type: "choice", sentence: "My son wants to ___ a doctor.", options: ["become", "get", "receive", "will"], answer: 0, explanation: "werden = become." },
      { type: "choice", sentence: "„Wir kommen eventuell später.“ =", options: ["We'll eventually come later.", "We might come later.", "We actually come later.", "We come eventual later."], answer: 1, explanation: "eventuell = maybe / might." },
      { type: "gap", sentence: "That's a very ___ (vernünftig) decision.", answers: ["sensible"], explanation: "vernünftig = sensible (sensibel = sensitive)." },
      { type: "choice", sentence: "„Was ist der aktuelle Stand?“ =", options: ["What's the actual status?", "What's the current status?", "What's the eventual status?", "What's the actually status?"], answer: 1, explanation: "aktuell = current." },
    ],
  },
  {
    slug: "idioms",
    level: 4,
    title: "Idioms im Alltag",
    subtitle: "Redewendungen, die Muttersprachler wirklich benutzen",
    blocks: [
      {
        kind: "text",
        text: "Idioms machen dein Englisch lebendig. Wörtlich übersetzt ergeben sie oft keinen Sinn – man lernt sie am besten als **ganze Ausdrücke** mit einem Beispielsatz.",
      },
      {
        kind: "examples",
        items: [
          { en: "It's a piece of cake.", de: "Das ist ein Kinderspiel." },
          { en: "I'm feeling under the weather.", de: "Ich bin etwas angeschlagen." },
          { en: "Let's call it a day.", de: "Lass uns für heute Schluss machen." },
          { en: "We see each other once in a blue moon.", de: "Wir sehen uns alle Jubeljahre." },
          { en: "You hit the nail on the head.", de: "Du hast den Nagel auf den Kopf getroffen." },
          { en: "It's not my cup of tea.", de: "Das ist nicht so mein Ding." },
          { en: "I'm all ears.", de: "Ich bin ganz Ohr." },
        ],
      },
      {
        kind: "tip",
        text: "Speichere Idioms, die dir gefallen, im Vokabelkasten – und probiere eins davon im nächsten Gespräch mit dem Sprachtrainer aus.",
      },
    ],
    exercises: [
      { type: "choice", sentence: "The exam was a piece of ___.", options: ["bread", "cake", "pie", "chocolate"], answer: 1, explanation: "a piece of cake = sehr leicht." },
      { type: "choice", sentence: "I won't come to work today, I'm a bit ___ the weather.", options: ["over", "under", "in", "below"], answer: 1, explanation: "under the weather = angeschlagen." },
      { type: "gap", sentence: "We've worked for ten hours. Let's call it a ___.", answers: ["day"], explanation: "call it a day = Feierabend machen." },
      { type: "choice", sentence: "„Ich bin ganz Ohr.“ =", options: ["I'm full ear.", "I'm all ears.", "I'm whole ear.", "I hear all."], answer: 1, explanation: "I'm all ears." },
      { type: "gap", sentence: "Jazz isn't really my cup of ___.", answers: ["tea"], explanation: "not my cup of tea = nicht mein Ding." },
    ],
  },
];

export function getLesson(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

export function lessonsForLevel(level: number): Lesson[] {
  return LESSONS.filter((l) => l.level === level);
}
