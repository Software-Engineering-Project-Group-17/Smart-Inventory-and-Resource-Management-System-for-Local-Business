import { jest } from '@jest/globals';

jest.unstable_mockModule('../utils/db.js', () => {
  return {
    query: jest.fn().mockResolvedValue({
      rows: [
        { category: 'Beverages', stock: '40', low_stock: '8', out_of_stock: '2', value: '5000.25', turnover: '8.2', trend: '12.5' },
        { category: 'Snacks',    stock: '60', low_stock: '6', out_of_stock: '1', value: '7000.00', turnover: '9.1', trend: '10.0' },
      ]
    })
  };
});

const { query } = await import('../utils/db.js');
const { getByCategory } = await import('../controllers/inventoryController.js');

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

describe('inventoryController.getByCategory', () => {
  it('uses branchId param and maps rows', async () => {
    const req = { query: { branchId: 'b2' } };
    const res = resMock();

    await getByCategory(req, res);

    const [, params] = query.mock.calls[0];
    expect(params).toEqual(['b2']);

    expect(res.json).toHaveBeenCalledWith([
      { category: 'Beverages', stock: 40, lowStock: 8, outOfStock: 2, value: 5000.25, turnover: 8.2, trend: 12.5 },
      { category: 'Snacks',    stock: 60, lowStock: 6, outOfStock: 1, value: 7000.00, turnover: 9.1, trend: 10.0 },
    ]);
  });

  it('handles DB error with 500', async () => {
    query.mockRejectedValueOnce(new Error('boom'));
    const req = { query: {} };
    const res = resMock();

    await getByCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch inventory by category' });
    expect(errSpy).toHaveBeenCalled();
  });
});
