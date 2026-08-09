const alertService = require('../services/alert/alert.service');

const createAlert = async (req, res, next) => {
  try {
    const { alert, created } = await alertService.createAlert(req.body);
    res.status(created ? 201 : 200).json({ success: true, data: alert, created });
  } catch (error) {
    next(error);
  }
};

const listAlerts = async (req, res, next) => {
  try {
    const data = await alertService.listAlerts(req.query.userId, req.query.page, req.query.limit);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const deleteAlert = async (req, res, next) => {
  try {
    await alertService.deleteAlert(req.params.id);
    res.status(200).json({ success: true, message: 'Alert deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createAlert, listAlerts, deleteAlert };
