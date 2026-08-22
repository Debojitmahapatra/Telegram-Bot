const { FINANCIAL_ASSISTANT_SYSTEM_PROMPT } = require('../../prompts/financialAssistant.prompt');

const formatPreferences = (preferences) => {
  if (!preferences) return 'No saved preferences are available.';

  return [
    preferences.role && `Financial role: ${preferences.role}`,
    preferences.preferredIndustries?.length && `Industries: ${preferences.preferredIndustries.join(', ')}`,
    preferences.preferredCompanies?.length && `Companies: ${preferences.preferredCompanies.join(', ')}`,
    preferences.preferredTopics?.length && `Topics: ${preferences.preferredTopics.join(', ')}`,
    preferences.timezone && `Timezone: ${preferences.timezone}`,
  ].filter(Boolean).join('\n');
};

const formatMemory = (memory) => {
  if (!memory.length) return 'No long-term memory is available.';
  return memory.map((item) => `- ${item.memoryKey}: ${item.memoryValue}`).join('\n');
};

const buildMessages = ({ userMessage, conversationHistory = [], userPreferences, userMemory = [] }) => {
  const context = `User preferences:\n${formatPreferences(userPreferences)}\n\nUser memory:\n${formatMemory(userMemory)}`;
  const history = conversationHistory.map(({ role, content }) => ({ role, content }));

  return [
    { role: 'system', content: FINANCIAL_ASSISTANT_SYSTEM_PROMPT },
    { role: 'system', content: `Current UTC date and time: ${new Date().toISOString()}` },
    { role: 'system', content: context },
    ...history,
    { role: 'user', content: userMessage },
  ];
};

module.exports = { buildMessages };
