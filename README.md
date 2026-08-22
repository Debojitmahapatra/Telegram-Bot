# AI Financial Assistant Backend

## Phase 1

### Install

```bash
npm install
```

### Configure PostgreSQL

Create a PostgreSQL database named `financial_assistant`, then set the `DB_*`
variables in `.env` to match your local PostgreSQL credentials.

### Run migrations

```bash
npx sequelize-cli db:migrate
```

### Run

```bash
npm run dev
```

### Security configuration

Set `CORS_ORIGIN` to the browser frontend origin. For Telegram webhooks, set a
random `TELEGRAM_WEBHOOK_SECRET` and configure Telegram with the same secret
token. API requests are rate-limited by `RATE_LIMIT_WINDOW_MS` and
`RATE_LIMIT_MAX`.

The API runs at `http://localhost:5000` by default.

Interactive API documentation is available at `http://localhost:5000/api-docs`.

### Health check

```bash
curl http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "Financial Assistant API is running"
}
```
