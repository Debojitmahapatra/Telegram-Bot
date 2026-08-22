jest.mock('../src/integrations/financial/fmp.client', () => ({ request: jest.fn() }));

const { request } = require('../src/integrations/financial/fmp.client');
const financialData = require('../src/integrations/financial/financialData.service');

describe('Financial data service', () => {
  test('maps a verified quote response', async () => {
    request.mockResolvedValue([
      {
        symbol: 'TSLA',
        name: 'Tesla, Inc.',
        price: 250.5,
        change: 3.2,
        changesPercentage: 1.29,
        dayLow: 245,
        dayHigh: 252,
        yearLow: 140,
        yearHigh: 300,
        timestamp: 1,
      },
    ]);

    const quote = await financialData.getStockPrice('TSLA');

    expect(quote).toMatchObject({ symbol: 'TSLA', price: 250.5, changesPercentage: 1.29 });
    expect(request).toHaveBeenCalledWith('quote', { symbol: 'TSLA' });
  });

  test('rejects unavailable quote data', async () => {
    request.mockResolvedValue([]);

    await expect(financialData.getStockPrice('NONE')).rejects.toThrow('No verified data was found for NONE');
  });
});
