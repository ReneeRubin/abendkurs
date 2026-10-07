# Abendkurs-Landingpage „7 Schlüssel“ – RückenbewusstSEIN

Statische Landingpage (HTML/CSS/JS, kein Build-Schritt) für den kostenfreien
Online-Abendkurs. Einziges Ziel: Anmeldung über das bestehende Brevo-Formular.

## Dateien

| Datei | Zweck |
| --- | --- |
| `index.html` | Landingpage (aktive Variante B) |
| `variante-a.html` | Alte Variante A als Sicherung, noindex |
| `impressum/`, `datenschutz/` | Rechtliches |
| `vip/` | VIP-Angebotsseite (optional, gleiche Inhalte wie die Dankesseite) |
| `assets/fonts/` | Schriften lokal, keine Google-Verbindung |
| `ty1/index.html` | Danke-Seite, feuert den Meta-Lead einmal |
| `assets/styles.css` | Design (Petrol, Mittelblau, Pink; Century Gothic/Questrial, Cormorant Garamond, Allura) |
| `assets/tracking.js` | UTM sichern, Cookie-Einwilligung, Meta Pixel, Lead-Logik |
| `assets/main.js` | CTA-Sprung, Sticky-CTA (mobil), Animationen, Formularversand an Brevo |
| `_headers` | Cloudflare-Pages-Header (Caching, noindex für Danke-Seite) |

## Tracking-Logik

- **PageView** auf beiden Seiten, nur nach Zustimmung im Cookie-Banner.
- **Lead** nur auf `/ty1/` (gleicher Pfad wie Renées bisherige Conversion-Regel), nur wenn die Landingpage direkt davor
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

1. reCAPTCHA ist in Brevo abgeschaltet (05.10.2026), `RECAPTCHA_SITEKEY = ""` gesetzt.
   kein Google-Skript). Dann in `assets/main.js` `RECAPTCHA_SITEKEY = ""` setzen.
   Bleibt es an, muss reCAPTCHA in der Datenschutzerklärung stehen.
2. Datenschutzerklärung um Meta Pixel und Cookie-Einwilligung ergänzen.
3. Cloudflare Pages: Projekt mit diesem Repo verbinden, Build-Befehl leer,
   Ausgabeverzeichnis `/`. Danach Subdomain (z. B.
   `abendkurs.rueckenbewusst-sein.de`) per CNAME bei Alfahosting eintragen
   und die `og:image`-URL in `index.html` darauf anpassen.
4. Testanmeldung: Danke-Seite `/ty1/` erscheint, im Meta Events Manager
   (Testereignisse) genau ein Lead, Double-Opt-In-Mail kommt an.

## Lokal ansehen

```bash
python3 -m http.server 8765
# http://localhost:8765/
```
