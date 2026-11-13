# Oumar Bagayoko — Portfolio + Backend

A static portfolio with a small backend that adds:

- A contact form that stores messages in a database (replaces Formspree)
- Spam protection (honeypot + rate limiting)
- An admin panel at `/admin.html` with an inbox and content editors
- Editable site content: profile, skills, education, experience, languages, certifications, footer links

The site keeps working as plain HTML if the API is unavailable. The admin panel is the only part that requires the backend.

## How it runs

| Piece | Local development | Production (Vercel) |
| --- | --- | --- |
| Website | `index.html`, `styles.css`, `script.js` | same files, served statically |
| API | `npm run dev` (Node) | `api/` serverless functions |
| Database | SQLite file in `data/portfolio.db` | Turso (hosted SQLite) |

## 1. Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
cp .env.example .env
```

Edit `.env` and set at least:

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=choose-a-long-password
SESSION_SECRET=some-long-random-string-at-least-32-chars
```

Start the app:

```bash
npm run dev
```

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin.html

The database and tables are created automatically on the first request. `data/` is ignored by git, so messages stay on your machine.

## 2. Deploy to Vercel

GitHub Pages cannot run Node.js or store form submissions. Keep the repository on GitHub and let Vercel deploy from it:

1. Database: `oumar-jason989` on Turso — `libsql://oumar-jason989.aws-ap-south-1.turso.io`.
2. Create a database token: `turso db tokens create oumar-jason989` (or **Turso dashboard → oumar-jason989 → Create Token**).
3. In Vercel: **Add New → Project → import this GitHub repository**. Framework preset: **Other**. No build command.
4. Add these Environment Variables in Vercel (Production + Preview):

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=choose-a-long-password
SESSION_SECRET=some-long-random-string-at-least-32-chars
TURSO_DATABASE_URL=libsql://oumar-jason989.aws-ap-south-1.turso.io
TURSO_AUTH_TOKEN=the-token-from-step-2
```

5. Deploy. Tables are created automatically on the first API request.

Every push to `main` on GitHub redeploys the site automatically. The custom domain can be pointed at Vercel in **Settings → Domains**.

### Notes

- `ADMIN_PASSWORD` is the only required secret for the admin panel. Use a long, unique password; logins are rate limited.
- `SESSION_SECRET` signs the 12-hour admin session cookie. If omitted it falls back to `ADMIN_PASSWORD`.
- `IP_SALT` is optional. It salts the hashed visitor IPs used for rate limiting.
- Never commit `.env` or the `data/` folder.

## 3. Using the admin panel

Open `/admin.html` and sign in with `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

- **Inbox** — every contact form submission. Open a message to read it, reply by email, copy the address, mark read/unread, archive, or delete. Unread count appears in the sidebar.
- **Content tabs** — edit the profile, skills, education, experience, languages, certifications and footer links. Each list has **Add**, **Move up/down** and **Remove** controls, then **Save changes**.
- **Profile photo** — in *Profile & About*, use **Upload photo** to replace the portrait; the image is resized in the browser, stored in the database and served from `/media`. You can also paste a path such as `profile-image.jpg` or a full `https://` URL. When you change the photo, regenerate `social-card.jpg` (1200×630) so link previews on WhatsApp and LinkedIn stay current.
- Links (CV, certificates, social profiles, images) accept a relative path such as `ATS_CV.pdf` or a full `https://` URL. Empty certificate links hide the button.
- Items appear on the site in the same order as the editor. An empty list hides that whole section on the public site.

Changes appear on the public site immediately after saving.

## API

All endpoints return JSON.

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/content` | public | Current site content |
| `PUT` | `/api/content` | admin | Save the whole content document |
| `POST` | `/api/contact` | public | Submit a contact message |
| `GET` | `/api/auth/me` | public | Current login state |
| `POST` | `/api/auth/login` | public | Sign in |
| `POST` | `/api/auth/logout` | public | Sign out |
| `GET` | `/api/messages?status=unread` | admin | List messages + counts |
| `PATCH` | `/api/messages` | admin | Body `{ "id": 1, "status": "read" }` |
| `DELETE` | `/api/messages?id=1` | admin | Delete a message |
| `POST` | `/api/assets` | admin | Body `{ "dataUrl": "data:image/..." }`, returns `{ url }` |
| `GET` | `/media?id=...` | public | Uploaded image bytes (cached for a year) |

Uploads live in the Turso `assets` table, so no extra storage service is needed. The admin resizes photos in the browser to 1400px and JPEG before sending, keeping each image well under the 2 MB limit.

## Project structure

```
api/            serverless functions (Vercel) + shared libs
  _lib/         database, auth, HTTP helpers, default content
admin.html      admin panel
admin.css
admin.js
index.html      public site
script.js       public site behaviour + content rendering
styles.css
server/dev.js   local dev server (static + API)
```
