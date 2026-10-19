/**
 * Unregelmäßige Verben (britisches Englisch).
 * past / pp enthalten alle akzeptierten Formen – die erste ist die gebräuchlichste.
 *
 * Muster:
 * - AAA: alle drei Formen gleich (cut – cut – cut)
 * - ABB: Past Simple und Past Participle gleich (buy – bought – bought)
 * - ABA: Grundform und Past Participle gleich (come – came – come)
 * - ABC: drei verschiedene Formen (go – went – gone)
 */

export type VerbPattern = "AAA" | "ABB" | "ABA" | "ABC";

export interface IrregularVerb {
  inf: string;
  past: string[];
  pp: string[];
  de: string;
  pattern: VerbPattern;
  basic: boolean; // gehört zu den ca. 60 häufigsten
  note?: string;
}

const v = (inf: string, past: string, pp: string, de: string, pattern: VerbPattern, basic = false, note?: string): IrregularVerb => ({
  inf,
  past: past.split("/"),
  pp: pp.split("/"),
  de,
  pattern,
  basic,
  note,
});

export const VERBS: IrregularVerb[] = [
  /* ---------------- AAA ---------------- */
  v("cost", "cost", "cost", "kosten", "AAA", true),
  v("cut", "cut", "cut", "schneiden", "AAA", true),
  v("hit", "hit", "hit", "schlagen, treffen", "AAA"),
  v("hurt", "hurt", "hurt", "verletzen, wehtun", "AAA"),
  v("let", "let", "let", "lassen", "AAA", true),
  v("put", "put", "put", "setzen, stellen, legen", "AAA", true),
  v("set", "set", "set", "setzen, festlegen", "AAA"),
  v("shut", "shut", "shut", "schließen", "AAA"),
  v("spread", "spread", "spread", "verbreiten, ausbreiten", "AAA"),
  v("bet", "bet", "bet", "wetten", "AAA"),
  v("quit", "quit", "quit", "aufhören, kündigen", "AAA"),
  v("upset", "upset", "upset", "aus der Fassung bringen", "AAA"),
  v("read", "read", "read", "lesen", "AAA", true, "Gleiche Schreibung, aber andere Aussprache: read [riːd] – read [red] – read [red]."),

  /* ---------------- ABB ---------------- */
  v("bring", "brought", "brought", "bringen", "ABB", true),
  v("buy", "bought", "bought", "kaufen", "ABB", true),
  v("catch", "caught", "caught", "fangen, erwischen", "ABB", true),
  v("teach", "taught", "taught", "unterrichten, beibringen", "ABB", true),
  v("think", "thought", "thought", "denken, glauben", "ABB", true),
  v("fight", "fought", "fought", "kämpfen, streiten", "ABB"),
  v("build", "built", "built", "bauen", "ABB", true),
  v("lend", "lent", "lent", "(ver)leihen", "ABB"),
  v("send", "sent", "sent", "schicken", "ABB", true),
  v("spend", "spent", "spent", "ausgeben, verbringen", "ABB", true),
  v("bend", "bent", "bent", "biegen, beugen", "ABB"),
  v("feel", "felt", "felt", "fühlen", "ABB", true),
  v("keep", "kept", "kept", "behalten, halten", "ABB", true),
  v("sleep", "slept", "slept", "schlafen", "ABB", true),
  v("sweep", "swept", "swept", "fegen", "ABB"),
  v("leave", "left", "left", "verlassen, abfahren", "ABB", true),
  v("meet", "met", "met", "treffen, kennenlernen", "ABB", true),
  v("mean", "meant", "meant", "bedeuten, meinen", "ABB", true),
  v("lose", "lost", "lost", "verlieren", "ABB", true),
  v("sell", "sold", "sold", "verkaufen", "ABB", true),
  v("tell", "told", "told", "erzählen, sagen", "ABB", true),
  v("find", "found", "found", "finden", "ABB", true),
  v("have", "had", "had", "haben", "ABB", true),
  v("hear", "heard", "heard", "hören", "ABB", true),
  v("hold", "held", "held", "halten", "ABB", true),
  v("lay", "laid", "laid", "legen", "ABB", false, "Nicht verwechseln mit lie (liegen): lie – lay – lain."),
  v("pay", "paid", "paid", "bezahlen", "ABB", true),
  v("say", "said", "said", "sagen", "ABB", true),
  v("make", "made", "made", "machen, herstellen", "ABB", true),
  v("stand", "stood", "stood", "stehen", "ABB", true),
  v("understand", "understood", "understood", "verstehen", "ABB", true),
  v("sit", "sat", "sat", "sitzen", "ABB", true),
  v("light", "lit", "lit", "anzünden", "ABB"),
  v("lead", "led", "led", "führen", "ABB"),
  v("feed", "fed", "fed", "füttern", "ABB"),
  v("shoot", "shot", "shot", "schießen", "ABB"),
  v("get", "got", "got", "bekommen, werden", "ABB", true, "Britisch: get – got – got. Im amerikanischen Englisch oft: gotten."),
  v("win", "won", "won", "gewinnen", "ABB", true),
  v("hang", "hung", "hung", "hängen", "ABB"),
  v("stick", "stuck", "stuck", "kleben, stecken bleiben", "ABB"),
  v("dig", "dug", "dug", "graben", "ABB"),
  v("learn", "learnt/learned", "learnt/learned", "lernen", "ABB", true, "Beide Formen sind richtig – britisch oft learnt."),
  v("burn", "burnt/burned", "burnt/burned", "brennen, verbrennen", "ABB"),
  v("dream", "dreamt/dreamed", "dreamt/dreamed", "träumen", "ABB"),
  v("smell", "smelt/smelled", "smelt/smelled", "riechen", "ABB"),
  v("spell", "spelt/spelled", "spelt/spelled", "buchstabieren", "ABB"),
  v("slide", "slid", "slid", "rutschen, gleiten", "ABB"),
  v("swing", "swung", "swung", "schwingen", "ABB"),
  v("seek", "sought", "sought", "suchen", "ABB"),

  /* ---------------- ABA ---------------- */
  v("come", "came", "come", "kommen", "ABA", true),
  v("become", "became", "become", "werden", "ABA", true, "Achtung False Friend: become heißt werden, nicht bekommen!"),
  v("run", "ran", "run", "laufen, rennen", "ABA", true),
  v("overcome", "overcame", "overcome", "überwinden", "ABA"),

  /* ---------------- ABC ---------------- */
  v("be", "was/were", "been", "sein", "ABC", true, "I/he/she/it was – you/we/they were."),
  v("begin", "began", "begun", "beginnen", "ABC", true),
  v("break", "broke", "broken", "(zer)brechen", "ABC", true),
  v("choose", "chose", "chosen", "(aus)wählen", "ABC", true),
  v("do", "did", "done", "tun, machen", "ABC", true),
  v("draw", "drew", "drawn", "zeichnen, ziehen", "ABC"),
  v("drink", "drank", "drunk", "trinken", "ABC", true),
  v("drive", "drove", "driven", "fahren", "ABC", true),
  v("eat", "ate", "eaten", "essen", "ABC", true),
  v("fall", "fell", "fallen", "fallen", "ABC", true),
  v("fly", "flew", "flown", "fliegen", "ABC", true),
  v("forget", "forgot", "forgotten", "vergessen", "ABC", true),
  v("forgive", "forgave", "forgiven", "vergeben, verzeihen", "ABC"),
  v("freeze", "froze", "frozen", "(ge)frieren", "ABC"),
  v("give", "gave", "given", "geben", "ABC", true),
  v("go", "went", "gone", "gehen, fahren", "ABC", true, "Auch: been – I have been to Rome (ich war schon einmal dort)."),
  v("grow", "grew", "grown", "wachsen, anbauen", "ABC", true),
  v("hide", "hid", "hidden", "(sich) verstecken", "ABC"),
  v("know", "knew", "known", "wissen, kennen", "ABC", true),
  v("lie", "lay", "lain", "liegen", "ABC", false, "Nicht verwechseln mit lay (legen) und mit lie – lied – lied (lügen)."),
  v("ride", "rode", "ridden", "reiten, (Rad) fahren", "ABC"),
  v("ring", "rang", "rung", "klingeln, anrufen", "ABC"),
  v("rise", "rose", "risen", "steigen, aufgehen", "ABC"),
  v("see", "saw", "seen", "sehen", "ABC", true),
  v("shake", "shook", "shaken", "schütteln", "ABC"),
  v("show", "showed", "shown/showed", "zeigen", "ABC"),
  v("sing", "sang", "sung", "singen", "ABC"),
  v("sink", "sank", "sunk", "sinken", "ABC"),
  v("speak", "spoke", "spoken", "sprechen", "ABC", true),
  v("steal", "stole", "stolen", "stehlen", "ABC"),
  v("swim", "swam", "swum", "schwimmen", "ABC", true),
  v("take", "took", "taken", "nehmen, bringen", "ABC", true),
  v("tear", "tore", "torn", "(zer)reißen", "ABC"),
  v("throw", "threw", "thrown", "werfen", "ABC"),
  v("wake", "woke", "woken", "aufwachen, wecken", "ABC", true),
  v("wear", "wore", "worn", "tragen (Kleidung)", "ABC", true),
  v("write", "wrote", "written", "schreiben", "ABC", true),
  v("bite", "bit", "bitten", "beißen", "ABC"),
  v("blow", "blew", "blown", "blasen, wehen", "ABC"),
  v("beat", "beat", "beaten", "schlagen, besiegen", "ABC"),
  v("mistake", "mistook", "mistaken", "verwechseln", "ABC"),
];

export const PATTERN_INFO: Record<VerbPattern, { title: string; example: string; text: string }> = {
  AAA: {
    title: "Alle drei Formen gleich",
    example: "cut – cut – cut",
    text: "Die einfachste Gruppe: Grundform, Past Simple und Past Participle sind identisch. Ob Gegenwart oder Vergangenheit, verrät nur der Zusammenhang (I cut / I cut yesterday / I have cut).",
  },
  ABB: {
    title: "Zweite und dritte Form gleich",
    example: "buy – bought – bought",
    text: "Die größte Gruppe. Wer die Vergangenheitsform kennt, kennt automatisch auch das Past Participle. Viele enden auf -ought/-aught, -t oder -d.",
  },
  ABA: {
    title: "Erste und dritte Form gleich",
    example: "come – came – come",
    text: "Eine kleine Gruppe: Nur die Vergangenheitsform weicht ab – das Past Participle sieht aus wie die Grundform (I have come, it has become).",
  },
  ABC: {
    title: "Drei verschiedene Formen",
    example: "go – went – gone",
    text: "Diese Verben muss man als Dreierreihe lernen. Oft hilft der Klang: drink – drank – drunk, sing – sang – sung, swim – swam – swum (i – a – u).",
  },
};

export function getVerb(inf: string): IrregularVerb | undefined {
  return VERBS.find((verb) => verb.inf === inf);
}
