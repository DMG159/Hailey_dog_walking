/**
 * Paws, Play & Stay with Hailey: website request form handler.
 *
 * Runs in Hailey's Google Workspace account (script.google.com) as a web app.
 * For each request sent from the website it:
 *   1. adds a row to a Google Sheet ("Website requests"),
 *   2. emails the request to Hailey (cc Dillon), with Reply going to the customer,
 *   3. emails the customer a copy, sent from Hailey's own address.
 *
 * Setup steps: see apps-script/SETUP.md in the website repo.
 * After editing this file: Deploy > Manage deployments > Edit > Version: New version.
 */

const CONFIG = {
  // Where requests go (Hailey). Leave blank to use the Google account that deploys this script.
  SEND_TO: 'hnardone@pawsplaystaywithhailey.com',
  // Copied on every request. Comma-separate several addresses, or leave blank.
  CC: 'dillon@dillonmakes.tech',

  BUSINESS_NAME: 'Paws, Play & Stay with Hailey',
  WEBSITE: 'https://pawsplaystaywithhailey.com/',

  // Send the customer a copy of their request.
  CUSTOMER_COPY: true,
  CUSTOMER_MESSAGE:
    "Thanks for reaching out! Here's a copy of your request. " +
    "I'll get back to you soon to confirm. Questions in the meantime? Just reply to this email.",

  // Requests containing any of these (not case-sensitive) are still delivered to
  // Hailey, but marked "Possible spam" and the customer copy is skipped.
  SPAM_WORDS: ['seo services', 'backlinks', 'crypto', 'bitcoin', 'casino', 'http://', 'https://', 'www.'],

  // Most requests one email address can send in 10 minutes.
  MAX_PER_10_MIN: 5,
};

// Form fields, in the order they appear in emails and the Sheet.
const FIELDS = [
  ['service', 'Service'],
  ['pet_type', 'Type of pet'],
  ['number_of_pets', 'Number of pets'],
  ['start_date', 'Start date'],
  ['end_date', 'End date'],
  ['preferred_time', 'Preferred time'],
  ['bathing_add_on', 'Bath add-on'],
  ['recurring_weekly', 'Repeat every week'],
  ['name', 'Name'],
  ['phone', 'Phone'],
  ['email', 'Email'],
  ['address', 'Home address'],
  ['emergency_contact', 'Emergency contact'],
  ['pet_name_breed_age', "Pet's name, breed & age"],
  ['pet_weight', 'Weight'],
  ['feeding_schedule', 'Feeding schedule'],
  ['medical_conditions', 'Allergies or medical conditions'],
  ['medication_instructions', 'Medication instructions'],
  ['temperament', 'Temperament & behavior'],
  ['exercise_needs', 'Exercise needs & restrictions'],
  ['compatibility', 'Compatibility with other animals'],
  ['vet_info', 'Veterinary information'],
  ['message', 'Special instructions or questions'],
];

/** Website form posts here. */
function doPost(e) {
  try {
    const p = (e && e.parameter) || {};
    const data = {};
    FIELDS.forEach(([key]) => { data[key] = clean_(p[key]); });

    if (!data.name || !isEmail_(data.email)) return json_({ ok: false, error: 'missing' });
    if (tooMany_(data.email)) return json_({ ok: false, error: 'rate' });

    const text = FIELDS.map(([key]) => data[key]).join(' ').toLowerCase();
    const reasons = [];
    if (clean_(p._honey)) reasons.push('hidden anti-spam field was filled');
    CONFIG.SPAM_WORDS.forEach((w) => { if (text.indexOf(w) !== -1) reasons.push('contains "' + w + '"'); });
    const spam = reasons.length ? reasons.join(', ') : '';

    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try { addRow_(data, spam); } finally { lock.releaseLock(); }

    emailHailey_(data, spam);
    if (CONFIG.CUSTOMER_COPY && !spam) emailCustomer_(data);

    return json_({ ok: true });
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    return json_({ ok: false, error: 'server' });
  }
}

/** Opening the web app URL in a browser just confirms it's running. */
function doGet() {
  return json_({ ok: true, service: CONFIG.BUSINESS_NAME + ' request form' });
}

/**
 * Run once from the editor (select "setup", press Run). It asks for permission,
 * creates the Sheet and emails you a test so you know mail works.
 */
function setup() {
  const sheet = sheet_();
  const owner = owner_();
  MailApp.sendEmail({
    to: owner,
    subject: 'Website form is set up: ' + CONFIG.BUSINESS_NAME,
    htmlBody:
      '<p>The website request form is connected to this account.</p>' +
      '<p>Requests will be logged here: <a href="' + sheet.getParent().getUrl() + '">' +
      esc_(sheet.getParent().getName()) + '</a></p>' +
      '<p>Emails left today: ' + MailApp.getRemainingDailyQuota() + '</p>',
    name: CONFIG.BUSINESS_NAME,
  });
  console.log('Sheet: ' + sheet.getParent().getUrl());
  console.log('Test email sent to ' + owner);
}

/* ---------------- helpers ---------------- */

function owner_() {
  return CONFIG.SEND_TO || Session.getEffectiveUser().getEmail();
}

function clean_(v) {
  return String(v == null ? '' : v).replace(/\r\n/g, '\n').trim().slice(0, 5000);
}

function isEmail_(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function esc_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/\n/g, '<br>');
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function tooMany_(email) {
  const cache = CacheService.getScriptCache();
  const key = 'rl_' + Utilities.base64EncodeWebSafe(email.toLowerCase()).slice(0, 200);
  const count = Number(cache.get(key) || 0) + 1;
  cache.put(key, String(count), 600);
  return count > CONFIG.MAX_PER_10_MIN;
}

/** The "Website requests" Sheet, created on first use. */
function sheet_() {
  const props = PropertiesService.getScriptProperties();
  let ss = null;
  const id = props.getProperty('SHEET_ID');
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; } }
  if (!ss) {
    ss = SpreadsheetApp.create('Website requests: ' + CONFIG.BUSINESS_NAME);
    props.setProperty('SHEET_ID', ss.getId());
    const sh = ss.getSheets()[0];
    sh.setName('Requests');
    sh.appendRow(['Received', 'Flag'].concat(FIELDS.map(([, label]) => label)));
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, FIELDS.length + 2).setFontWeight('bold');
  }
  return ss.getSheets()[0];
}

function addRow_(data, spam) {
  sheet_().appendRow([new Date(), spam ? 'Possible spam: ' + spam : ''].concat(FIELDS.map(([key]) => data[key])));
}

function table_(data) {
  const rows = FIELDS.filter(([key]) => data[key]).map(([key, label]) =>
    '<tr><th align="left" valign="top" style="padding:6px 12px 6px 0;color:#5b3a2b;white-space:nowrap">' +
    esc_(label) + '</th><td style="padding:6px 0">' + esc_(data[key]) + '</td></tr>');
  return '<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">' + rows.join('') + '</table>';
}

function emailHailey_(data, spam) {
  const to = owner_();
  const cc = CONFIG.CC.split(',').map((s) => s.trim())
    .filter((s) => s && s.toLowerCase() !== to.toLowerCase()).join(',');
  const subject = (spam ? '[Possible spam: ' + spam + '] ' : '') + 'New request' +
    (data.service ? ': ' + data.service : '') + ' from ' + data.name;
  const msg = {
    to: to,
    replyTo: data.email,
    subject: subject,
    name: 'Website request form',
    htmlBody:
      '<p style="font-family:Arial,sans-serif">New request from the website. Press Reply to answer ' +
      esc_(data.name) + ' directly.</p>' +
      (spam ? '<p style="font-family:Arial,sans-serif;color:#a12c1b"><b>Flagged as possible spam:</b> ' + esc_(spam) +
        '. No copy was sent to the customer. If it\'s a real request, just reply.</p>' : '') +
      table_(data),
  };
  if (cc) msg.cc = cc;
  MailApp.sendEmail(msg);
}

function emailCustomer_(data) {
  MailApp.sendEmail({
    to: data.email,
    replyTo: owner_(),
    name: CONFIG.BUSINESS_NAME,
    subject: 'We got your request! ' + CONFIG.BUSINESS_NAME,
    htmlBody:
      '<div style="font-family:Arial,sans-serif;font-size:15px;color:#3a2a22">' +
      '<p>Hi ' + esc_(data.name.split(' ')[0]) + ',</p>' +
      '<p>' + esc_(CONFIG.CUSTOMER_MESSAGE) + '</p>' +
      '<p style="margin-top:20px"><b>Your request</b></p>' + table_(data) +
      '<p style="margin-top:20px">Hailey<br>' + esc_(CONFIG.BUSINESS_NAME) + '<br>' +
      '<a href="' + CONFIG.WEBSITE + '">pawsplaystaywithhailey.com</a></p>' +
      '</div>',
  });
}
