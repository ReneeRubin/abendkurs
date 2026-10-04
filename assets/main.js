/* Landingpage: CTA-Sprung, Sticky-CTA, Reveal, Brevo-Formular */
(function () {
  "use strict";

  var THANK_YOU_PATH = "/danke-abendkurs/";

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

    if (!vorname.value) return setError("Bitte gib deinen Vornamen ein.", vorname);
    if (!EMAIL_RE.test(email.value)) return setError("Bitte prüfe deine E-Mail-Adresse.", email);
    if (!optin.checked) return setError("Bitte bestätige die Einwilligung, damit ich dir die Kursinformationen schicken darf.", optin);

    // Honeypot gefüllt = Bot: so tun als ob, nichts senden, keinen Lead zählen.
    if (form.elements.email_address_check.value) { window.location.href = THANK_YOU_PATH; return; }

    var data = new FormData(form);
    button.disabled = true;
    button.textContent = "Einen Moment …";

    var url = form.action + (form.action.indexOf("?") === -1 ? "?" : "&") + "isAjax=1";
    fetch(url, { method: "POST", body: data, mode: "cors", credentials: "omit" })
      .then(function (res) {
        return res.json().catch(function () { return { success: res.ok }; }).then(function (json) {
          return { ok: res.ok, json: json };
        });
      })
      .then(function (r) {
        if (r.ok && r.json && r.json.success !== false) {
          goToThankYou();
        } else {
          button.disabled = false;
          button.textContent = buttonText;
          setError("Deine Anmeldung konnte nicht gespeichert werden. Bitte versuche es erneut.");
        }
      })
      .catch(function () {
        // Netzwerk/CORS-Problem: klassisch an Brevo senden, damit die Anmeldung nie verloren geht.
        // (Dann zeigt Brevo seine eigene Bestätigung; ein Lead wird in diesem Fall nicht gezählt.)
        form.submit();
      });
  });
})();
