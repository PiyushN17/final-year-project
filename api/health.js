const { handleOptions, proxyJson, readJson, requirePost, sendJson } = require("./_utils");

const providers = {
  crop: {
    apiKey: "CROP_KINDWISE_API_KEY",
    url: "https://crop.kindwise.com/api/v1/identification"
  },
  plant: {
    apiKey: "PLANT_ID_API_KEY",
    url: "https://plant.id/api/v3/health_assessment"
  }
};

function requestedProvider(req) {
  if (req.query?.provider) return req.query.provider;
  return new URL(req.url || "/", "http://localhost").searchParams.get("provider");
}

module.exports = async function handler(req, res) {
  if (handleOptions(req, res) || !requirePost(req, res)) return;

  const provider = providers[requestedProvider(req)];
  if (!provider) return sendJson(res, 404, { error: "Health service not found" });

  try {
    if (!process.env[provider.apiKey]) {
      return sendJson(res, 500, { error: `${provider.apiKey} is missing` });
    }

    const body = await readJson(req);
    const data = await proxyJson(provider.url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Api-Key": process.env[provider.apiKey] },
      body: JSON.stringify(body)
    });
    return sendJson(res, 200, data);
  } catch (error) {
    return sendJson(res, error.status || 500, { error: error.message, details: error.data });
  }
};
