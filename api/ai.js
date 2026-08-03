const { handleOptions, proxyJson, readJson, requirePost, sendJson } = require("./_utils");

function currentGroqModel(value, fallback) {
  return !value || value === "llama-3.1-8b-instant" ? fallback : value;
}

const GROQ_MODEL = currentGroqModel(process.env.GROQ_MODEL, "openai/gpt-oss-20b");
const GROQ_MODEL2 = currentGroqModel(process.env.GROQ_MODEL2, "openai/gpt-oss-120b");

function isUsableApiKey(value) {
  return Boolean(value && !/^your_/i.test(value.trim()));
}

function aiTokenLimit(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 420;
  return Math.max(120, Math.min(1400, Math.round(parsed)));
}

async function generateWithGroq(prompt, apiKey, model, provider, maxTokens = 420) {
  if (!isUsableApiKey(apiKey)) throw new Error(`${provider} API key is missing or still a placeholder`);
  const data = await proxyJson("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "You are KrishiBaba, a practical farmer assistant for Indian agriculture. Give concise, safe, low-cost, farmer-friendly guidance." },
        { role: "user", content: prompt }
      ],
      temperature: 0.35,
      max_tokens: aiTokenLimit(maxTokens),
      ...(model.startsWith("openai/gpt-oss") ? { reasoning_effort: "low" } : {})
    })
  });
  const text = data?.choices?.[0]?.message?.content?.trim() || "";
  if (!text) throw new Error(`${provider} returned an empty response`);
  return { provider, model, text };
}

async function generateAiResponse(prompt, maxTokens) {
  let primaryError;
  try {
    return await generateWithGroq(prompt, process.env.GROQ_API_KEY, GROQ_MODEL, "groq-primary", maxTokens);
  } catch (error) {
    primaryError = error;
  }

  try {
    return await generateWithGroq(prompt, process.env.GROQ_API_KEY2, GROQ_MODEL2, "groq-fallback", maxTokens);
  } catch (fallbackError) {
    const rateLimited = primaryError.status === 429 || fallbackError.status === 429;
    const error = new Error(rateLimited
      ? "KrishiBaba is receiving many requests. Please wait a few seconds and try again; your last saved analysis remains available."
      : "KrishiBaba AI is temporarily unavailable. Please try again shortly; your last saved analysis remains available.");
    error.status = fallbackError.status || primaryError.status || 500;
    error.data = { primary: primaryError.data, fallback: fallbackError.data };
    throw error;
  }
}

module.exports = async function handler(req, res) {
  if (handleOptions(req, res) || !requirePost(req, res)) return;
  try {
    const body = await readJson(req);
    if (!body.prompt) return sendJson(res, 400, { error: "Missing prompt" });
    return sendJson(res, 200, await generateAiResponse(body.prompt, body.maxTokens));
  } catch (error) {
    return sendJson(res, error.status || 500, { error: error.message, details: error.data });
  }
};
