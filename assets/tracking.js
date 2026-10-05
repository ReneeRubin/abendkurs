/* Gemeinsam für Landingpage und Danke-Seite:
   - UTM-Parameter sichern (ohne Gesundheitsdaten)
   - Cookie-Einwilligung
   - Meta Pixel erst nach Zustimmung (PageView), Lead nur über AK.trackLeadOnce() */
(function () {
  "use strict";

  var CONFIG = {
    // Meta Pixel "Renis Pixel"
    metaPixelId: "334988589650386",
    consentKey: "ak_consent_v1",
    utmKey: "ak_utm",
    leadKey: "ak_lead_pending"
  };

  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"];

  function safeGet(store, key) { try { return window[store].getItem(key); } catch (e) { return null; } }
  function safeSet(store, key, val) { try { window[store].setItem(key, val); } catch (e) { /* privat/gesperrt */ } }
  function safeDel(store, key) { try { window[store].removeItem(key); } catch (e) { /* ignore */ } }

  /* ---------- UTM ---------- */
  function captureUtm() {
    var params = new URLSearchParams(window.location.search);
    var found = {};
    var any = false;
    UTM_KEYS.forEach(function (k) {
      var v = params.get(k);
      if (v) { found[k] = v.slice(0, 200); any = true; }
    });
    // Neuer Anzeigen-Klick überschreibt ältere Werte derselben Sitzung.
    if (any) safeSet("sessionStorage", CONFIG.utmKey, JSON.stringify(found));
  }
  function getUtm() {
    try { return JSON.parse(safeGet("sessionStorage", CONFIG.utmKey) || "{}"); } catch (e) { return {}; }
  }
  function utmQuery() {
    var u = getUtm();
    var q = new URLSearchParams();
    UTM_KEYS.forEach(function (k) { if (u[k]) q.set(k, u[k]); });
    var s = q.toString();
    return s ? "?" + s : "";
  }

  /* ---------- Meta Pixel ---------- */
  var pixelReady = false;
  function loadPixel() {
    if (pixelReady || !CONFIG.metaPixelId) return pixelReady;
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    // Kein automatisches Advanced Matching: keine Formulardaten an Meta.
    window.fbq("set", "autoConfig", false, CONFIG.metaPixelId);
    window.fbq("init", CONFIG.metaPixelId);
    window.fbq("track", "PageView");
    pixelReady = true;
    return true;
  }

  /* Lead genau einmal pro erfolgreicher Anmeldung: nur wenn die Landingpage
     nach erfolgreicher Brevo-Antwort ein Einmal-Merkzeichen gesetzt hat. */
  function trackLeadOnce() {
    var eventId = safeGet("sessionStorage", CONFIG.leadKey);
    if (!eventId) return false;
    if (!hasConsent() || !loadPixel()) return false; // Merkzeichen bleibt, falls später zugestimmt wird
    window.fbq("track", "Lead", {}, { eventID: eventId });
    safeDel("sessionStorage", CONFIG.leadKey);
    return true;
  }

  function markLeadPending() {
    var id = "ak-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
    safeSet("sessionStorage", CONFIG.leadKey, id);
    return id;
  }

  /* ---------- Consent ---------- */
  function hasConsent() { return safeGet("localStorage", CONFIG.consentKey) === "all"; }
  function consentDecided() { return !!safeGet("localStorage", CONFIG.consentKey); }

  // Marketing-Häkchen in den Einstellungen vorausgewählt? Rechtlich gilt ein
  // vorausgewähltes Häkchen nicht als wirksame Einwilligung (EuGH Planet49).
  var PRESELECT_MARKETING = false;

  function setupConsent() {
    var box = document.getElementById("consent");
    if (!box) return;
    var settings = document.getElementById("consent-settings");
    var marketing = document.getElementById("consent-marketing");
    var settingsBtn = box.querySelector(".js-consent-settings");
    var show = function () {
      box.hidden = false;
      if (settings) settings.hidden = true;
      if (settingsBtn) settingsBtn.textContent = "Einstellungen";
    };
    var hide = function () { box.hidden = true; };
    var grant = function () {
      safeSet("localStorage", CONFIG.consentKey, "all");
      hide();
      loadPixel();
      trackLeadOnce();
      document.dispatchEvent(new CustomEvent("ak:consent"));
    };

    if (!consentDecided()) show();

    box.querySelector(".js-consent-accept").addEventListener("click", grant);
    if (settingsBtn) settingsBtn.addEventListener("click", function () {
      if (settings && settings.hidden) {
        // 1. Klick: Einstellungen aufklappen
        settings.hidden = false;
        if (marketing) marketing.checked = hasConsent() || PRESELECT_MARKETING;
        settingsBtn.textContent = "Auswahl speichern";
        return;
      }
      // 2. Klick: Auswahl speichern
      if (marketing && marketing.checked) return grant();
      safeSet("localStorage", CONFIG.consentKey, "necessary");
      hide();
    });
    Array.prototype.forEach.call(document.querySelectorAll(".js-consent-open"), function (el) {
      el.addEventListener("click", show);
    });
  }

  captureUtm();
  if (hasConsent()) loadPixel();

  window.AK = {
    config: CONFIG,
    utmQuery: utmQuery,
    getUtm: getUtm,
    markLeadPending: markLeadPending,
    trackLeadOnce: trackLeadOnce,
    setupConsent: setupConsent
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupConsent);
  } else {
    setupConsent();
  }
})();
