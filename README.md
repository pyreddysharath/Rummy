# RummyTally

A mobile-friendly Rummy score keeper. It works fully offline on one phone, and – once Firebase is set up – lets you create **online rooms** whose links you share on WhatsApp. Everyone with the **Edit link** can enter scores; the **View link** is watch-only. Scores appear on every phone live, without refreshing.

## Files

| File | What it is |
|---|---|
| `index.html` | The whole app (page, styles and code) |
| `sw.js` | Lets the installed app open without a connection (must stay in the main folder) |
| `CNAME` | The site's domain for GitHub Pages |
| `ads.txt` | Google AdSense publisher record (must stay in the main folder) |
| `js/firebase-config.js` | Your Firebase project settings (step A6). Empty = offline only |
| `firebase/firestore.rules` | Database security rules – paste into Firebase (step A5) |
| `assets/manifest.webmanifest`, `assets/icons/` | App name and icons for "Install App" and the browser tab |

To change the app, edit `index.html` (on GitHub: open it → pencil icon → **Commit changes**). The live site updates within a couple of minutes.

---

## A. Set up Firebase (free) for online rooms

You need a Google account. Everything below fits in Firebase's free **Spark** plan – no card needed.

1. **Create the project**
   - Go to <https://console.firebase.google.com> and sign in.
   - **Create a project** (or **Add project**). Name: `rummytally` (any name works).
   - Google Analytics: switch it **off** → **Create project** → **Continue**.

2. **Register the web app**
   - On the project overview, click the **Web** icon `</>` (*Add app*).
   - App nickname: `RummyTally`. Leave **Firebase Hosting** unticked (GitHub hosts the site) → **Register app**.
   - You'll see a `firebaseConfig = { apiKey: …, authDomain: …, … }` block – you need it in step 6. (It's also under ⚙ **Project settings → General → Your apps**.)

3. **Turn on sign-in** (players never see a login – the app signs them in silently)
   - **Build → Authentication** → **Get started**.
   - **Sign-in method** → **Anonymous** → Enable → **Save**.
   - **Add new provider → Google** → Enable → choose a *Project support email* → **Save**.
   - **Settings → Authorized domains → Add domain**: add your site's domain (for example `rummytally.com`) once you have it (see B4).

4. **Create the database**
   - **Build → Firestore Database** → **Create database**.
   - Edition (if asked): **Standard**. Location: **asia-south1 (Mumbai)** – it can't be changed later.
   - Start in **production mode** → **Create**.

5. **Add the security rules**
   - Firestore → **Rules** tab → delete everything → paste the whole of `firebase/firestore.rules` → **Publish**.
   - These rules keep rooms private: only people holding a room's link can read it, view links can't change anything, and resetting a link locks out the old one.

6. **Connect the app**
   - Copy each value from the `firebaseConfig` block of step 2 into the matching line of `js/firebase-config.js`, e.g. `apiKey: "AIza…",` → commit.
   - Open the site, refresh, tap **＋ New Room**, give it a name and tap **Create Room** to test it.

7. **Automatic clean-up (optional)** – lets the database delete expired games and rooms on its own:
   - <https://console.cloud.google.com/firestore/databases> → your project → **(default)** → **Time-to-live (TTL)** → **Create policy**.
   - Four policies, each with timestamp field **`expireAt`**: collection groups **`games`**, **`rooms`**, **`roomMembers`**, **`gameMembers`**.
   - If Google asks for billing, skip it: the app also removes expired games itself whenever a room is opened.

---

## B. Publish the site on your domain

1. **Make the repository public**: GitHub → this repo → **Settings → General → Danger Zone → Change visibility → Public** (GitHub Pages on a free account needs a public repo).
2. **Turn on Pages**: **Settings → Pages** → Source: **Deploy from a branch**, Branch: **main**, folder **/ (root)** → **Save**.
3. **Custom domain**: in the same Pages screen, type your domain (e.g. `rummytally.com`) under **Custom domain** → **Save**. GitHub shows the DNS records to add at your domain seller:
   - four **A** records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - a **CNAME** record for `www` pointing to `pyreddysharath.github.io`
   
   When the check turns green (can take up to a day), tick **Enforce HTTPS**.
4. **Firebase sign-in on the domain**: Firebase → **Authentication → Settings → Authorized domains** → add the domain (and `www.` version).
5. **Optional extra protection**: Google Cloud console → **APIs & Services → Credentials** → *Browser key* → **Application restrictions: Websites** → add `https://rummytally.com/*` and `https://www.rummytally.com/*`. The key is meant to be public; this only stops other sites using your free quota.

---

## How online rooms work

- **Home** shows two big buttons: **New Game** and **My Rooms**. Tapping one moves them into a slim top bar (with Back to Home); the app reopens on the same screen after a refresh. If a game is open, Home also shows **Continue**.
- **New Game** asks for the room (pick one, or **＋ Create a new room** – name it after the occasion), the game name, players and Game Rules. Sharing:
  - **One game** – the share button next to Scoreboard, or the share icon beside a game in My Rooms. The person sees only that game.
  - **Whole room** – the share icon beside the room in My Rooms. The person sees every game, including new ones.
  - Each has an **Edit** link (enter scores) and a **View** link (watch only). Anyone with edit access can share; view-only people can't.
- **My Rooms** lists rooms newest first (*Created by me* / *Shared with me*), each with its games newest first. The bin deletes a room or a game, with a 5-second Undo; deleting a room's last game deletes the room too.
- **Guests** (no login): rooms are listed on that device. **Sign in with Google** from the menu (top right) to keep your rooms on your account across devices.
- **Deletion**: the same for everyone – a game is deleted after 90 days without play, and a room once it has no games left.
- **Export / Import Data** lets you tick exactly what to back up: this device's games and any of your rooms. Imported rooms come back with new links.
- Scores sync instantly; with a poor signal, changes are kept on the phone and sent when the connection returns.
