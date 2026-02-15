# Code4Care — Application Flow

## 1. Entry & roles

```
Browser → Login (username + password)
    → Backend POST /api/auth/login
    → Returns user: { id, name, role, serviceId }
    → App shows role-specific dashboard
```

| Role   | Dashboard        | Main actions |
|--------|------------------|--------------|
| Admin  | AdminDashboard   | Services, staff (add/edit/remove), stats |
| Nurse  | NurseDashboard   | Register patients, edit, transfer, reactivate, QR, audit |
| Doctor | DoctorDashboard | View patients, filter, search, add clinical notes |

---

## 2. Nurse: patient registration flow (two steps)

```
Nurse clicks "Register new patient"
    → Modal opens → Step 1: "Enter Medical ID" + [Continue]

[Continue] → GET /api/patients/lookup?medicalId=xxx
    ├─ Found → "Patient already registered" + [Open profile] → close modal, open patient detail
    └─ Not found → Step 2: Basic form only (Medical ID read-only, Name, Age, Gender, Room, Service)
                   → [Register patient] → POST /api/patients (no AI summary yet)
                   → Alert: "Open at bedside to complete questionnaire"
                   → Modal closes, list refreshes

At bedside: nurse opens that patient → [Edit] → full form (preferences) → [Save]
    → PUT /api/patients/:id
    → POST /api/ai/summary (MiniMax/Groq/Claude/OpenAI)
    → PUT /api/patients/:id with aiSummary
    → Care summary appears on profile
```

- **Find returning patient**: search by Medical ID or name → list → [Open] → detail or [Edit].

---

## 3. When is the care summary generated?

| Trigger | What happens |
|--------|-------------------------------|
| **Create patient** (full form, not basic-only) | After `POST /api/patients` → `POST /api/ai/summary` → save `aiSummary` on patient. |
| **Edit patient** (full form) | After `PUT /api/patients/:id` → `POST /api/ai/summary` → save `aiSummary`. |
| **"Generate summary" button** (on detail when no summary) | `POST /api/ai/summary` → `PUT /api/patients/:id` with `aiSummary` → refresh. |

If the summary API fails, the user sees an alert with the error; the patient is still saved (with or without a fallback message in `aiSummary`).

---

## 4. MiniMax integration flow

```
Frontend (any summary trigger above)
    → POST /api/ai/summary
    → Body: { patient: { fullName, age, gender, medicalId, roomNumber, serviceName, ... } }

Backend (backend/routes/ai.js)
    1. buildPrompt(patient) → English prompt for care summary (sections: Comfort, Diet, Avoid, How to interact, Practical tips)
    2. If MINIMAX_API_KEY is set:
         - If MINIMAX_MODEL is MiniMax-M2.5 (or M2.1, M2) →
             POST https://api.minimax.io/anthropic/v1/messages
             Body: { model, max_tokens, messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }] }
             Response: json.content[].text → combined as summary
         - Else (M2-her) →
             POST https://api.minimax.io/v1/text/chatcompletion_v2?GroupId=... (if set)
             Body: { model: 'M2-her', max_tokens, messages: [{ role: 'user', content: prompt }] }
             Response: json.choices[0].message.content → summary
    3. If no MiniMax key: try Groq → Claude → OpenAI (see .env)
    4. Return { summary } or 502 with error message
```

**Your .env:** `MINIMAX_API_KEY` and `MINIMAX_MODEL=MiniMax-M2.5` → backend uses **Anthropic-compatible** MiniMax endpoint (no GroupId).

---

## 5. How to check if MiniMax works

0. **Quick config check**  
   - `GET http://localhost:3001/api/ai/status` (backend running).  
   - Response example: `{ "provider": "MiniMax", "model": "MiniMax-M2.5", "summaryAvailable": true }`.  
   - If `provider` is `"MiniMax"`, the backend will use MiniMax for summaries.

1. **From the app**  
   - Log in as nurse → open a patient that has preferences filled → click **"Generate summary"**.  
   - If you see a care summary, MiniMax (or the next configured provider) is working.  
   - If you see an alert with an error, read the message (e.g. auth, rate limit).

2. **From the command line** (backend must be running and .env loaded):
   ```bash
   curl -X POST http://localhost:3001/api/ai/summary \
     -H "Content-Type: application/json" \
     -d "{\"patient\":{\"fullName\":\"Test Patient\",\"age\":65,\"gender\":\"Male\",\"medicalId\":\"T1\",\"roomNumber\":\"101\",\"serviceName\":\"General\",\"tempPreference\":\"Warm\",\"noisePreference\":\"Quiet\",\"dietary\":\"Low salt\",\"sleepSchedule\":\"\",\"communicationStyle\":\"Simple\",\"beliefs\":\"\",\"hobbies\":\"\",\"dislikes\":\"\",\"visitation\":\"\",\"additionalNotes\":\"\"}}"
   ```
   - Success: JSON with `"summary":"**Comfort & environment**\n - ..."`.  
   - Failure: non-200 status and JSON with `"error":"..."` (e.g. invalid key, MiniMax API error).

3. **Backend logs**  
   - When you trigger a summary, the server does not log the MiniMax response by default.  
   - If you get a 502 or an alert, the error message in the response is the one to check.

---

## 6. Data flow overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────│   Backend    │────│   SQLite    │
│   (React)   │     │  (Express)  │     │ (patients,  │
│             │     │             │     │  staff,     │
│  - Login    │     │  - /api/*   │     │  services,   │
│  - Dashboards│    │  - /api/ai  │────│  audit)     │
│  - Patient  │     │    summary  │     └─────────────┘
│    forms    │     │       │     │
└─────────────┘     └───────┼─────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  MiniMax API │  (if MINIMAX_API_KEY set)
                    │  (or Groq/   │
                    │   Claude/    │
                    │   OpenAI)    │
                    └───────────────┘
```

---

## Summary

- **Flow:** Login → role dashboard → nurses register/edit patients (two-step by Medical ID) → summary is generated on full create, edit, or via **"Generate summary"**.
- **MiniMax:** Used when `MINIMAX_API_KEY` is set; with `MINIMAX_MODEL=MiniMax-M2.5` the app calls the Anthropic-compatible endpoint. Verify by using **"Generate summary"** on a patient or by calling `POST /api/ai/summary` with curl as above.
