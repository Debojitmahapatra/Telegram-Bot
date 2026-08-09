const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

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

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/health', healthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/integrations/google/gmail', gmailRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
