# Request form setup (Google Apps Script)

The website's request form sends to a small script that runs in Hailey's Google
Workspace account. For each request it:

- adds a row to a Google Sheet called **Website requests: Paws, Play & Stay with Hailey**,
- emails the request to Hailey at hnardone@pawsplaystaywithhailey.com, cc dillon@dillonmakes.tech (pressing Reply answers the customer),
- emails the customer a copy, sent from Hailey's address.

It's free. A Workspace account can send about 1,500 emails a day.

## One-time setup (about 10 minutes)

1. **Sign in as Hailey** at <https://script.google.com>. Use her Workspace
   account, because emails will come from whichever account sets this up.
2. Click **New project**. Click "Untitled project" at the top and rename it
   **Website request form**.
3. Delete everything in `Code.gs`. Paste in the full contents of
   [`apps-script/Code.gs`](Code.gs) from this repo, then press **Save** (the disk icon).
   - Optional: the settings at the top (`CONFIG`) control who gets emails, the cc,
     and the message customers receive. `SEND_TO` is already set to hnardone@pawsplaystaywithhailey.com.
4. **Run setup once.** In the toolbar, choose **setup** from the function menu
   and press **Run**.
   - Google asks for permission. Click **Review permissions**, choose Hailey's
     account, then **Allow**. It needs permission to send email as her, create
     the Sheet and keep a small counter that limits repeat requests.
   - If you see "Google hasn't verified this app", click **Advanced**, then
     **Go to Website request form**. It's her own script, so this is expected.
   - When it finishes, Hailey gets a "Website form is set up" email with a link to the Sheet.
5. **Publish it as a web app.** Click **Deploy**, then **New deployment**. Click the gear next
   to "Select type" and choose **Web app**.
   - Description: `Website form`
   - Execute as: **Me** (Hailey's account)
   - Who has access: **Anyone**. This lets the public website send to it,
     and it only accepts form submissions.
   - Click **Deploy**, then copy the **Web app URL**. It ends in `/exec`.
6. **Connect the site.** Paste that URL into `FORM_ENDPOINT` in `js/config.js`,
   or send it to Dillon or Claude to do. Then send a test request from the live site.

If step 5 says Hailey's organization doesn't allow sharing with "Anyone", a
Workspace admin needs to allow it at admin.google.com: **Apps → Google Workspace →
Drive and Docs → Sharing settings**. Allow sharing outside the organization.

## Changing the script later

Edit `Code.gs`, save, then **Deploy → Manage deployments → pencil icon →
Version: New version → Deploy**. The web app URL stays the same, so the
website doesn't need changing.

## Checking it's alive

Open the web app URL in a browser. It should show
`{"ok":true,"service":"Paws, Play & Stay with Hailey request form"}`.

## Spam

- Requests that fill the hidden "honeypot" field, or contain links or words like
  "crypto", still reach Hailey but are marked **[Possible spam]**. The customer
  copy is skipped for these.
- One email address can send at most 5 requests in 10 minutes.
- The site also blocks sends within 3 seconds of the page loading.
