import { jest } from '@jest/globals';

jest.unstable_mockModule('../utils/db.js', () => {
  return {
    query: jest.fn().mockResolvedValue({
      rows: [
        { item: 'Soda', current_stock: 0,  reorder_point: 10, supplier: 'Generic Supplier', urgency: 'high' },
        { item: 'Chips', current_stock: 4, reorder_point: 10, supplier: 'Generic Supplier', urgency: 'medium' },
      ]
    })
  };
});

const { query } = await import('../utils/db.js');
const { getReorderAlerts } = await import('../controllers/inventoryController.js');

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

describe('inventoryController.getReorderAlerts', () => {
  it('passes branchId param and returns rows as-is', async () => {
    const req = { query: { branchId: 'b4' } };
    const res = resMock();

    await getReorderAlerts(req, res);

    const [, params] = query.mock.calls[0];
    expect(params).toEqual(['b4']);

    expect(res.json).toHaveBeenCalledWith([
      { item: 'Soda',  current_stock: 0, reorder_point: 10, supplier: 'Generic Supplier', urgency: 'high' },
      { item: 'Chips', current_stock: 4, reorder_point: 10, supplier: 'Generic Supplier', urgency: 'medium' },
    ]);
  });

  it('handles DB error with 500', async () => {
    query.mockRejectedValueOnce(new Error('db down'));
    const req = { query: {} };
    const res = resMock();

    await getReorderAlerts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch reorder alerts' });
    expect(errSpy).toHaveBeenCalled();
  });
});
