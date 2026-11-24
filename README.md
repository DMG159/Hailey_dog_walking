# Paws, Play & Stay with Hailey: website

A static one-page site for Paws, Play & Stay with Hailey (dog walking, pet sitting and boarding in
Boulder, CO). It's hosted free on GitHub Pages at its own domain:
https://pawsplaystaywithhailey.com/ (the old dmg159.github.io address redirects there)

## Settings to fill in: `js/config.js`

| Setting | What it does | Where to get it |
|---|---|---|
| `GOATCOUNTER_CODE` | Cookieless analytics plus form events (`form_start`, `generate_lead`, `form_error`). Nothing loads while it's empty. | Free signup at goatcounter.com |
| `FORM_ENDPOINT` | The request form's Google Apps Script web app URL. It emails Hailey from her Workspace account (cc Dillon), logs a Google Sheet row and sends the customer a copy. While it's empty, the form asks visitors to call or text. | Follow [apps-script/SETUP.md](apps-script/SETUP.md) |
| `PHONE`, `EMAIL` | Shown in the Contact section and form messages. Each is hidden while empty. The phone is intentionally left empty so it isn't published. | Hailey |
| `GOOGLE_REVIEW_URL` | Shows the "Leave a Google review" button | Hailey's Google Business Profile |

Once the email is known, also add `"email"` to the JSON-LD block in `index.html`.

## Photos
The 15 photos Jeffrey sent (IMG_0631–0646) are in `images/`: trimmed of phone screenshot bars, resized and saved as JPG. `hailey-portrait` is Meet Hailey, `mealtime-heart` is the updates section and `gallery-*` is the gallery. The gallery is a swipeable carousel. To add a photo, copy one `<figure>` inside `#gallery-track` and change `src`, `alt` and the caption; the dots update on their own. Only post clients' pets with their permission.

## Still needed from Hailey
- Real testimonials: search `REVIEWS`
- The cancellation policy: search `TODO`

## Updating CSS or JS
After changing `css/styles.css` or anything in `js/`, bump the `?v=` date in the `<link>`/`<script>` tags in `index.html` so phones don't keep an old cached copy.

## Style
It matches Hailey's business card and flyer. From the card: the Shrikhand script, the orange, peach and mustard stripes, and olive. From the flyer: forest green, cream, mountain ridges and the Kalam handwritten tagline. Body text is Quicksand. The colors are CSS variables at the top of `css/styles.css`.

## Domain
pawsplaystaywithhailey.com is registered through Hailey's Google Workspace (managed at Squarespace Domains). Its DNS points at GitHub Pages:
A records on `@` to 185.199.108.153, .109.153, .110.153, .111.153, and a CNAME `www` → `dmg159.github.io`.
The `CNAME` file in this repo tells GitHub Pages to serve the site there. Leave the Google Workspace MX, SPF, DKIM and DMARC records alone; they run Hailey's email.
