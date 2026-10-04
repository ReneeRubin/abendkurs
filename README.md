# Abendkurs-Landingpage „7 Schlüssel“ – RückenbewusstSEIN

Statische Landingpage (HTML/CSS/JS, kein Build-Schritt) für den kostenfreien
Online-Abendkurs. Einziges Ziel: Anmeldung über das bestehende Brevo-Formular.

## Dateien

| Datei | Zweck |
| --- | --- |
| `index.html` | Landingpage |
| `danke-abendkurs/index.html` | Danke-Seite, feuert den Meta-Lead einmal |
| `assets/styles.css` | Design (Petrol, Mittelblau, Pink; Century Gothic/Questrial, Cormorant Garamond, Great Vibes) |
| `assets/tracking.js` | UTM sichern, Cookie-Einwilligung, Meta Pixel, Lead-Logik |
| `assets/main.js` | CTA-Sprung, Sticky-CTA (mobil), Animationen, Formularversand an Brevo |
| `_headers` | Cloudflare-Pages-Header (Caching, noindex für Danke-Seite) |

## Tracking-Logik

- **PageView** auf beiden Seiten, nur nach Zustimmung im Cookie-Banner.
- **Lead** nur auf `/danke-abendkurs/`, nur wenn die Landingpage direkt davor
  eine erfolgreiche Brevo-Antwort bekommen hat (Einmal-Merkzeichen in
  `sessionStorage`, mit `eventID`). Neu laden oder Direktaufruf zählt nicht.
- Keine Formulardaten, keine Gesundheitsinformationen an Meta;
  automatisches Advanced Matching ist aus.
- **UTM** (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`,
  `utm_term`, `fbclid`) wird beim Aufruf gesichert und an die Danke-Seite
  weitergegeben.
- Klappt der Versand per JavaScript nicht (Netzwerk/CORS), wird das Formular
  klassisch an Brevo geschickt: Die Anmeldung geht nie verloren, nur der Lead
  wird dann nicht gezählt.

## Vor dem Go-live (TODO)

1. Echte Fotos ablegen: `assets/img/renee-hero.jpg` (Hero) und
   `assets/img/renee-portrait.jpg` (Über mich), Teilen-Bild
   `assets/img/og-abendkurs.jpg` (1200 × 630). Die Dateien im Repo sind Platzhalter.
2. Brevo: Formular-`action` in `index.html` mit dem HTML-Embed-Code des
   Abendkurs-Formulars abgleichen; Nachname im Formular auf optional stellen.
3. Termin prüfen (alle Stellen mit Klasse `js-termin`).
4. Datenschutzerklärung um Meta Pixel und Cookie-Einwilligung ergänzen.
5. Cloudflare Pages: Projekt mit diesem Repo verbinden, Build-Befehl leer,
   Ausgabeverzeichnis `/`. Danach Subdomain (z. B.
   `abendkurs.rueckenbewusst-sein.de`) per CNAME bei Alfahosting eintragen
   und `og:image`-URL anpassen.
6. Testanmeldung: Danke-Seite erscheint, im Meta Events Manager
   (Testereignisse) genau ein Lead, Double-Opt-In-Mail kommt an.

## Lokal ansehen

```bash
python3 -m http.server 8765
# http://localhost:8765/
```
