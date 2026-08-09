const AppError = require('../utils/AppError');

const escapeHtml = (text) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const formatTelegramMessage = (text) => {
  if (!text) return '';

  let formatted = escapeHtml(text);
  formatted = formatted.replace(/\*\*(.+?)\*\*/gs, '<b>$1</b>');
  formatted = formatted.replace(/__(.+?)__/gs, '<i>$1</i>');
  formatted = formatted.replace(/(^|\s)\*(.+?)\*(?=\s|$)/gs, '$1<i>$2</i>');
  formatted = formatted.replace(/^\s*[\-*]\s+/gm, '• ');
  return formatted;
};

const sendMessage = async (chatId, text, options = {}) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new AppError('Telegram bot token is not configured', 503);
  }

  const payload = {
    chat_id: chatId,
    text: formatTelegramMessage(text),
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    ...options,
  };

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new AppError('Telegram could not deliver the message', 502);
  }

  const result = await response.json();
  if (!result.ok) {
    throw new AppError('Telegram rejected the message', 502);
  }

  return result.result;
};

module.exports = { sendMessage };
