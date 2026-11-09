# Rummy Scoreboard

A mobile-friendly Rummy score keeper. It works fully offline on one phone, and – once Firebase is set up – lets you create **online rooms** whose links you share on WhatsApp. Everyone with the **Edit link** can enter scores; the **View link** is watch-only. Scores appear on every phone live, without refreshing.

## Files

| File | What it is |
|---|---|
| `index.html` | The whole app (page, styles and code) |
| `firebase-config.js` | Your Firebase project settings – fill this in (step B6). Empty = offline only |
| `firestore.rules` | Database security rules – paste into Firebase (step B5) |
| `config/OurOtherSites.json` | The "Our Other Sites" list in the footer – edit freely |

---

## A. Put the site on GitHub Pages

1. **Create a GitHub account** (skip if you have one): go to <https://github.com/signup>, enter your email, a password and a username, then verify your email.
   Your site address will be `https://USERNAME.github.io/rummy/` – choose the username with that in mind.
2. **Create the repository**: on GitHub, click **+** (top right) → **New repository**.
   - Repository name: `rummy`
   - Visibility: **Public** (GitHub Pages on a free account needs a public repository)
   - Tick **Add a README file** is not needed – leave it unticked.
   - Click **Create repository**.
3. **Upload the files**: on the new repository page click **uploading an existing file** (or **Add file → Upload files**). Drag in `index.html`, `firebase-config.js`, `firestore.rules`, `README.md` **and the `config` folder** (drag the folder itself so `config/OurOtherSites.json` keeps its folder). Click **Commit changes**.
4. **Turn on Pages**: repository **Settings** → **Pages** (left menu) → under *Build and deployment*, Source: **Deploy from a branch**, Branch: **main**, folder **/ (root)** → **Save**.
5. Wait 1–2 minutes and open `https://USERNAME.github.io/rummy/`. Until step B6 is done the app works offline only – that's expected.

**Updating later:** open the file on GitHub → pencil icon (Edit) to change it, or **Add file → Upload files** with the same name to replace it → **Commit changes**. The site updates within a couple of minutes.

---

## B. Set up Firebase (free) for online rooms

You need a Google account. Everything below fits in Firebase's free **Spark** plan – no card needed.

1. **Create the project**
   - Go to <https://console.firebase.google.com> and sign in with your Google account.
   - Click **Create a project** (or **Add project**). Name: `rummy-scoreboard` (any name works).
   - Google Analytics: switch it **off** (not needed) → **Create project** → **Continue**.

2. **Register the web app**
   - On the project overview, click the **Web** icon `</>` (*Add app*).
   - App nickname: `Rummy`. Leave **Firebase Hosting** unticked (GitHub hosts the site) → **Register app**.
   - You'll see a `firebaseConfig = { apiKey: …, authDomain: …, … }` block. Keep this page open – you need it in step 6. (You can find it again any time under ⚙ **Project settings → General → Your apps**.)

3. **Turn on sign-in** (players never see a login – the app signs them in silently)
   - Left menu **Build → Authentication** → **Get started**.
   - **Sign-in method** tab → **Anonymous** → Enable → **Save**.
   - **Add new provider → Google** → Enable → choose your *Project support email* → **Save**.
   - **Settings** tab → **Authorized domains** → **Add domain** → `USERNAME.github.io` (your GitHub username) → **Add**. Without this, *Sign in with Google* won't work on your site.

4. **Create the database**
   - Left menu **Build → Firestore Database** → **Create database**.
   - Edition (if asked): **Standard**. Location: **asia-south1 (Mumbai)** – closest to India; it can't be changed later.
   - Start in **production mode** → **Create**.

5. **Add the security rules**
   - In Firestore, open the **Rules** tab, delete everything there, paste the whole contents of `firestore.rules` → **Publish**.
   - These rules are what keep rooms private: only people holding a room's link can read it, view links can't change anything, and resetting a link locks out the old one.

6. **Connect the app**
   - Open `firebase-config.js` (on GitHub: click it → pencil icon) and copy each value from the `firebaseConfig` block of step 2 into the matching line, e.g. `apiKey: "AIza…",`. Commit the change.
   - Open your site, refresh, and a **♥ Play Online** card appears at the top. Create a room to test it.

7. **Automatic clean-up (recommended)** – lets the database delete expired games and rooms on its own:
   - Open <https://console.cloud.google.com/firestore/databases>, choose your project, then the **(default)** database → **Time-to-live (TTL)** → **Create policy**.
   - Create four policies, each with timestamp field **`expireAt`**: collection group **`games`**, **`rooms`**, **`roomMembers`**, **`gameMembers`**.
   - If Google asks you to enable billing for this, you can skip it: the app also removes expired games itself whenever a room is opened.

Optional extra protection: Google Cloud console → **APIs & Services → Credentials** → your *Browser key* → **Application restrictions: Websites** → add `https://USERNAME.github.io/*`. The key is meant to be public, so this only stops other sites from using your free quota.

---

## How online rooms work

- **Create Room** (in *Play Online*) makes a room with three links: **Edit** (share with players), **View** (share with watchers) and **Owner** (keep to yourself – it brings back full control on any device).
- A room holds all your games; the room links open every game, including future ones. The owner can also make **Game links** that open one game only.
- **Guests** (no login): rooms are listed on that device; save the Owner link to get them back after clearing the browser. **Sign in with Google** to keep your rooms on your account across devices.
- **Deletion**: games are deleted after a period without activity – 7/30/90 days for guests, up to 1 year when signed in – and a room once it has no games left. Owners can choose *Only delete games marked as ended*, set a period per game, and (signed in) *Keep 1 more year*. Every delete has a 5-second Undo.
- **Export / Import Data** lets you tick exactly what to back up: this device's games and any of your rooms. Imported rooms come back with new links.
- Scores sync instantly; with a poor signal, changes are kept on the phone and sent when the connection returns.
