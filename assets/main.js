/* Landingpage: CTA-Sprung, Sticky-CTA, Reveal, Brevo-Formular */
(function () {
  "use strict";

  var THANK_YOU_PATH = "/ty1/";
  // reCAPTCHA-Schlüssel aus Renées Brevo-Formular. Wird in Brevo das Captcha
  // abgeschaltet, hier "" eintragen: dann lädt kein Google-Skript mehr.
  var RECAPTCHA_SITEKEY = ""; // in Brevo abgeschaltet (Renée, 05.10.2026)

  /* ---------- Reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.2 });
    Array.prototype.forEach.call(revealEls, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(revealEls, function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- CTA: Sprung zum Formular + Fokus ---------- */
  var form = document.getElementById("signup-form");
  var firstField = document.getElementById("f-vorname");
  Array.prototype.forEach.call(document.querySelectorAll('a[href="#anmeldung"]'), function (a) {
    a.addEventListener("click", function () {
      // Fokus erst nach dem Scrollen, damit mobil die Tastatur nicht vorher springt
      setTimeout(function () { if (firstField) firstField.focus({ preventScroll: true }); }, 650);
    });
  });

  /* ---------- Sticky CTA (mobil) ---------- */
  var sticky = document.querySelector(".stickycta");
  var heroCta = document.getElementById("hero-cta");
  var signup = document.getElementById("anmeldung");
  if (sticky && heroCta && signup && "IntersectionObserver" in window) {
    var heroVisible = true, signupVisible = false;
    var update = function () {
      var show = !heroVisible && !signupVisible;
      sticky.classList.toggle("is-shown", show);
      sticky.setAttribute("aria-hidden", show ? "false" : "true");
      sticky.tabIndex = show ? 0 : -1;
    };
    new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; update(); }).observe(heroCta);
    new IntersectionObserver(function (e) { signupVisible = e[0].isIntersecting; update(); }, { threshold: 0.15 }).observe(signup);
  }

  /* ---------- Jahr im Footer ---------- */
  var y = document.querySelector(".js-year");
  if (y) y.textContent = String(new Date().getFullYear());

  /* ---------- Brevo-Formular ---------- */
  if (!form) return;

  /* reCAPTCHA erst laden, wenn die Besucherin das Formular erreicht (spart Ladezeit) */
  var captchaBox = document.getElementById("f-captcha");
  var captchaId = null, captchaRequested = false;
  window.akCaptchaReady = function () {
    if (!captchaBox || !window.grecaptcha) return;
    captchaBox.hidden = false;
    captchaId = window.grecaptcha.render(captchaBox, { sitekey: RECAPTCHA_SITEKEY, hl: "de" });
  };
  function loadCaptcha() {
    if (!RECAPTCHA_SITEKEY || captchaRequested) return;
    captchaRequested = true;
    var sc = document.createElement("script");
    sc.src = "https://www.google.com/recaptcha/api.js?onload=akCaptchaReady&render=explicit&hl=de";
    sc.async = true;
    document.head.appendChild(sc);
  }
  if (RECAPTCHA_SITEKEY) {
    form.addEventListener("focusin", loadCaptcha);
    if ("IntersectionObserver" in window) {
      var cio = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { loadCaptcha(); cio.disconnect(); } }, { rootMargin: "400px" });
      cio.observe(form);
    } else { loadCaptcha(); }
  }
  var msg = form.querySelector(".form__msg");
  var button = form.querySelector('button[type="submit"]');
  var buttonText = button.textContent;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(text, field) {
    msg.textContent = text;
    if (field) { field.setAttribute("aria-invalid", "true"); field.focus(); }
  }
  function clearErrors() {
    msg.textContent = "";
    Array.prototype.forEach.call(form.querySelectorAll("[aria-invalid]"), function (el) { el.removeAttribute("aria-invalid"); });
  }
  // Unklare Antwort oder Netzwerk/CORS-Problem: ganz normal an Brevo senden, so wie Brevos eigenes
  // Formular. Brevo leitet danach auf die in Brevo eingestellte Dankesseite (/ty1/) weiter.
  function classicSubmit() {
    var hpField = form.elements.ak_hp_x;
    if (hpField) hpField.disabled = true;
    window.AK && window.AK.markLeadPending();
    form.submit();
  }
  function goToThankYou() {
    window.AK && window.AK.markLeadPending();
    window.location.href = THANK_YOU_PATH + (window.AK ? window.AK.utmQuery() : "");
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    clearErrors();

    var vorname = form.elements.VORNAME;
    var email = form.elements.EMAIL;
    var optin = form.elements.OPT_IN;
    vorname.value = vorname.value.trim();
    email.value = email.value.trim();

    if (!vorname.value) return setError("Bitte gib Deinen Vornamen ein.", vorname);
    if (!EMAIL_RE.test(email.value)) return setError("Bitte prüfe Deine E-Mail-Adresse.", email);
    if (!optin.checked) return setError("Bitte bestätige die Einwilligung, damit ich Dir die Kursinformationen schicken darf.", optin);
    if (RECAPTCHA_SITEKEY) {
      if (captchaId === null) { loadCaptcha(); return setError("Einen Moment bitte, die Sicherheitsabfrage lädt noch."); }
      if (!window.grecaptcha.getResponse(captchaId)) return setError("Bitte bestätige kurz die Sicherheitsabfrage („Ich bin kein Roboter“).");
    }

    // Eigener Honeypot mit neutralem Namen (Browser-Autofill füllt ihn nicht aus).
    // Gefüllt = Bot: nichts senden, keinen Lead zählen. Das Feld geht nie an Brevo.
    var hp = form.elements.ak_hp_x;
    if (hp && hp.value) { window.location.href = THANK_YOU_PATH; return; }

    var data = new FormData(form);
    data.delete("ak_hp_x");
    button.disabled = true;
    button.textContent = "Einen Moment …";

    var url = form.action + (form.action.indexOf("?") === -1 ? "?" : "&") + "isAjax=1";
    fetch(url, { method: "POST", body: data, mode: "cors", credentials: "omit" })
      .then(function (res) {
        return res.json().then(function (json) { return { ok: res.ok, json: json }; },
                               function () { return { ok: res.ok, json: null }; });
      })
      .then(function (r) {
        // Nur eine ausdrückliche Erfolgsmeldung von Brevo zählt als Anmeldung.
        if (r.ok && r.json && r.json.success === true) return goToThankYou();
        if (r.json && r.json.success === false) {
          button.disabled = false;
          button.textContent = buttonText;
          // Brevos eigene Begründung mit anzeigen (z. B. welches Feld fehlt)
          var detail = [];
          if (r.json.message) detail.push(String(r.json.message));
          if (r.json.errors && typeof r.json.errors === "object") {
            Object.keys(r.json.errors).forEach(function (k) { detail.push(k + ": " + String(r.json.errors[k])); });
          }
          setError("Deine Anmeldung konnte nicht gespeichert werden. Bitte prüfe Deine Angaben und versuche es erneut." +
                   (detail.length ? " (Brevo: " + detail.join(" · ") + ")" : ""));
          if (window.console) console.warn("Brevo-Antwort:", r.json);
          if (captchaId !== null) window.grecaptcha.reset(captchaId);
          return;
        }
        classicSubmit();
      })
      .catch(classicSubmit);
  });
})();
