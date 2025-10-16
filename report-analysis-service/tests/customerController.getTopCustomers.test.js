// tests/customerController.getTopCustomers.test.js
import { jest } from '@jest/globals';

// 1) Mock DB before importing the controller
jest.unstable_mockModule('../utils/db.js', () => {
  return {
    query: jest.fn().mockResolvedValue({
      rows: [
        {
          name: 'Alice',
          total_spent: '2500',
          orders: '5',
          avg_order: '500',
          last_purchase: '2024-05-10T00:00:00.000Z',
          segment: 'VIP'
        }
      ]
    })
  };
});

// 2) Import the mocked query + SUT
const { query } = await import('../utils/db.js');
const { getTopCustomers } = await import('../controllers/customerController.js');

// 3) Small response mock helper
const resMock = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

let errSpy;

beforeEach(() => {
  // Silence console.error and let us assert on it
  errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  errSpy.mockRestore();
  jest.clearAllMocks();
});

describe('customerController.getTopCustomers', () => {
  it('uses branchId + limit and maps fields', async () => {
    const req = { query: { branchId: 'b1', limit: '3' } };
    const res = resMock();

    await getTopCustomers(req, res);

    // params should be [branchId, limit]
    const [, params] = query.mock.calls[0];
    expect(params).toEqual(['b1', 3]);

    expect(res.json).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'Alice',
        totalSpent: 2500,
        orders: 5,
        avgOrder: 500,
        segment: 'VIP',
        lastPurchase: expect.any(String), // localized date
      })
    ]);
  });

  it('returns 500 when DB fails', async () => {
    // make this call fail
    query.mockRejectedValueOnce(new Error('db down'));

    const req = { query: {} };
    const res = resMock();

    await getTopCustomers(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch top customers' });

    // (optional) verify we logged
    expect(errSpy).toHaveBeenCalled();
    expect(String(errSpy.mock.calls[0][0])).toContain('Error in getTopCustomers');
  });
});
