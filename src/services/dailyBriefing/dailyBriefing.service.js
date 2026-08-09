const aiService = require('../ai/ai.service');

const buildBriefingRequest = (watchlistItems) => {
  const companies = watchlistItems.map((item) => `${item.companyName} (${item.symbol})`).join(', ');

  return `Create a concise morning financial briefing for this user's watchlist: ${companies}.
Use available financial tools for current prices and relevant news. Give the three most important items, explain why each matters, clearly state any unavailable information, and avoid investment advice.`;
};

const generateDailyBriefing = async ({ userId, preferences, watchlistItems }) =>
  aiService.generateResponse({
    userId,
    userMessage: buildBriefingRequest(watchlistItems),
    conversationHistory: [],
    userPreferences: preferences,
    userMemory: [],
  });

const isDeliverableBriefing = (briefing) =>
  briefing &&
  !briefing.startsWith('My AI research engine has not been configured') &&
  !briefing.startsWith('I’m unable to reach my financial research engine');

const isScheduledBriefingTime = (dailyBriefTime, timezone) => {
  try {
    const currentTime = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).format(new Date());
    return currentTime === dailyBriefTime.slice(0, 5);
  } catch {
    return false;
  }
};

module.exports = {
  buildBriefingRequest,
  generateDailyBriefing,
  isDeliverableBriefing,
  isScheduledBriefingTime,
};
