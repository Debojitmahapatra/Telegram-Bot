const { request } = require('./fmp.client');
const { getOrSet } = require('../../utils/memoryCache');

const MINUTE = 60_000;
const withCache = (key, ttl, loader) => getOrSet(key, ttl, loader);
const firstRecord = (payload, symbol) => {
  const record = Array.isArray(payload) ? payload[0] : payload;
  if (!record) throw new Error(`No verified data was found for ${symbol}`);
  return record;
};

const getCompanyProfile = async (symbol) =>
  withCache(`profile:${symbol}`, 24 * 60 * MINUTE, async () => {
    const item = firstRecord(await request('profile', { symbol }), symbol);
    return {
      symbol: item.symbol,
      companyName: item.companyName,
      description: item.description,
      industry: item.industry,
      sector: item.sector,
      marketCap: item.marketCap,
      website: item.website,
      exchange: item.exchange,
    };
  });

const getStockPrice = async (symbol) =>
  withCache(`quote:${symbol}`, MINUTE, async () => {
    const item = firstRecord(await request('quote', { symbol }), symbol);
    return {
      symbol: item.symbol,
      name: item.name,
      price: item.price,
      change: item.change,
      changesPercentage: item.changesPercentage,
      dayLow: item.dayLow,
      dayHigh: item.dayHigh,
      yearLow: item.yearLow,
      yearHigh: item.yearHigh,
      timestamp: item.timestamp,
    };
  });

const getCompanyNews = async (symbol) =>
  withCache(`news:${symbol}`, 5 * MINUTE, async () => {
    const items = await request('news/stock', { symbols: symbol, limit: 10 });
    if (!Array.isArray(items) || !items.length) throw new Error(`No verified news was found for ${symbol}`);
    return items.map((item) => ({
      title: item.title,
      text: item.text,
      publishedDate: item.publishedDate,
      site: item.site,
      url: item.url,
      symbol: item.symbol,
    }));
  });

const getFinancialMetrics = async (symbol) =>
  withCache(`metrics:${symbol}`, 60 * MINUTE, async () => {
    const item = firstRecord(await request('key-metrics-ttm', { symbol }), symbol);
    return {
      symbol: item.symbol,
      marketCap: item.marketCap,
      peRatioTTM: item.peRatioTTM,
      priceToBookRatioTTM: item.priceToBookRatioTTM,
      debtToEquity: item.debtToEquity,
      returnOnEquityTTM: item.returnOnEquityTTM,
      freeCashFlowPerShareTTM: item.freeCashFlowPerShareTTM,
    };
  });

const getEarnings = async (symbol) =>
  withCache(`earnings:${symbol}`, 60 * MINUTE, async () => {
    const items = await request('earnings', { symbol });
    if (!Array.isArray(items) || !items.length) throw new Error(`No verified earnings data was found for ${symbol}`);
    return items.slice(0, 8).map((item) => ({
      date: item.date,
      eps: item.eps,
      epsEstimated: item.epsEstimated,
      revenue: item.revenue,
      revenueEstimated: item.revenueEstimated,
      time: item.time,
    }));
  });

const searchFinancialNews = async (query) =>
  withCache(`news-search:${query.toLowerCase()}`, 5 * MINUTE, async () => {
    const items = await request('news/stock-latest', { page: 0, limit: 50 });
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const matches = items.filter((item) => {
      const haystack = `${item.title || ''} ${item.text || ''} ${item.symbol || ''}`.toLowerCase();
      return terms.every((term) => haystack.includes(term));
    });
    if (!matches.length) throw new Error(`No verified news was found for ${query}`);
    return matches.slice(0, 10).map((item) => ({
      title: item.title,
      text: item.text,
      publishedDate: item.publishedDate,
      site: item.site,
      url: item.url,
      symbol: item.symbol,
    }));
  });

module.exports = {
  getCompanyProfile,
  getStockPrice,
  getCompanyNews,
  getFinancialMetrics,
  searchFinancialNews,
  getEarnings,
};
