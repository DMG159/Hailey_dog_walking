/* =====================================================================
   SITE SETTINGS: fill these in. Anything left empty stays switched off.
   ===================================================================== */
window.SITE_CONFIG = {
  // GoatCounter site code (cookieless analytics, no cookie banner needed).
  // Sign up free at https://www.goatcounter.com. If your dashboard is
  // https://haileyspetcare.goatcounter.com, the code is "haileyspetcare".
  // Leave empty and no analytics loads.
  GOATCOUNTER_CODE: "",

  // Where the request form sends, via FormSubmit (https://formsubmit.co):
  // free, no account, no monthly limit. The first time someone submits,
  // FormSubmit emails FORM_EMAIL a one-time activation link. Click it and
  // requests arrive from then on. Changing FORM_EMAIL means activating again.
  // To send requests to Hailey: put her address in FORM_EMAIL and leave
  // FORM_CC as Dillon's so he still gets a copy.
  FORM_EMAIL: "dillon@dillonmakes.tech",
  FORM_CC: "dillon@dillonmakes.tech",   // comma-separate several; skipped if same as FORM_EMAIL

  // Auto-reply sent to the customer with a copy of their request.
  AUTORESPONSE: "Thanks for reaching out to Paws, Play & Stay with Hailey! Here's a copy of your request. Hailey will get back to you soon to confirm. Questions in the meantime? Call or text 609-218-0968.",

  // Spam filter: FormSubmit drops any request containing one of these words or
  // phrases (not case-sensitive). "http", "https" and "www." block web links.
  BLOCKED_WORDS: [
    "SEO services", "backlinks", "crypto", "bitcoin", "casino",
    "http", "https", "www.",
  ],

  // Hailey's contact details. Leave empty to hide that option on the site.
  PHONE: "609-218-0968",
  EMAIL: "",        // e.g. "hailey@example.com"

  // Link to Hailey's Google review page (from her Google Business Profile).
  // Leave empty to hide the "Leave a review" button.
  GOOGLE_REVIEW_URL: "",

  INSTAGRAM: "hailey.nardone"
};
