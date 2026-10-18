# AI-AURA — PUC College Event Website (MERN)

Event date: 6 November 2026 (Friday) · 18 events · PUC students only.

## Two portals
- **Student portal** — http://localhost:3000
  Event list, announcements, countdown, registration form (with optional team name).
- **Admin portal** — http://localhost:3000/admin
  Login, dashboard counts (students, teams, colleges), registrations table, reports
  (CSV download + print/PDF), announcements and event date/time/venue.

Admin login is set in `backend/.env`:
```
ADMIN_USERNAME=SachinRS@143
ADMIN_PASSWORD=Irana@123
JWT_SECRET=...change this to a long random string...
```
Username is not case-sensitive; the password is. Change these before going live.

## How to Run
1. Start MongoDB locally:  `mongod`
2. Backend:
   ```
   cd backend
   npm install
   npm run dev        # http://localhost:5000
   ```
3. Frontend (new terminal):
   ```
   cd frontend
   npm install
   npm start          # http://localhost:3000
   ```
4. Student portal: http://localhost:3000 · Admin portal: http://localhost:3000/admin

## What's new
- 18 talent events (Quiz, Dance, Pencil Sketch ... Solo Instrumental), each with a React Icon (`frontend/src/data/events.js`).
- Home page poster pop-up for AI-AURA 2K26 (`components/PosterPopup.js`): appears 3s after load, stays 12s, repeats every 40s. Edit the three numbers at the top of the file.
- College photo as a 3D tilting background in the top banner (`components/Hero.js`).
- Expert Seminars slider (auto-slides every 10s, swipe/arrows/dots) and Campus Moments photos (`components/CollegeGallery.js`, `data/gallery.js`, images in `public/images/gallery/`).

- Rules & Regulations section (`components/RulesSection.js`, `data/rules.js`): all 18 events with rules, filters, general rules, prizes, contacts, PDF download (`public/downloads/`), Google Drive link and both college websites (klebcamahalingpur.com, klebbamahalingpur.com).
- Default event date is now 6 Nov 2026 (as per the brochure). The admin can still change it.

- Impact redesign: sticky nav with scroll progress, moving event ribbon, animated counters, scroll-reveal animations, "Find your event" picker, colourful event tiles that open a swipeable rules sheet (`components/EventExplorer.js`, `StickyNav.js`, `Marquee.js`, `StatsBand.js`).

- Design system: Electric Indigo #4F46E5, Violet #8B5CF6, Cyan #06B6D4, Navy #0F172A on Soft White #F8FAFC, Inter font, Lucide icons (`lucide-react`), light theme by default with a working dark mode toggle (bottom-right button, remembered on the device). Colour tokens live at the top of `frontend/src/App.css`.
- Admin Overview now has a registrations-over-time chart built from real registration dates.

- Obsidian identity (dark by default, light optional): Obsidian #0B0D12, Midnight Navy #111827, Electric Blue #4F7CFF, Vivid Violet #8B5CF6, Neon Cyan #36E4FF, Soft White #F5F7FF, Muted #9CA3AF. Tokens at the top of `frontend/src/App.css`.
- Live registration pop-ups (`components/LiveRegistrations.js`): rotate through the latest real registrations (first name + college + event only) using the public `GET /api/registrations/recent`. Nothing shows when there are no registrations. Email, phone and roll number are never exposed.
- After a successful registration a confirmation modal appears. The old text promised an email, but the backend sends none, so the message was corrected.

## 3D
Real WebGL 3D (three.js, installed by `npm install`): floating 3D shapes behind the hero title,
a drag-to-rotate 3D campus panel with your photo, 3D extruded title, and cards that lean toward
the pointer. If a device has no WebGL, the site falls back to a flat tilt card automatically.
Code: `frontend/src/scenes3d.js`.

## Make it yours
- **College photo:** your photo is already at `frontend/public/images/campus.jpg`. It shows in the
  3D campus card, the *Clear view* (normal, uncropped photo) and as the hero background.
  To use a sharper photo, replace that file (keep the name `campus.jpg`).
- **Social links:** log in to /admin → *Event info* → fill Instagram / YouTube / Facebook / LinkedIn /
  Website. They appear on the student portal instantly (blank links stay hidden).
- **Certificate courses:** the semester lists in `frontend/src/data/college.js` are *sample entries* —
  replace them with the courses your college actually runs.

## Notes
- Icons come from `react-icons` (Font Awesome 6 set), installed by `npm install`.
- A "team" = students registering for the same event with the same team name.
- "Students" counts unique email addresses; "Colleges" counts unique college names.

## API
| Method | Route | Access |
|---|---|---|
| POST | /api/registrations | public |
| GET / DELETE | /api/registrations | admin |
| POST | /api/auth/login | public |
| GET | /api/announcements, /api/settings | public |
| POST / PUT / DELETE | /api/announcements, PUT /api/settings | admin |
