/** Startwortschatz je Stufe. Lässt sich auf der Stufenseite mit einem Klick in den Vokabelkasten legen. */

export interface VocabItem {
  front: string;
  back: string;
  example?: string;
}

export const DECKS: Record<number, { title: string; items: VocabItem[] }> = {
  1: {
    title: "Reise, Familie & Hobbys",
    items: [
      { front: "to book a room", back: "ein Zimmer buchen", example: "I booked a room for two nights." },
      { front: "luggage", back: "Gepäck", example: "My luggage is very heavy." },
      { front: "departure", back: "Abfahrt / Abflug", example: "The departure is at 9 o'clock." },
      { front: "the bill, please", back: "die Rechnung, bitte", example: "Could we have the bill, please?" },
      { front: "grandchild", back: "Enkelkind", example: "My grandchild is three years old." },
      { front: "sister-in-law", back: "Schwägerin", example: "My sister-in-law lives in Hamburg." },
      { front: "to get on well with", back: "sich gut verstehen mit", example: "I get on well with my neighbours." },
      { front: "hobby", back: "Hobby", example: "Reading is my favourite hobby." },
      { front: "to go for a walk", back: "spazieren gehen", example: "We go for a walk every Sunday." },
      { front: "to be interested in", back: "sich interessieren für", example: "I'm interested in history." },
      { front: "weather forecast", back: "Wettervorhersage", example: "The weather forecast says it will rain." },
      { front: "on the left / on the right", back: "links / rechts", example: "The bakery is on the left." },
      { front: "How much is it?", back: "Wie viel kostet das?" },
      { front: "I'm looking forward to it.", back: "Ich freue mich darauf." },
      { front: "Could you repeat that, please?", back: "Könnten Sie das bitte wiederholen?" },
    ],
  },
  2: {
    title: "Smalltalk & Meinungen",
    items: [
      { front: "in my opinion", back: "meiner Meinung nach", example: "In my opinion, the book is better than the film." },
      { front: "I agree with you.", back: "Ich stimme dir zu." },
      { front: "I'm not so sure about that.", back: "Da bin ich mir nicht so sicher." },
      { front: "to be honest", back: "ehrlich gesagt", example: "To be honest, I didn't like it." },
      { front: "by the way", back: "übrigens", example: "By the way, how is your mother?" },
      { front: "It depends.", back: "Es kommt darauf an." },
      { front: "experience", back: "Erfahrung / Erlebnis", example: "It was a wonderful experience." },
      { front: "to recommend", back: "empfehlen", example: "Can you recommend a good restaurant?" },
      { front: "to look forward to", back: "sich freuen auf", example: "I'm looking forward to the summer." },
      { front: "to catch up", back: "sich austauschen / auf den neuesten Stand bringen", example: "Let's meet for coffee and catch up." },
      { front: "neighbourhood", back: "Nachbarschaft / Viertel", example: "It's a quiet neighbourhood." },
      { front: "to get used to", back: "sich gewöhnen an", example: "I'm getting used to the new job." },
      { front: "on the other hand", back: "andererseits", example: "On the other hand, it's very expensive." },
      { front: "What do you mean?", back: "Was meinst du damit?" },
      { front: "That sounds lovely.", back: "Das klingt schön." },
    ],
  },
  3: {
    title: "Nuancen & Diskussionen",
    items: [
      { front: "to point out", back: "darauf hinweisen", example: "She pointed out a mistake in the text." },
      { front: "to take something into account", back: "etwas berücksichtigen", example: "We have to take the costs into account." },
      { front: "advantage / disadvantage", back: "Vorteil / Nachteil" },
      { front: "to make a decision", back: "eine Entscheidung treffen", example: "It was hard to make a decision." },
      { front: "whereas", back: "wohingegen / während", example: "I like tea, whereas my husband prefers coffee." },
      { front: "although", back: "obwohl", example: "Although it was raining, we went out." },
      { front: "to be supposed to", back: "sollen (Erwartung)", example: "The train was supposed to arrive at 6." },
      { front: "to come up with", back: "sich ausdenken / auf etwas kommen", example: "She came up with a great idea." },
      { front: "reliable", back: "zuverlässig", example: "He is a very reliable friend." },
      { front: "to cope with", back: "zurechtkommen mit / bewältigen", example: "How do you cope with stress?" },
      { front: "to be worth it", back: "sich lohnen", example: "The trip was long, but it was worth it." },
      { front: "a matter of taste", back: "Geschmackssache" },
      { front: "to run out of", back: "ausgehen / knapp werden", example: "We've run out of milk." },
      { front: "to look into something", back: "etwas prüfen / sich ansehen", example: "I'll look into it tomorrow." },
      { front: "I see your point, but …", back: "Ich verstehe, was du meinst, aber …" },
    ],
  },
  4: {
    title: "Idioms & feine Ausdrücke",
    items: [
      { front: "a piece of cake", back: "ein Kinderspiel", example: "The test was a piece of cake." },
      { front: "to break the ice", back: "das Eis brechen", example: "A little joke helped to break the ice." },
      { front: "under the weather", back: "angeschlagen, nicht ganz fit", example: "I'm feeling a bit under the weather today." },
      { front: "once in a blue moon", back: "alle Jubeljahre", example: "We only go to the theatre once in a blue moon." },
      { front: "to hit the nail on the head", back: "den Nagel auf den Kopf treffen" },
      { front: "to call it a day", back: "Feierabend machen / Schluss machen", example: "Let's call it a day." },
      { front: "to keep an eye on", back: "ein Auge auf etwas haben", example: "Could you keep an eye on my bag?" },
      { front: "it's not my cup of tea", back: "das ist nicht mein Ding" },
      { front: "to have second thoughts", back: "Bedenken bekommen, es sich anders überlegen" },
      { front: "eventually", back: "schließlich, am Ende (nicht: eventuell!)", example: "Eventually, we found the hotel." },
      { front: "actually", back: "eigentlich, tatsächlich (nicht: aktuell!)", example: "Actually, I prefer tea." },
      { front: "to become", back: "werden (nicht: bekommen!)", example: "She became a teacher." },
      { front: "nevertheless", back: "nichtsdestotrotz" },
      { front: "to be on the same page", back: "sich einig sein, auf demselben Stand sein" },
      { front: "better late than never", back: "besser spät als nie" },
    ],
  },
};
