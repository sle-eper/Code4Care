import { Router } from 'express';

export const ttsRoutes = Router();

const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel — clear, professional

/**
 * POST /api/tts
 * Body: { text: string }
 * Returns: audio/mpeg stream
 */
ttsRoutes.post('/', async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Missing or empty "text" field.' });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || apiKey === 'your_elevenlabs_key_here') {
    return res.status(500).json({ error: 'ElevenLabs API key not configured. Set ELEVENLABS_API_KEY in .env' });
  }

  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  try {
    console.log(`[TTS] Requesting ElevenLabs voice=${voiceId}, text length=${text.length}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text: text.slice(0, 5000), // ElevenLabs limit safety
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error(`[TTS] ElevenLabs error ${response.status}:`, errBody);
      return res.status(response.status).json({
        error: `ElevenLabs API error (${response.status}): ${errBody.slice(0, 200)}`,
      });
    }

    // Stream audio back to client
    res.set({
      'Content-Type': 'audio/mpeg',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    });

    const reader = response.body.getReader();
    const push = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) { res.end(); break; }
        res.write(Buffer.from(value));
      }
    };
    await push();
  } catch (err) {
    console.error('[TTS] Error:', err);
    res.status(500).json({ error: err.message || 'TTS request failed.' });
  }
});
