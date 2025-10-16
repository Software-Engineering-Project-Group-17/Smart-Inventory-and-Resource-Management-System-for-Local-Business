import { jest } from '@jest/globals';

jest.unstable_mockModule('../utils/db.js', () => {
  return {
    query: jest.fn().mockResolvedValue({
      rows: [{
        total_stock: '150',
        low_stock: '20',
        out_of_stock: '10',
        total_value: '9876.54',
        stock_change: '3.2',
        value_change: '5.8',
        stock_health_score: '80.0',
        avg_turnover: '7.5'
      }]
    })
  };
});

const { query } = await import('../utils/db.js');
const { getMetrics } = await import('../controllers/inventoryController.js');

const resMock = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

let errSpy;
beforeEach(() => {
  errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  errSpy.mockRestore();
  jest.clearAllMocks();
});

describe('inventoryController.getMetrics', () => {
  it('passes branchId param and maps numeric metrics', async () => {
    const req = { query: { branchId: 'b8' } };
    const res = resMock();

    await getMetrics(req, res);

    const [, params] = query.mock.calls[0];
    expect(params).toEqual(['b8']);

    expect(res.json).toHaveBeenCalledWith({
      totalStock: 150,
      lowStock: 20,
      outOfStock: 10,
      totalValue: 9876.54,
      stockChange: 3.2,
      valueChange: 5.8,
      stockHealthScore: 80.0,
      avgTurnover: 7.5,
      criticalItems: 20
    });
  });

  it('handles DB error with 500', async () => {
    query.mockRejectedValueOnce(new Error('db down'));
    const req = { query: {} };
    const res = resMock();

    await getMetrics(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch inventory metrics' });
    expect(errSpy).toHaveBeenCalled();
  });
});
