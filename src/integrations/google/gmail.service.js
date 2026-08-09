const { google } = require('googleapis');
const { GoogleIntegration, User, UserPreference } = require('../../models');
const AppError = require('../../utils/AppError');
const aiService = require('../../services/ai/ai.service');
const { encrypt, decrypt, createOAuthState, verifyOAuthState } = require('./googleSecurity.service');

const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';

const createOAuthClient = () => {
  const { GOOGLE_CLIENT_ID: clientId, GOOGLE_CLIENT_SECRET: clientSecret, GOOGLE_REDIRECT_URI: redirectUri } = process.env;
  if (!clientId || !clientSecret || !redirectUri) throw new AppError('Google OAuth is not configured', 503);
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

const getAuthorizationUrl = async (userId) => {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError('User not found', 404);

  return createOAuthClient().generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [GMAIL_SCOPE],
    state: createOAuthState(userId),
  });
};

const saveTokens = async (userId, tokens) => {
  const existing = await GoogleIntegration.findOne({ where: { userId, provider: 'gmail' } });
  const refreshToken = tokens.refresh_token || (existing?.refreshToken ? decrypt(existing.refreshToken) : null);
  if (!tokens.access_token) throw new AppError('Google did not return an access token', 502);

  const values = {
    userId,
    provider: 'gmail',
    accessToken: encrypt(tokens.access_token),
    refreshToken: refreshToken ? encrypt(refreshToken) : null,
    expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
  };
  if (existing) {
    await existing.update(values);
    return existing;
  }
  return GoogleIntegration.create(values);
};

const completeAuthorization = async ({ code, state }) => {
  const userId = verifyOAuthState(state);
  const client = createOAuthClient();
  const { tokens } = await client.getToken(code);
  await saveTokens(userId, tokens);
  return userId;
};

const getGmailClient = async (userId) => {
  const integration = await GoogleIntegration.findOne({ where: { userId, provider: 'gmail' } });
  if (!integration) throw new AppError('Gmail is not connected for this user', 409);

  const client = createOAuthClient();
  client.setCredentials({
    access_token: decrypt(integration.accessToken),
    refresh_token: integration.refreshToken ? decrypt(integration.refreshToken) : undefined,
    expiry_date: integration.expiryDate?.getTime(),
  });
  client.on('tokens', (tokens) => {
    saveTokens(userId, tokens).catch(() => {});
  });
  return google.gmail({ version: 'v1', auth: client });
};

const getHeader = (headers, name) => headers?.find((header) => header.name.toLowerCase() === name)?.value || '';

const searchEmails = async (userId, query) => {
  try {
    const gmail = await getGmailClient(userId);
    const list = await gmail.users.messages.list({ userId: 'me', q: query, maxResults: 10 });
    const messages = await Promise.all(
      (list.data.messages || []).map(async ({ id, threadId }) => {
        const response = await gmail.users.messages.get({
          userId: 'me',
          id,
          format: 'metadata',
          metadataHeaders: ['From', 'Subject', 'Date'],
        });
        const headers = response.data.payload?.headers;
        return {
          id,
          threadId,
          from: getHeader(headers, 'from'),
          subject: getHeader(headers, 'subject'),
          date: getHeader(headers, 'date'),
          snippet: response.data.snippet || '',
        };
      }),
    );
    return messages;
  } catch (error) {
    if (error.statusCode) throw error;
    throw new AppError('Gmail request failed. Reconnect Gmail and try again.', 502);
  }
};

const summarizeEmails = async (userId, query, task) => {
  const emails = await searchEmails(userId, query);
  const preferences = await UserPreference.findOne({ where: { userId } });
  const taskPrompt = {
    summarize: 'Summarize the key points concisely.',
    company_conversations: 'Identify conversations most relevant to the specified company and explain why.',
    action_items: 'Extract clear action items, owners when stated, and due dates when stated. Do not invent missing details.',
  }[task];
  const result = await aiService.generateResponse({
    userId,
    userMessage: `${taskPrompt}\n\nEmail metadata and snippets:\n${JSON.stringify(emails)}`,
    conversationHistory: [],
    userPreferences: preferences,
    userMemory: [],
  });
  return { result, emails };
};

module.exports = {
  getAuthorizationUrl,
  completeAuthorization,
  searchEmails,
  summarizeEmails,
};
