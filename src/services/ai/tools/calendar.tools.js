const createCalendarEvent = async ({ title, startDateTime, endDateTime, timeZone, attendees }, context) => {
  if (!context.userId) return { available: false, message: 'A user context is required to create a calendar event.' };

  try {
    const calendarService = require('../../../integrations/google/calendar.service');
    const event = await calendarService.createEvent({
      userId: context.userId,
      title,
      startDateTime,
      endDateTime,
      timeZone,
      attendees: attendees || [],
    });
    return { available: true, data: event };
  } catch (error) {
    return { available: false, message: error.message };
  }
};

const createCalendarReminder = async ({ title, remindAt, timeZone }, context) => {
  if (!context.userId) return { available: false, message: 'A user context is required to create a reminder.' };

  try {
    const calendarService = require('../../../integrations/google/calendar.service');
    return { available: true, data: await calendarService.createReminder({ userId: context.userId, title, remindAt, timeZone }) };
  } catch (error) {
    return { available: false, message: error.message };
  }
};

module.exports = { createCalendarEvent, createCalendarReminder };
