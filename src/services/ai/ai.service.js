const { buildMessages } = require('./prompt.service');
const { toolDefinitions, executeTool } = require('./tools/financialTool.registry');

const requestCompletion = async (apiUrl, apiKey, body) => {
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60_000),
  });

  const rawText = await response.text();
  let payload;
  try {
    payload = JSON.parse(rawText);
  } catch (error) {
    console.error('LLM response parse failed:', error, 'raw response:', rawText);
    return null;
  }

  if (!response.ok) {
    console.error('LLM request failed:', response.status, payload);
    return null;
  }

  return payload;
};

const parseArguments = (argumentsText) => {
  try {
    return JSON.parse(argumentsText || '{}');
  } catch {
    return {};
  }
};

const UNAVAILABLE_RESPONSE =
  'I’m unable to reach my financial research engine right now. Please try again shortly.';

const generateResponse = async ({ userMessage, conversationHistory, userPreferences, userMemory, userId }) => {
  const apiUrl = process.env.LLM_API_URL;
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL;

  if (!apiUrl || !apiKey || !model) {
    return 'My AI research engine has not been configured yet. Please ask the administrator to add the LLM environment variables.';
  }

  try {
    const messages = buildMessages({ userMessage, conversationHistory, userPreferences, userMemory });
    const payload = await requestCompletion(apiUrl, apiKey, {
      model,
      messages,
      tools: toolDefinitions,
      tool_choice: 'auto',
      temperature: 0.2,
    });
    if (!payload) return UNAVAILABLE_RESPONSE;

    const assistantMessage = payload.choices?.[0]?.message;
    const toolCalls = assistantMessage?.tool_calls || [];
    if (toolCalls.length) {
      const toolResults = await Promise.all(
        toolCalls.map(async (toolCall) => ({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(await executeTool(toolCall.function.name, parseArguments(toolCall.function.arguments), { userId })),
        })),
      );
      const finalPayload = await requestCompletion(apiUrl, apiKey, {
        model,
        messages: [...messages, assistantMessage, ...toolResults],
        temperature: 0.2,
      });
      return finalPayload?.choices?.[0]?.message?.content?.trim() || UNAVAILABLE_RESPONSE;
    }
    const content = payload.choices?.[0]?.message?.content?.trim();
    return content || UNAVAILABLE_RESPONSE;
  } catch (error) {
    console.error('LLM request failed:', error.name);
    return UNAVAILABLE_RESPONSE;
  }
};

module.exports = { generateResponse };
