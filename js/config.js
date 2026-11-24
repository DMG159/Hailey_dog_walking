/* =====================================================================
   SITE SETTINGS: fill these in. Anything left empty stays switched off.
   ===================================================================== */
window.SITE_CONFIG = {
  // Google Tag Manager container (GA4 is configured inside Tag Manager).
  // Sets cookies, so it only loads after a visitor clicks Accept on the
  // cookie banner. Leave empty to turn off analytics and the banner.
  GTM_ID: "GTM-K3LM7257",

  // Request form: the Google Apps Script web app URL (ends in /exec).
  // See apps-script/SETUP.md. Requests are emailed from Hailey's Google
  // Workspace account (cc Dillon), logged to a Google Sheet, and the customer
  // gets a copy. Leave empty and the form asks visitors to call/text instead.
  FORM_ENDPOINT: "https://script.google.com/macros/s/AKfycbwaVjO66wFr6s6OXCTSfoJoZKs6QMVmPoLgBrBGznwW17JdUoRpcC1KprLf0ORPVSmMmg/exec",

  // Hailey's contact details. Leave empty to hide that option on the site.
  PHONE: "",        // left empty on purpose so no number is published
  EMAIL: "",        // e.g. "hailey@example.com"

  // Link to Hailey's Google review page (from her Google Business Profile).
  // Leave empty to hide the "Leave a review" button.
  GOOGLE_REVIEW_URL: "",

  INSTAGRAM: "hailey.nardone"
};
