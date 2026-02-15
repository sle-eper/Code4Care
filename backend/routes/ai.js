import { Router } from 'express';

export const aiRoutes = Router();

const MAX_TOKENS = 400;

// Build a prompt for a short, scannable care summary in English.
function buildPrompt(patient) {
  const text = [
    `Patient: ${patient.fullName}, Age ${patient.age}, ${patient.gender}.`,
    `Medical ID: ${patient.medicalId || ''}. Room: ${patient.roomNumber}. Service: ${patient.serviceName || ''}.`,
    `Temperature: ${patient.tempPreference || ''}. Noise: ${patient.noisePreference || ''}.`,
    `Dietary: ${patient.dietary || 'None'}. Sleep: ${patient.sleepSchedule || 'Not specified'}.`,
    `Communication: ${patient.communicationStyle || ''}. Beliefs: ${patient.beliefs || 'None'}.`,
    `Hobbies: ${patient.hobbies || 'None'}. Dislikes: ${patient.dislikes || 'None'}.`,
    `Visitation: ${patient.visitation || 'None'}. Notes: ${patient.additionalNotes || 'None'}.`,
  ].join(' ');
  return `Write a SHORT care summary for nurses. Use the patient details below. Reply in English only.

FORMAT: Use these exact section titles. Under each, write 1–2 bullet points (start each with " - "). One blank line between sections. Be brief.

**Comfort & environment**
 - (1–2 bullets: room temp, noise, sleep. One short phrase per bullet.)

**Diet & preferences**
 - (1–2 bullets: diet, allergies.)

**Avoid**
 - (1–2 bullets: triggers, dislikes, cultural/religious notes.)

**How to interact with this patient**
 - (1–2 bullets: how to address them, communication style, how to explain care. Keep very short.)

**Practical tips**
 - (1–2 bullets: visitation, helpful activities.)

Rules: Maximum 2 bullets per section. One short phrase per bullet. No long sentences. Blank line between sections.

Patient details:
${text}`;
}

// Status endpoint — shows which AI provider is active
aiRoutes.get('/status', (req, res) => {
  const minimaxKey = process.env.MINIMAX_API_KEY;
  const model = process.env.MINIMAX_MODEL || 'MiniMax-M2.5';
  res.json({
    provider: minimaxKey ? 'MiniMax' : 'None',
    model: minimaxKey ? model : undefined,
    summaryAvailable: !!minimaxKey,
  });
});

// MiniMax-only summary endpoint
aiRoutes.post('/summary', async (req, res) => {
  try {
    const { patient } = req.body || {};

    if (!patient || !patient.fullName) {
      return res.status(400).json({ error: 'Patient object required' });
    }

    const minimaxKey = process.env.MINIMAX_API_KEY;
    if (!minimaxKey) {
      return res.status(503).json({
        error: 'No AI configured. Set MINIMAX_API_KEY in .env and restart the backend.',
      });
    }

    const prompt = buildPrompt(patient);
    const minimaxModel = (process.env.MINIMAX_MODEL || 'MiniMax-M2.5').trim();

    // MiniMax Anthropic-compatible endpoint (MiniMax-M2.5, M2.1, M2)
    console.log(`[AI] Calling MiniMax (${minimaxModel})...`);
    const response = await fetch('https://api.minimax.io/anthropic/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${minimaxKey}`,
      },
      body: JSON.stringify({
        model: minimaxModel,
        max_tokens: MAX_TOKENS,
        messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
      }),
    });

    const responseText = await response.text();
    console.log(`[AI] MiniMax response status: ${response.status}`);
    console.log(`[AI] MiniMax raw response (first 1500 chars):`, responseText.slice(0, 1500));

    let json;
    try {
      json = JSON.parse(responseText);
    } catch {
      console.error('[AI] MiniMax returned invalid JSON:', responseText.slice(0, 300));
      return res.status(502).json({ error: 'MiniMax API returned invalid JSON' });
    }

    if (!response.ok) {
      const errMsg = json.error?.message || json.message || `MiniMax API error (HTTP ${response.status})`;
      console.error('[AI] MiniMax error:', errMsg);
      return res.status(response.status).json({ error: errMsg });
    }

    // Extract text from Anthropic-style response
    // MiniMax-M2.5 may return: [{ type: "thinking", thinking: "..." }, { type: "text", text: "..." }]
    let summary = '';
    if (Array.isArray(json.content)) {
      for (const block of json.content) {
        if (block.type === 'text' && block.text) {
          summary += block.text;
        }
      }
      // If no "text" block found, check if there's a "thinking" block with useful content
      if (!summary) {
        for (const block of json.content) {
          if (block.type === 'thinking' && block.thinking) {
            summary += block.thinking;
          }
        }
      }
    }
    summary = summary.trim();

    if (!summary) {
      console.error('[AI] MiniMax returned empty content. Full response:', JSON.stringify(json).slice(0, 1000));
      return res.status(502).json({ error: 'MiniMax returned no text.' });
    }

    console.log(`[AI] Summary generated (${summary.length} chars)`);
    return res.json({ summary });
  } catch (e) {
    console.error('[AI] Error:', e.message);
    res.status(500).json({ error: e.message || 'Server error' });
  }
});
