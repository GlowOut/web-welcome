/**
 * GlowOut Partners — Cookie Consent
 *
 * Loads Google Analytics (G-1K97F91FRT), Google Ads (AW-17764370287)
 * and Google Tag Manager (GTM-PVHPBMGZ) only after the user clicks
 * "Accept All" on the cookie banner.
 *
 * Why this exists:
 *   ConsentManager (consentmanager.net) was flagging this site for
 *   loading non-essential vendors before consent. With this file in
 *   place, no requests are made to googletagmanager.com,
 *   google-analytics.com or doubleclick.net until the user opts in.
 *
 * Storage:
 *   localStorage "cookie_consent_v1" = "accepted" | "declined"
 *   localStorage "cookie_consent_v1_date" = ISO timestamp
 *
 * Public API (on window.GlowOutConsent):
 *   .accept()         → grant consent and load trackers
 *   .reject()         → revoke consent and delete GA cookies
 *   .openSettings()   → re-show the banner so the user can change choice
 *   .status()         → "accepted" | "declined" | null
 */

(function () {
  "use strict";

  var CONSENT_KEY = "cookie_consent_v1";
  var CONSENT_DATE_KEY = "cookie_consent_v1_date";
  // Re-prompt the user after 12 months (ICO / EDPB guidance).
  var CONSENT_TTL_MS = 365 * 24 * 60 * 60 * 1000;

  var GA_ID = "G-1K97F91FRT";
  var ADS_ID = "AW-17764370287";
  var ADS_CONVERSION = "AW-17764370287/yHaICOiLj8gbEO-O25ZC";
  var GTM_ID = "GTM-PVHPBMGZ";

  var GA_COOKIE_NAMES = [
    "_ga",
    "_gid",
    "_gat",
    "_ga_" + GA_ID.replace(/^G-/, ""),
    "_gcl_au",
    "_gcl_aw",
    "_gcl_dc",
    "_gcl_gb",
    "_gcl_gf",
    "_gcl_ha",
  ];

  var banner = null;
  var trackersLoaded = false;

  /** Read consent state (null if undecided or expired). */
  function readStatus() {
    try {
      var value = localStorage.getItem(CONSENT_KEY);
      if (value !== "accepted" && value !== "declined") return null;
      var date = localStorage.getItem(CONSENT_DATE_KEY);
      if (date) {
        var ageMs = Date.now() - new Date(date).getTime();
        if (isFinite(ageMs) && ageMs > CONSENT_TTL_MS) {
          return null;
        }
      }
      return value;
    } catch (e) {
      return null;
    }
  }

  /** Persist consent state. */
  function writeStatus(value) {
    try {
      localStorage.setItem(CONSENT_KEY, value);
      localStorage.setItem(CONSENT_DATE_KEY, new Date().toISOString());
    } catch (e) {}
  }

  /** Update Google Consent Mode v2 to match the user's choice. */
  function updateConsentMode(value) {
    try {
      if (typeof window.gtag !== "function") return;
      if (value === "accepted") {
        window.gtag("consent", "update", {
          ad_storage: "granted",
          ad_user_data: "granted",
          ad_personalization: "granted",
          analytics_storage: "granted",
        });
      } else {
        window.gtag("consent", "update", {
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
          analytics_storage: "denied",
        });
      }
    } catch (e) {}
  }

  /** Expire all GA / Ads cookies on every plausible domain. */
  function deleteGaCookies() {
    try {
      var hostname = window.location.hostname;
      var domains = {};
      domains[hostname] = true;
      domains["." + hostname] = true;
      var parts = hostname.split(".");
      if (parts.length > 2) {
        var apex = parts.slice(-2).join(".");
        domains[apex] = true;
        domains["." + apex] = true;
      }
      var expiry = "Thu, 01 Jan 1970 00:00:00 GMT";
      for (var i = 0; i < GA_COOKIE_NAMES.length; i++) {
        var name = GA_COOKIE_NAMES[i];
        for (var domain in domains) {
          if (Object.prototype.hasOwnProperty.call(domains, domain)) {
            document.cookie =
              name + "=; expires=" + expiry + "; path=/; domain=" + domain;
          }
        }
        document.cookie = name + "=; expires=" + expiry + "; path=/";
      }
    } catch (e) {}
  }

  /** Load gtag.js + GTM + fire the Ads conversion event. */
  function loadTrackers() {
    if (trackersLoaded) return;
    trackersLoaded = true;

    // gtag.js
    var gtagScript = document.createElement("script");
    gtagScript.async = true;
    gtagScript.src =
      "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    gtagScript.onload = function () {
      try {
        window.gtag("js", new Date());
        window.gtag("config", GA_ID);
        window.gtag("config", ADS_ID);
        // The original site fired this conversion on every page load
        // because it's wired up to the sign-up landing page. Mirror that
        // behaviour, but only post-consent.
        window.gtag("event", "conversion", {
          send_to: ADS_CONVERSION,
        });
      } catch (e) {}
    };
    document.head.appendChild(gtagScript);

    // GTM
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
      var f = d.getElementsByTagName(s)[0];
      var j = d.createElement(s);
      var dl = l !== "dataLayer" ? "&l=" + l : "";
      j.async = true;
      j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, "script", "dataLayer", GTM_ID);

    // GTM <noscript> iframe — added only post-consent so the static
    // markup audit doesn't flag it. Most users have JS, but match the
    // original install behaviour for the few who don't (yet still
    // accepted via this same page through JS).
    var ns = document.createElement("noscript");
    var ifr = document.createElement("iframe");
    ifr.src = "https://www.googletagmanager.com/ns.html?id=" + GTM_ID;
    ifr.height = "0";
    ifr.width = "0";
    ifr.style.display = "none";
    ifr.style.visibility = "hidden";
    ns.appendChild(ifr);
    document.body.appendChild(ns);
  }

  function showBanner() {
    if (!banner) return;
    banner.hidden = false;
    banner.classList.add("cookie-banner--visible");
  }

  function hideBanner() {
    if (!banner) return;
    banner.classList.remove("cookie-banner--visible");
    banner.hidden = true;
  }

  function accept() {
    writeStatus("accepted");
    updateConsentMode("accepted");
    loadTrackers();
    hideBanner();
  }

  function reject() {
    writeStatus("declined");
    updateConsentMode("declined");
    deleteGaCookies();
    hideBanner();
  }

  function openSettings() {
    showBanner();
  }

  function init() {
    banner = document.getElementById("cookie-banner");
    if (!banner) return;

    var acceptBtn = document.getElementById("cookie-banner-accept");
    var rejectBtn = document.getElementById("cookie-banner-reject");
    if (acceptBtn) acceptBtn.addEventListener("click", accept);
    if (rejectBtn) rejectBtn.addEventListener("click", reject);

    var status = readStatus();
    if (status === "accepted") {
      updateConsentMode("accepted");
      loadTrackers();
    } else if (status === "declined") {
      updateConsentMode("declined");
    } else {
      showBanner();
    }
  }

  window.GlowOutConsent = {
    accept: accept,
    reject: reject,
    openSettings: openSettings,
    status: readStatus,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
