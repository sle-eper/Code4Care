# Code4Care — Patient Preference & Priority Engine

A full-stack web app for healthcare staff to create and use detailed patient preference profiles from day one.

## Stack

- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Node.js (Express)
- **Database**: SQLite (better-sqlite3)

## Run locally

1. **Backend** (creates `backend/data/code4care.db` and seeds default services + demo staff on first run):

   ```bash
   cd backend
   npm install
   npm run init-db   # optional, runs automatically on first start
   npm start         # http://localhost:3001
   ```

2. **Frontend** (proxies `/api` to the backend):

   ```bash
   cd frontend
   npm install
   npm run dev       # http://localhost:5173
   ```

3. Open **http://localhost:5173** in your browser.

## First login

On first run the app creates a single admin account: **admin / admin**. Log in, change the password if needed, then use the Admin dashboard to create services and register staff (nurses, doctors).

## Care profile (AI summary)

When you **register a new patient**, the app generates a short **care profile** for nurses. Configure one option in **`.env`** (then restart the backend). Priority: MiniMax → Groq → Claude → OpenAI.

- **MiniMax**: get a key at [platform.minimax.io](https://platform.minimax.io). Set `MINIMAX_API_KEY=your_key` in `.env`. Optionally `MINIMAX_GROUP_ID` if your account requires it.
- **Groq (FREE)**: no credit card. [console.groq.com](https://console.groq.com) → API Keys. Set `GROQ_API_KEY=your_key`.
- **Claude**: set `ANTHROPIC_API_KEY` (get key at [console.anthropic.com](https://console.anthropic.com)).
- **OpenAI**: set `OPENAI_API_KEY` and `OPENAI_API_URL=https://api.openai.com/v1/chat/completions`.

If none is set, the patient is still saved and a message asks to configure AI (see `HOW_TO_GET_API_KEY.md`).

## Features

- **Unique Medical ID**: Required and unique per patient; no duplicate IDs.
- **QR code**: Each patient profile has a QR code (ID, name, room, service, medical ID) for quick access.
- **Care profile (AI summary)**: Generated on the server when registering a patient (Cursor/OpenAI or Claude; see above).
- **Review all changes**: Full audit trail on each patient (create, updates, room change, transfer, status change, notes).
- **No archive**: Patient data is never archived. When a patient leaves, status is set to "Left hospital"; when they return, use **Find returning patient** (search by Medical ID or name) and **Reactivate** with a new room/service—no need to refill the form.
- **Admin**: Manage services (with colors), register staff, view stats (total/active patients, staff, services).
- **Nurses**: Register patients (full preference questionnaire), edit/transfer, find returning patient and reactivate; QR codes and audit trail.
- **Doctors**: View active patients, filter by service, search by name/ID/room, add clinical notes, view AI summaries.

Data is stored in **SQLite** (patients, audit trail, clinical notes, services, staff). Discharged patients stay in the same table with status "Discharged"; reactivation updates status and room/service and appends visit history.