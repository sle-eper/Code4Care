# How to get an API key for the care profile

The app uses the **first** provider you configure: **MiniMax** → Groq → Claude → OpenAI. Set the one you want in `.env` and restart the backend.

---

## Option 1: MiniMax

1. Go to **https://platform.minimax.io**
2. Sign up and create an API key
3. If your account uses a Group ID, copy it from the console
4. Open **`.env`** and set:
   ```env
   MINIMAX_API_KEY=your_minimax_api_key_here
   # MINIMAX_GROUP_ID=your_group_id_here
   # MINIMAX_MODEL=M2-her
   ```
5. Save `.env` and restart the backend (`npm start` in the `backend/` folder)

Default model is **M2-her**. You can override with `MINIMAX_MODEL`.

---

## Option 2: Groq — FREE

1. Go to **https://console.groq.com**
2. Sign up (free, no credit card required)
3. In the dashboard: **API Keys** → **Create API Key**
4. Name it (e.g. "Code4Care") and copy the key
5. In `.env` set (and comment out `MINIMAX_API_KEY` if you were using it):
   ```env
   GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxx
   ```
6. Save `.env` and restart the backend

Groq uses fast Llama models and has a free tier with rate limits.

---

## Option 3: Claude (Anthropic)

1. Go to **https://console.anthropic.com**
2. Sign in or create an account
3. **API Keys** → **Create Key** → copy the key
4. In `.env`: set (and comment out MiniMax/Groq if used):
   ```env
   ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxx
   ```
5. Save and restart the backend.

---

## Option 4: OpenAI

1. Go to **https://platform.openai.com/api-keys**
2. Create a new secret key and copy it
3. In `.env`: set (and comment out other AI keys if used):
   ```env
   OPENAI_API_KEY=sk-xxxxxxxx
   OPENAI_API_URL=https://api.openai.com/v1/chat/completions
   ```
4. Save and restart the backend.

---

## Summary

| Option   | Set in `.env` |
|----------|----------------|
| **MiniMax** | `MINIMAX_API_KEY` (optional: `MINIMAX_GROUP_ID`, `MINIMAX_MODEL`) |
| **Groq** (free) | `GROQ_API_KEY` |
| Claude   | `ANTHROPIC_API_KEY` |
| OpenAI   | `OPENAI_API_KEY` + `OPENAI_API_URL` |
