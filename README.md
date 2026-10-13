# English Garden 🌿

Eine ruhige, persönliche Englisch-Lern-App – gemacht als Geschenk. Kein Gamification-Lärm, keine Eulen, keine Pop-ups:
nur klare Erklärungen, ein kluger Vokabelkasten und ein geduldiger KI-Gesprächspartner.

**Laufende Kosten: 0 €.** Alles läuft auf kostenlosen Diensten, und für keinen davon wird eine Kreditkarte benötigt.

| Baustein | Lösung | Kosten |
| --- | --- | --- |
| Hosting | Vercel „Hobby“-Plan | kostenlos |
| KI-Gesprächspartner & Schreib-Feedback | Google Gemini API (Free Tier) – alternativ Groq | kostenlos, ohne Kreditkarte |
| Spracheingabe (Sprechen statt Tippen) | Spracherkennung des Browsers (Chrome, Edge, Safari) | kostenlos |
| Vorlesen | Stimmen des Browsers/Betriebssystems | kostenlos |
| Lernstand, Vokabeln, Tageszähler | `localStorage` im Browser (mit Sicherungsdatei) | kostenlos, keine Datenbank nötig |

> Die kostenlosen KI-Kontingente (bei Gemini aktuell einige hundert Anfragen pro Tag) reichen für eine Person, die täglich übt,
> sehr gut aus. Ist das Kontingent einmal erschöpft, zeigt die App einen freundlichen Hinweis – es entstehen **niemals**
> Kosten, solange du bei Google bzw. Groq keine Zahlungsmethode hinterlegst.

---

## Was die App kann

**Lernweg in 4 Stufen** (angelehnt an A1–B2) mit Einstufungstest:
1. Grundlagen & Alltag (A1/A2)
2. Sicher im Gespräch (A2/B1)
3. Flüssig ausdrücken (B1/B2)
4. Freies Englisch & Kultur (B2)

**Grammatik**: 18 Lektionen, auf Deutsch erklärt, mit Beispielen zum Anhören und jeweils 5 Übungen (Lückentext, Auswahl, Satzbau).

**Vokabeltrainer** nach dem Anki-Prinzip (Spaced Repetition): Karte ansehen → aufdecken → „Gewusst“ / „Nicht gewusst“.
Schwierige Karten kommen früher und öfter wieder. Pro Stufe gibt es einen Startwortschatz. Freitag bis Sonntag erscheint ein
**Wochenrückblick** mit Statistik und einer Wiederholung aller Wörter der Woche.

**KI-Sprachtrainer**: Themen wählen (oder „Überrasch mich“), sprechen oder tippen. Fehler werden freundlich als
„Vorher → Besser“ mit kurzer Erklärung auf Deutsch angezeigt, das Gespräch läuft natürlich weiter. Antworten können
vorgelesen und auf Deutsch übersetzt werden. Neue Wörter und Korrekturen landen mit einem Klick im Vokabelkasten.

**Schreibaufgaben** mit ausführlichem, ehrlichem und aufmunterndem Feedback.

**Tageszähler** („Tag 5 in Folge“) – dezent, ohne Druck.

---

## Schritt-für-Schritt: Die App online stellen

Du brauchst etwa 20 Minuten. Programmierkenntnisse sind nicht nötig.

### Schritt 1: Konten anlegen (alle kostenlos)

1. **GitHub** – <https://github.com/signup> (hier liegt der Programmcode)
2. **Vercel** – <https://vercel.com/signup> → „Continue with GitHub“ wählen, Plan **Hobby** (kostenlos)
3. **Google-Konto** – falls noch nicht vorhanden

### Schritt 2: Kostenlosen KI-Schlüssel holen

**Empfohlen: Google Gemini**

1. Öffne <https://aistudio.google.com/apikey> und melde dich mit deinem Google-Konto an.
2. Klicke auf **„API-Schlüssel erstellen“** („Create API key“).
3. Kopiere den Schlüssel (beginnt meist mit `AIza…`) und bewahre ihn sicher auf.
4. **Wichtig:** Richte in Google AI Studio bzw. Google Cloud **keine Abrechnung („Billing“) ein**. Ohne Abrechnung bleibt
   der Schlüssel im kostenlosen Kontingent – es kann nichts kosten.

**Optional zusätzlich: Groq** (kostenlos, ohne Kreditkarte)

1. Öffne <https://console.groq.com/keys>, melde dich an und erstelle einen Schlüssel (beginnt mit `gsk_…`).
2. Groq wird verwendet, wenn kein Gemini-Schlüssel gesetzt ist – und **zusätzlich** für die Spracheingabe in Browsern ohne
   eingebaute Spracherkennung (z. B. Firefox). In Chrome, Edge und Safari ist er nicht nötig.

### Schritt 3: Code zu GitHub hochladen

**Variante A – ohne Kommandozeile:**

1. Auf GitHub oben rechts **„+“ → „New repository“**, Name z. B. `english-garden`, Sichtbarkeit **Private**, „Create repository“.
2. Auf der neuen Seite auf **„uploading an existing file“** klicken.
3. Den **Inhalt** dieses Projektordners hineinziehen (alle Dateien und Ordner: `app`, `components`, `lib`, `public`,
   `package.json` usw. – **nicht** `node_modules` oder `.next`, falls vorhanden; die Datei `.env.local` niemals hochladen).
4. „Commit changes“ klicken.

**Variante B – mit Git (Kommandozeile im Projektordner):**

```bash
git init
git add .
git commit -m "English Garden"
git branch -M main
git remote add origin https://github.com/DEIN-NAME/english-garden.git
git push -u origin main
```

### Schritt 4: Auf Vercel veröffentlichen

1. Gehe zu <https://vercel.com/new> und wähle bei „Import Git Repository“ dein Repository `english-garden` → **Import**.
2. Framework wird automatisch als **Next.js** erkannt. Nichts ändern.
3. Klappe **„Environment Variables“** auf und trage ein:
   - Name `GEMINI_API_KEY` → Wert: dein Schlüssel aus Schritt 2
   - (optional) `GROQ_API_KEY` → dein Groq-Schlüssel
   - (optional, empfohlen) `ACCESS_CODE` → ein Codewort, z. B. `rosengarten` (siehe unten)
4. **Deploy** klicken. Nach 1–2 Minuten bekommst du einen Link wie `https://english-garden-xyz.vercel.app`.

Fertig! 🎉 Jede spätere Änderung, die du auf GitHub hochlädst, wird automatisch neu veröffentlicht.

> Schlüssel später ändern: Vercel → Projekt → **Settings → Environment Variables**, danach unter **Deployments** beim
> obersten Eintrag „⋯ → Redeploy“.

### Zugangscode (empfohlen)

Wer den Link kennt, könnte sonst dein kostenloses KI-Kontingent mitbenutzen. Wenn du `ACCESS_CODE` setzt, fragt die App beim
ersten Gespräch einmalig nach diesem Code und merkt ihn sich dann auf dem Gerät. Grammatik und Vokabeln funktionieren
auch ohne Code.

---

## Für deine Mama: Einrichtung auf dem Gerät

1. Link in **Chrome**, **Edge** oder **Safari** öffnen (dort funktioniert die Spracheingabe ohne Zusatzschlüssel).
2. **Zum Home-Bildschirm hinzufügen** – dann wirkt es wie eine richtige App:
   - iPad/iPhone (Safari): Teilen-Symbol → „Zum Home-Bildschirm“
   - Android (Chrome): Menü ⋮ → „Zum Startbildschirm hinzufügen“
   - Computer (Chrome/Edge): Installieren-Symbol rechts in der Adressleiste
3. Beim ersten Tippen aufs Mikrofon den **Mikrofonzugriff erlauben**.
4. Unter **Einstellungen** eine angenehme Stimme und das Sprechtempo wählen.

**Wichtig:** Der Lernstand wird im Browser des jeweiligen Geräts gespeichert. Wer auf mehreren Geräten lernt, kann unter
**Einstellungen → Datensicherung** eine Sicherungsdatei herunterladen und auf dem anderen Gerät laden. Ab und zu eine
Sicherung zu machen schadet nie.

---

## Lokal ausprobieren (optional)

Dafür brauchst du **Node.js** (LTS-Version) von <https://nodejs.org>.

```bash
npm install
```

Dann die Datei `.env.example` kopieren, in `.env.local` umbenennen und den Schlüssel eintragen:

```
GEMINI_API_KEY=AIza...
```

Starten:

```bash
npm run dev
```

Die App läuft jetzt unter <http://localhost:3000>.

---

## Projektstruktur

```
app/
  page.tsx                  Startseite „Heute für dich“
  einstufung/               Einstufungstest
  stufen/ , stufen/[id]/    Lernweg & Stufenseiten
  grammatik/ , [slug]/      Lektionsübersicht & Lektion mit Übungen
  vokabeln/                 Vokabelkasten, lernen/ (Sitzung), woche/ (Wochenrückblick)
  gespraech/                KI-Sprachtrainer
  schreiben/                Schreibaufgaben mit Feedback
  einstellungen/            Name, Stimme, Datensicherung
  api/chat/                 KI-Gespräch (inkl. Korrekturen)
  api/feedback/             KI-Feedback für Texte
  api/transcribe/           Spracheingabe-Rückfall über Groq Whisper (optional)
  api/status/               Welche Dienste sind eingerichtet?
components/                 Wiederverwendbare Bausteine (Karteikarte, Übungen, Mikrofon …)
lib/
  ai.ts                     Anbindung an Gemini/Groq (OpenAI-kompatibel, ohne Zusatzpakete)
  storage.ts                Lernstand im localStorage
  srs.ts                    Spaced-Repetition-Algorithmus (vereinfachtes SM-2)
  speech.ts                 Vorlesen & Spracherkennung im Browser
  content/                  Alle Lerninhalte: Stufen, Grammatik, Wortschatz, Themen, Einstufung
```

### Inhalte erweitern

Alle Inhalte sind einfache TypeScript-Dateien in `lib/content/`:

- **Neue Grammatik-Lektion:** in `lib/content/grammar.ts` einen Eintrag nach dem Muster der vorhandenen ergänzen.
  `**Text**` wird fett dargestellt.
- **Wortschatz:** `lib/content/vocab.ts`
- **Gesprächsthemen und Schreibaufgaben:** `lib/content/topics.ts`

---

## Hilfe bei Problemen

| Problem | Lösung |
| --- | --- |
| „Es ist noch kein KI-Schlüssel hinterlegt“ | `GEMINI_API_KEY` in Vercel eintragen und neu deployen (Schritt 4). |
| „Das kostenlose Kontingent ist aufgebraucht“ | Ein paar Minuten warten (Minutenlimit) bzw. bis zum nächsten Tag (Tageslimit). Optional zusätzlich einen Groq-Schlüssel hinterlegen. |
| KI antwortet mit „Fehler 404“ | Das Standardmodell wurde von Google umbenannt. In Vercel `AI_MODEL` setzen, z. B. auf ein aktuelles Flash-Modell aus <https://ai.google.dev/gemini-api/docs/models>, und neu deployen. |
| Kein Mikrofon-Knopf zu sehen | Der Browser hat keine Spracherkennung (z. B. Firefox). Chrome/Edge/Safari verwenden oder `GROQ_API_KEY` setzen. |
| Vorlesen klingt blechern | Unter Einstellungen eine andere Stimme wählen („Natural“, „Neural“, „Google“ klingen am besten). |
| Fehlermeldungen im Detail | Vercel → Projekt → **Logs**. |

## Datenschutz

- Lernstand, Vokabeln und Texte bleiben im Browser des Geräts. Es gibt keine Datenbank und kein Benutzerkonto.
- Für Gespräche und Schreib-Feedback wird der jeweilige Text an die KI (Google Gemini bzw. Groq) gesendet. Beim kostenlosen
  Gemini-Kontingent kann Google Eingaben zur Verbesserung seiner Dienste verwenden – also im Gespräch besser keine
  sensiblen persönlichen Daten erzählen.
- Die Spracherkennung in Chrome nutzt Googles Server, in Safari die von Apple.
