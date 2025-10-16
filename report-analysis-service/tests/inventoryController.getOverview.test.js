import { jest } from '@jest/globals';

jest.unstable_mockModule('../utils/db.js', () => {
  return {
    query: jest.fn().mockResolvedValue({
      rows: [{ total_stock: '100', low_stock: '15', out_of_stock: '5', total_value: '12345.67' }]
    })
  };
});

const { query } = await import('../utils/db.js');
const { getOverview } = await import('../controllers/inventoryController.js');

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

describe('inventoryController.getOverview', () => {
  it('uses branchId param and maps fields with stock health', async () => {
    const req = { query: { branchId: 'b1' } };
    const res = resMock();

    await getOverview(req, res);

    const [, params] = query.mock.calls[0];
    expect(params).toEqual(['b1']);

    // stockHealth = ((100 - 15 - 5)/100) * 100 = 80.0
    expect(res.json).toHaveBeenCalledWith({
      totalStock: 100,
      lowStock: 15,
      outOfStock: 5,
      totalValue: 12345.67,
      stockHealthScore: 80.0,
      avgTurnover: 7.5
    });
  });

  it('handles DB error with 500', async () => {
    query.mockRejectedValueOnce(new Error('db down'));
    const req = { query: {} };
    const res = resMock();

    await getOverview(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch inventory overview' });
    expect(errSpy).toHaveBeenCalled();
  });
});
