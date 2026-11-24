# Paws, Play & Stay with Hailey: website

A static one-page site for Paws, Play & Stay with Hailey (dog walking, pet sitting and boarding in
Boulder, CO). It's hosted free on GitHub Pages:
https://dmg159.github.io/Hailey_dog_walking/

## Settings to fill in: `js/config.js`

| Setting | What it does | Where to get it |
|---|---|---|
| `GOATCOUNTER_CODE` | Cookieless analytics plus form events (`form_start`, `generate_lead`, `form_error`). Nothing loads while it's empty. | Free signup at goatcounter.com |
| `FORMSPREE_ID` | Sends the booking and contact forms to Hailey's email (free plan: 50/month). While it's empty, the forms point visitors to Instagram. | formspree.io → New form |
| `PHONE`, `EMAIL` | Shown in the Contact section. Each is hidden while empty. The phone is set; it's also hard-coded in the header, footer and JSON-LD. | Hailey |
| `GOOGLE_REVIEW_URL` | Shows the "Leave a Google review" button | Hailey's Google Business Profile |

Once the email is known, also add `"email"` to the JSON-LD block in `index.html`.

## Still needed from Hailey
- Photos: search `PHOTO` in `index.html` and put files in `images/`
- Real testimonials: search `REVIEWS`
- The cancellation policy: search `TODO`

## Style
It matches Hailey's business card and flyer. From the card: the Shrikhand script, the orange, peach and mustard stripes, and olive. From the flyer: forest green, cream, mountain ridges and the Kalam handwritten tagline. Body text is Quicksand. The colors are CSS variables at the top of `css/styles.css`.

## Moving to a custom domain
The card lists pawsplaystaywithhailey.com. It's registered but not pointed anywhere yet.
Replace `https://dmg159.github.io/Hailey_dog_walking/` everywhere (index.html,
robots.txt, sitemap.xml), add a `CNAME` file, and set the domain under
Settings → Pages. robots.txt only takes effect at a domain's root.
