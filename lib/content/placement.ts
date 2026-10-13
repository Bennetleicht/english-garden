/** Kurzer Einstufungstest – 16 Fragen, von leicht nach anspruchsvoll. */

export interface PlacementQuestion {
  level: number;
  sentence: string;
  options: string[];
  answer: number;
}

export const PLACEMENT: PlacementQuestion[] = [
  { level: 1, sentence: "My sister ___ in Berlin.", options: ["live", "lives", "living", "is live"], answer: 1 },
  { level: 1, sentence: "___ you like coffee?", options: ["Are", "Does", "Do", "Is"], answer: 2 },
  { level: 1, sentence: "We ___ to Italy last summer.", options: ["go", "goes", "have gone", "went"], answer: 3 },
  { level: 1, sentence: "The meeting is ___ Monday.", options: ["in", "on", "at", "by"], answer: 1 },
  { level: 2, sentence: "I ___ never ___ to Australia.", options: ["have / been", "did / go", "was / be", "am / going"], answer: 0 },
  { level: 2, sentence: "She has lived here ___ 2015.", options: ["for", "since", "ago", "from"], answer: 1 },
  { level: 2, sentence: "Look at those clouds! It ___ rain.", options: ["will", "is going to", "goes", "would"], answer: 1 },
  { level: 2, sentence: "This book is ___ than the last one.", options: ["more interesting", "interestinger", "most interesting", "more interestinger"], answer: 0 },
  { level: 3, sentence: "If I ___ more time, I would travel more.", options: ["have", "had", "would have", "will have"], answer: 1 },
  { level: 3, sentence: "The bridge ___ in 1890.", options: ["built", "was built", "has build", "is building"], answer: 1 },
  { level: 3, sentence: "The woman ___ lives next door is a doctor.", options: ["which", "who", "whose", "what"], answer: 1 },
  { level: 3, sentence: "He said that he ___ tired.", options: ["is being", "were", "was", "has"], answer: 2 },
  { level: 4, sentence: "If we had left earlier, we ___ the train.", options: ["would catch", "had caught", "would have caught", "will catch"], answer: 2 },
  { level: 4, sentence: "I'm not ___ getting up so early.", options: ["used to", "use to", "used", "using to"], answer: 0 },
  { level: 4, sentence: "\"It's a piece of cake\" means:", options: ["Es ist ein Stück Kuchen.", "Es ist sehr leicht.", "Es ist eine Belohnung.", "Es ist teuer."], answer: 1 },
  { level: 4, sentence: "\"Eventually\" means:", options: ["eventuell", "vielleicht", "schließlich", "ständig"], answer: 2 },
];

/** Empfohlene Stufe: die höchste Stufe, bis zu der jeweils mindestens 3 von 4 Fragen richtig waren. */
export function recommendLevel(correctByLevel: Record<number, number>): number {
  let level = 1;
  for (let l = 1; l <= 4; l++) {
    if ((correctByLevel[l] ?? 0) >= 3) level = Math.min(4, l + 1);
    else break;
  }
  return Math.min(level, 4);
}
