const AppError = require('../../utils/AppError');

const request = async (path, query = {}) => {
  const apiKey = process.env.FMP_API_KEY;
  const baseUrl = process.env.FMP_BASE_URL || 'https://financialmodelingprep.com/stable';

  if (!apiKey) throw new AppError('Financial data provider is not configured', 503);

  const url = new URL(`${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`);
  Object.entries(query).forEach(([key, value]) => url.searchParams.set(key, value));

  let response;
  try {
    response = await fetch(url, {
      headers: { apikey: apiKey },
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    if (error.name === 'TimeoutError') throw new AppError('Financial data provider timed out', 504);
    throw new AppError('Financial data provider is unavailable', 502);
  }

  if (response.status === 429) throw new AppError('Financial data provider rate limit reached', 429);
  if (!response.ok) throw new AppError('Financial data provider request failed', 502);

  const payload = await response.json();
  if (payload?.['Error Message'] || payload?.error) {
    throw new AppError('Financial data provider returned an error', 502);
  }

  return payload;
};

module.exports = { request };
