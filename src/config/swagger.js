const swaggerJSDoc = require('swagger-jsdoc');

const uuidParameter = (name, location = 'path') => ({
  name,
  in: location,
  required: true,
  schema: { type: 'string', format: 'uuid' },
});

const successResponse = (description = 'Successful response') => ({
  description,
  content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
});

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'AI Financial Assistant API',
      version: '1.0.0',
      description: 'REST API for the Telegram-first AI financial assistant.',
    },
    servers: [{ url: 'http://localhost:5000', description: 'Local development server' }],
    tags: [
      { name: 'Health' },
      { name: 'Users' },
      { name: 'Preferences' },
      { name: 'Conversations' },
      { name: 'Watchlist' },
      { name: 'Documents' },
      { name: 'Alerts' },
      { name: 'Telegram' },
    ],
    components: {
      schemas: {
        SuccessResponse: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: {} } },
        ErrorResponse: {
          type: 'object',
          properties: { success: { type: 'boolean', example: false }, message: { type: 'string' } },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' }, telegramId: { type: 'string' }, name: { type: 'string' },
            username: { type: 'string', nullable: true }, email: { type: 'string', format: 'email', nullable: true },
            role: { type: 'string', enum: ['user', 'admin'] }, timezone: { type: 'string' }, isActive: { type: 'boolean' },
          },
        },
        UserPreference: {
          type: 'object',
          properties: {
            role: { type: 'string', nullable: true }, preferredIndustries: { type: 'array', items: { type: 'string' } },
            preferredCompanies: { type: 'array', items: { type: 'string' } }, preferredTopics: { type: 'array', items: { type: 'string' } },
            dailyBriefTime: { type: 'string', example: '08:30', nullable: true }, notificationEnabled: { type: 'boolean' }, timezone: { type: 'string' },
          },
        },
        Conversation: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, userId: { type: 'string', format: 'uuid' }, title: { type: 'string' } } },
        Message: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, role: { type: 'string', enum: ['user', 'assistant', 'system'] }, content: { type: 'string' }, metadata: { type: 'object' } } },
        WatchlistItem: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, userId: { type: 'string', format: 'uuid' }, symbol: { type: 'string', example: 'NVDA' }, companyName: { type: 'string' } } },
        Alert: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, symbol: { type: 'string' }, alertType: { type: 'string', enum: ['price_movement', 'important_news'] }, condition: { type: 'string', enum: ['percentage_change', 'new_news'] }, threshold: { type: 'number', nullable: true }, isActive: { type: 'boolean' } } },
        FinancialDocument: { type: 'object', properties: { id: { type: 'string', format: 'uuid' }, fileName: { type: 'string' }, mimeType: { type: 'string' }, status: { type: 'string', enum: ['pending', 'processing', 'completed', 'failed'] }, summary: { type: 'string', nullable: true } } },
      },
      responses: {
        NotFound: {
          description: 'Requested resource was not found',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
        },
      },
    },
    paths: {
      '/api/health': { get: { tags: ['Health'], summary: 'Check API availability', responses: { 200: successResponse() } } },
      '/api/users/{id}': {
        get: { tags: ['Users'], parameters: [uuidParameter('id')], responses: { 200: successResponse(), 404: { $ref: '#/components/responses/NotFound' } } },
        put: { tags: ['Users'], parameters: [uuidParameter('id')], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } }, responses: { 200: successResponse() } },
      },
      '/api/users/{userId}/preferences': {
        get: { tags: ['Preferences'], parameters: [uuidParameter('userId')], responses: { 200: successResponse() } },
        put: { tags: ['Preferences'], parameters: [uuidParameter('userId')], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UserPreference' } } } }, responses: { 200: successResponse() } },
      },
      '/api/conversations': {
        post: { tags: ['Conversations'], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['userId'], properties: { userId: { type: 'string', format: 'uuid' }, title: { type: 'string' } } } } } }, responses: { 201: successResponse('Conversation created') } },
        get: { tags: ['Conversations'], parameters: [uuidParameter('userId', 'query'), { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } }, { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } }], responses: { 200: successResponse() } },
      },
      '/api/conversations/{id}': { get: { tags: ['Conversations'], parameters: [uuidParameter('id')], responses: { 200: successResponse() } } },
      '/api/conversations/{id}/messages': { get: { tags: ['Conversations'], parameters: [uuidParameter('id'), { name: 'page', in: 'query', schema: { type: 'integer' } }, { name: 'limit', in: 'query', schema: { type: 'integer' } }], responses: { 200: successResponse() } } },
      '/api/watchlist': {
        post: { tags: ['Watchlist'], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/WatchlistItem' } } } }, responses: { 201: successResponse() } },
        get: { tags: ['Watchlist'], parameters: [uuidParameter('userId', 'query')], responses: { 200: successResponse() } },
      },
      '/api/watchlist/{id}': { delete: { tags: ['Watchlist'], parameters: [uuidParameter('id')], responses: { 200: successResponse() } } },
      '/api/documents/upload': {
        post: { tags: ['Documents'], requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', required: ['userId', 'document'], properties: { userId: { type: 'string', format: 'uuid' }, document: { type: 'string', format: 'binary' } } } } } }, responses: { 202: successResponse('Document accepted for processing') } },
      },
      '/api/documents/{id}/questions': {
        post: { tags: ['Documents'], parameters: [uuidParameter('id')], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['userId', 'question'], properties: { userId: { type: 'string', format: 'uuid' }, question: { type: 'string' } } } } } }, responses: { 200: successResponse() } },
      },
      '/api/alerts': {
        post: { tags: ['Alerts'], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Alert' } } } }, responses: { 201: successResponse() } },
        get: { tags: ['Alerts'], parameters: [uuidParameter('userId', 'query')], responses: { 200: successResponse() } },
      },
      '/api/alerts/{id}': { delete: { tags: ['Alerts'], parameters: [uuidParameter('id')], responses: { 200: successResponse() } } },
      '/api/telegram/webhook': {
        post: { tags: ['Telegram'], summary: 'Receive a Telegram update', parameters: [{ name: 'x-telegram-bot-api-secret-token', in: 'header', required: false, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } }, responses: { 200: successResponse() } },
      },
    },
  },
  apis: [],
});

module.exports = swaggerSpec;
