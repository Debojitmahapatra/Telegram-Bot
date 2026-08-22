const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const { getCorsOrigins } = require('./config/env');

const errorHandler = require('./middlewares/errorHandler');
const notFoundHandler = require('./middlewares/notFoundHandler');
const healthRoutes = require('./routes/health.routes');
const userRoutes = require('./routes/user.routes');
const conversationRoutes = require('./routes/conversation.routes');
const telegramRoutes = require('./routes/telegram.routes');
const watchlistRoutes = require('./routes/watchlist.routes');
const alertRoutes = require('./routes/alert.routes');
const documentRoutes = require('./routes/document.routes');
const gmailRoutes = require('./routes/gmail.routes');
const calendarRoutes = require('./routes/calendar.routes');
const { apiLimiter } = require('./middlewares/rateLimiter');
const sanitizeRequest = require('./middlewares/sanitizeRequest');
const swaggerSpec = require('./config/swagger');

const app = express();

const allowedOrigins = getCorsOrigins();

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-telegram-bot-api-secret-token'],
}));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(sanitizeRequest);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
  skip: (req) => process.env.NODE_ENV === 'test' || req.path === '/api/health',
}));
app.use('/api', apiLimiter);

app.get('/api-docs.json', (req, res) => res.status(200).json(swaggerSpec));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

app.use('/api/health', healthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/integrations/google/gmail', gmailRoutes);
app.use('/api/integrations/google/calendar', calendarRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
