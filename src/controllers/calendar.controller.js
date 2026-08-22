const calendarService = require('../integrations/google/calendar.service');

const createEvent = async (req, res, next) => {
  try {
    const event = await calendarService.createEvent(req.body);
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

const createReminder = async (req, res, next) => {
  try {
    const reminder = await calendarService.createReminder(req.body);
    res.status(201).json({ success: true, data: reminder });
  } catch (error) {
    next(error);
  }
};

const findEvents = async (req, res, next) => {
  try {
    const events = await calendarService.findEvents(req.query.userId, req.query);
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

const summarizeEvents = async (req, res, next) => {
  try {
    const data = await calendarService.summarizeUpcomingEvents(req.body.userId, req.body.query);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = { createEvent, createReminder, findEvents, summarizeEvents };
