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

The API runs at `http://localhost:5000` by default.

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
