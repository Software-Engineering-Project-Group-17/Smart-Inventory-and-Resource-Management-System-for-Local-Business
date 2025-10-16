import { jest } from '@jest/globals';

jest.unstable_mockModule('../utils/db.js', () => {
  return {
    query: jest.fn().mockResolvedValue({
      rows: [
        { name: 'Item A', movement: '220', category: 'Beverages', status: 'High',   velocity: '95' },
        { name: 'Item B', movement: '130', category: 'Snacks',    status: 'Medium', velocity: '72' },
        { name: 'Item C', movement: '60',  category: 'Other',     status: 'Low',    velocity: '45' },
      ]
    })
  };
});

const { query } = await import('../utils/db.js');
const { getTopMoving } = await import('../controllers/inventoryController.js');

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

describe('inventoryController.getTopMoving', () => {
  it('passes branchId + limit + months and maps items', async () => {
    const req = { query: { branchId: 'b7', limit: '2', months: '12' } };
    const res = resMock();

    await getTopMoving(req, res);

    // with branchId: params -> [branchId, limit, months]
    const [, params] = query.mock.calls[0];
    expect(params).toEqual(['b7', 2, 12]);

    expect(res.json).toHaveBeenCalledWith([
      { name: 'Item A', movement: 220, category: 'Beverages', status: 'High',   velocity: 95 },
      { name: 'Item B', movement: 130, category: 'Snacks',    status: 'Medium', velocity: 72 },
      { name: 'Item C', movement:  60, category: 'Other',     status: 'Low',    velocity: 45 },
    ]);
  });

  it('handles DB error with 500', async () => {
    query.mockRejectedValueOnce(new Error('db down'));
    const req = { query: {} };
    const res = resMock();

    await getTopMoving(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch top moving items' });
    expect(errSpy).toHaveBeenCalled();
  });
});
