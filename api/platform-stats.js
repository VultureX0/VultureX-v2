function json(res, status, body) {
  res.status(status).json(body);
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  return { url, key };
}

function parseContentRangeCount(value) {
  const count = value?.split('/')?.[1];
  const parsed = Number(count);
  return Number.isFinite(parsed) ? parsed : null;
}

async function countValidStartupProfiles() {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;

  const response = await fetch(
    `${url.replace(/\/$/, '')}/rest/v1/startup_profiles?is_valid=eq.true&select=uid`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: 'count=exact',
        Range: '0-0',
      },
    },
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return parseContentRangeCount(response.headers.get('content-range'));
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return json(res, 405, { error: 'Method not allowed.' });
  }

  try {
    return json(res, 200, {
      activeFounders: await countValidStartupProfiles(),
    });
  } catch (err) {
    return json(res, 500, { error: err.message || 'Could not load platform stats.' });
  }
}
