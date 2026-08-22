require('dotenv').config();

const app = require('./app');
const { testDatabaseConnection } = require('./config/database');
const { validateEnvironment } = require('./config/env');

require('./models');

const port = Number(process.env.PORT) || 5000;

const startServer = async () => {
  validateEnvironment();
  await testDatabaseConnection();


  app.listen(port, () => {
    console.log(`Financial Assistant API is listening on port http://localhost:${port}`);
  });
};

startServer();
