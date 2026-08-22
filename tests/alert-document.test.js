const { validateAlertDefinition } = require('../src/services/alert/alert.service');
const { chunkText, retrieveRelevantChunks } = require('../src/services/document/documentChunk.service');

describe('Alerts and documents', () => {
  test('accepts supported alerts and rejects invalid combinations', () => {
    expect(() => validateAlertDefinition({
      alertType: 'price_movement',
      condition: 'percentage_change',
      threshold: 5,
    })).not.toThrow();
    expect(() => validateAlertDefinition({
      alertType: 'important_news',
      condition: 'percentage_change',
    })).toThrow('supported alert');
  });

  test('chunks a document and returns relevant excerpts', () => {
    const text = `${'Revenue increased year over year. '.repeat(120)}The primary risk is customer concentration.`;
    const chunks = chunkText(text).map((content, chunkIndex) => ({ content, chunkIndex }));
    const results = retrieveRelevantChunks(chunks, 'What is the primary risk?');

    expect(chunks.length).toBeGreaterThan(1);
    expect(results[0].content).toContain('primary risk');
  });
});
