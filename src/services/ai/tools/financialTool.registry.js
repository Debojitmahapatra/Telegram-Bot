const financialTools = require('./financial.tools');
const watchlistTools = require('./watchlist.tools');
const alertTools = require('./alert.tools');
const calendarTools = require('./calendar.tools');

const symbolParameter = {
  type: 'object',
  properties: { symbol: { type: 'string', description: 'Ticker symbol, such as NVDA or TSLA.' } },
  required: ['symbol'],
  additionalProperties: false,
};

const toolDefinitions = [
  ['getCompanyProfile', 'Retrieve a company business profile.', symbolParameter],
  ['getStockPrice', 'Retrieve the latest available stock price and movement.', symbolParameter],
  ['getCompanyNews', 'Retrieve recent verified news for a company.', symbolParameter],
  ['getFinancialMetrics', 'Retrieve company financial metrics.', symbolParameter],
  ['getEarnings', 'Retrieve company earnings information.', symbolParameter],
  ['getSecFilings', 'Retrieve company SEC filings.', symbolParameter],
  [
    'searchFinancialNews',
    'Search verified financial news for a company, industry, market event, or topic.',
    {
      type: 'object',
      properties: { query: { type: 'string', description: 'Specific financial-news search query.' } },
      required: ['query'],
      additionalProperties: false,
    },
  ],
  [
    'addToWatchlist',
    'Add a company to the current user’s watchlist when the user explicitly asks to track it.',
    {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Ticker symbol, such as NVDA.' },
        companyName: { type: 'string', description: 'Company name, such as NVIDIA Corporation.' },
      },
      required: ['symbol', 'companyName'],
      additionalProperties: false,
    },
  ],
  [
    'createFinancialAlert',
    'Create an alert when the user explicitly asks for a price-movement or company-news notification.',
    {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Ticker symbol, such as TSLA.' },
        alertType: { type: 'string', enum: ['price_movement', 'important_news'] },
        condition: { type: 'string', enum: ['percentage_change', 'new_news'] },
        threshold: { type: 'number', description: 'Required percentage movement threshold. Omit for news alerts.' },
      },
      required: ['symbol', 'alertType', 'condition'],
      additionalProperties: false,
    },
  ],
  [
    'createCalendarEvent',
    'Create a calendar event only when the user explicitly asks to schedule or create one.',
    {
      type: 'object',
      properties: {
        title: { type: 'string' },
        startDateTime: { type: 'string', description: 'RFC3339 date-time with time-zone offset.' },
        endDateTime: { type: 'string', description: 'RFC3339 date-time with time-zone offset.' },
        timeZone: { type: 'string', description: 'IANA timezone, such as Asia/Kolkata.' },
        attendees: { type: 'array', items: { type: 'string' } },
      },
      required: ['title', 'startDateTime', 'endDateTime', 'timeZone'],
      additionalProperties: false,
    },
  ],
  [
    'createCalendarReminder',
    'Create a calendar reminder only when the user explicitly asks for a reminder.',
    {
      type: 'object',
      properties: {
        title: { type: 'string' },
        remindAt: { type: 'string', description: 'RFC3339 date-time with time-zone offset.' },
        timeZone: { type: 'string', description: 'IANA timezone, such as Asia/Kolkata.' },
      },
      required: ['title', 'remindAt', 'timeZone'],
      additionalProperties: false,
    },
  ],
].map(([name, description, parameters]) => ({ type: 'function', function: { name, description, parameters } }));

const isValidSymbol = (value) => typeof value === 'string' && /^[A-Za-z.]{1,10}$/.test(value);
const isValidQuery = (value) => typeof value === 'string' && value.trim().length > 0 && value.length <= 300;

const executeTool = async (name, args, context = {}) => {
  const handler = { ...financialTools, ...watchlistTools, ...alertTools, ...calendarTools }[name];
  if (!handler) return { available: false, message: `Unknown financial tool: ${name}` };
  if ('symbol' in args && !isValidSymbol(args.symbol)) return { available: false, message: 'A valid stock symbol is required.' };
  if ('query' in args && !isValidQuery(args.query)) return { available: false, message: 'A valid financial-news search query is required.' };
  if ('companyName' in args && (!isValidQuery(args.companyName) || args.companyName.length > 255)) {
    return { available: false, message: 'A valid company name is required.' };
  }
  if ('threshold' in args && (!Number.isFinite(args.threshold) || args.threshold <= 0)) {
    return { available: false, message: 'A positive threshold is required.' };
  }
  if ('attendees' in args && (!Array.isArray(args.attendees) || args.attendees.some((email) => typeof email !== 'string'))) {
    return { available: false, message: 'Attendees must be an array of email addresses.' };
  }

  return handler(args, context);
};

module.exports = { toolDefinitions, executeTool };
