jest.mock('../src/queues/documentProcessing.queue', () => ({
  enqueueDocumentProcessing: jest.fn(),
}));

const request = require('supertest');
const app = require('../src/app');

describe('API validation and health', () => {
  test('returns the health response', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, message: 'Financial Assistant API is running' });
  });

  test('serves OpenAPI documentation', async () => {
    const response = await request(app).get('/api-docs.json');

    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe('3.0.3');
    expect(response.body.paths['/api/telegram/webhook']).toBeDefined();
  });

  test('rejects an invalid user id', async () => {
    const response = await request(app).get('/api/users/not-a-uuid');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test('rejects invalid preference data', async () => {
    const response = await request(app)
      .put('/api/users/not-a-uuid/preferences')
      .send({ dailyBriefTime: '25:70' });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual(expect.any(Array));
  });

  test('rejects an invalid conversation request', async () => {
    const response = await request(app).post('/api/conversations').send({ userId: 'invalid' });

    expect(response.status).toBe(400);
  });

  test('ignores an unsupported Telegram update without database access', async () => {
    const response = await request(app).post('/api/telegram/webhook').send({});

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, ignored: true });
  });

  test('rejects an unauthenticated Telegram webhook when a secret is configured', async () => {
    process.env.TELEGRAM_WEBHOOK_SECRET = 'test-webhook-secret';

    const response = await request(app).post('/api/telegram/webhook').send({});

    delete process.env.TELEGRAM_WEBHOOK_SECRET;
    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ success: false });
  });

  test('rejects invalid watchlist and alert requests', async () => {
    const [watchlistResponse, alertResponse] = await Promise.all([
      request(app).post('/api/watchlist').send({ userId: 'invalid', symbol: 'INVALID-SYMBOL' }),
      request(app).post('/api/alerts').send({
        userId: 'invalid',
        symbol: 'TSLA',
        alertType: 'important_news',
        condition: 'percentage_change',
      }),
    ]);

    expect(watchlistResponse.status).toBe(400);
    expect(alertResponse.status).toBe(400);
  });

  test('rejects a document upload missing required data', async () => {
    const response = await request(app).post('/api/documents/upload');

    expect(response.status).toBe(400);
  });
});
