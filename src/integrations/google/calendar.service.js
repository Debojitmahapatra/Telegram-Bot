const AppError = require('../../utils/AppError');
const { UserPreference } = require('../../models');
const aiService = require('../../services/ai/ai.service');
const { getAuthorizedOAuthClient } = require('./gmail.service');

const getCalendarClient = async (userId) => {
  const { google } = require('googleapis');
  return google.calendar({ version: 'v3', auth: await getAuthorizedOAuthClient(userId) });
};

const ensureDateRange = (startDateTime, endDateTime) => {
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    throw new AppError('A valid event start and end time are required', 400);
  }
};

const createEvent = async ({ userId, title, startDateTime, endDateTime, timeZone, attendees = [] }) => {
  ensureDateRange(startDateTime, endDateTime);

  try {
    const calendar = await getCalendarClient(userId);
    const response = await calendar.events.insert({
      calendarId: 'primary',
      sendUpdates: attendees.length ? 'all' : 'none',
      requestBody: {
        summary: title,
        start: { dateTime: startDateTime, timeZone },
        end: { dateTime: endDateTime, timeZone },
        attendees: attendees.map((email) => ({ email })),
      },
    });
    return {
      id: response.data.id,
      title: response.data.summary,
      start: response.data.start,
      end: response.data.end,
      link: response.data.htmlLink,
    };
  } catch (error) {
    if (error.statusCode) throw error;
    throw new AppError('Google Calendar request failed. Reconnect Google and try again.', 502);
  }
};

const findEvents = async (userId, { timeMin, timeMax, query }) => {
  try {
    const calendar = await getCalendarClient(userId);
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin || new Date().toISOString(),
      timeMax,
      q: query,
      maxResults: 20,
      singleEvents: true,
      orderBy: 'startTime',
    });
    return (response.data.items || []).map((event) => ({
      id: event.id,
      title: event.summary,
      start: event.start,
      end: event.end,
      attendees: event.attendees?.map((attendee) => attendee.email) || [],
      link: event.htmlLink,
    }));
  } catch (error) {
    if (error.statusCode) throw error;
    throw new AppError('Google Calendar request failed. Reconnect Google and try again.', 502);
  }
};

const createReminder = async ({ userId, title, remindAt, timeZone }) => {
  const start = new Date(remindAt);
  if (Number.isNaN(start.getTime())) throw new AppError('A valid reminder time is required', 400);

  try {
    const calendar = await getCalendarClient(userId);
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: `Reminder: ${title}`,
        start: { dateTime: start.toISOString(), timeZone },
        end: { dateTime: new Date(start.getTime() + 15 * 60 * 1_000).toISOString(), timeZone },
        reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 0 }] },
      },
    });
    return { id: response.data.id, title: response.data.summary, start: response.data.start, link: response.data.htmlLink };
  } catch (error) {
    if (error.statusCode) throw error;
    throw new AppError('Google Calendar request failed. Reconnect Google and try again.', 502);
  }
};

const summarizeUpcomingEvents = async (userId, query) => {
  const events = await findEvents(userId, { query });
  const preferences = await UserPreference.findOne({ where: { userId } });
  const summary = await aiService.generateResponse({
    userId,
    userMessage: `Summarize these upcoming calendar events. Highlight timing, attendees, and any preparation that is explicitly implied. Do not invent details.\n\n${JSON.stringify(events)}`,
    conversationHistory: [],
    userPreferences: preferences,
    userMemory: [],
  });
  return { summary, events };
};

module.exports = { createEvent, createReminder, findEvents, summarizeUpcomingEvents };
