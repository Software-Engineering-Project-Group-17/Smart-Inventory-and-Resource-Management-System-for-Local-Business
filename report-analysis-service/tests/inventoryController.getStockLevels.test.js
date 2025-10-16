import { jest } from '@jest/globals';

jest.unstable_mockModule('../utils/db.js', () => {
  return {
    query: jest.fn().mockResolvedValue({
      rows: [{ total: '100', in_stock: '70', low_stock: '20', out_of_stock: '10' }]
    })
  };
});

const { query } = await import('../utils/db.js');
const { getStockLevels } = await import('../controllers/inventoryController.js');

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

describe('inventoryController.getStockLevels', () => {
  it('uses branchId param and maps to percentage slices with counts', async () => {
    const req = { query: { branchId: 'b9' } };
    const res = resMock();

    await getStockLevels(req, res);

    const [, params] = query.mock.calls[0];
    expect(params).toEqual(['b9']);

    // percents: 70%, 20%, 10%
    expect(res.json).toHaveBeenCalledWith([
      { name: 'In Stock',     value: 70, count: 70, color: '#10B981' },
      { name: 'Low Stock',    value: 20, count: 20, color: '#F59E0B' },
      { name: 'Out of Stock', value: 10, count: 10, color: '#EF4444' }
    ]);
  });

  it('handles DB error with 500', async () => {
    query.mockRejectedValueOnce(new Error('db down'));
    const req = { query: {} };
    const res = resMock();

    await getStockLevels(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch stock levels' });
    expect(errSpy).toHaveBeenCalled();
  });
});
