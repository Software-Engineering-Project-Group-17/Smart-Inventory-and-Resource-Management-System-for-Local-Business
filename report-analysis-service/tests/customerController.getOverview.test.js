// ESM: bring jest into scope
import { jest } from '@jest/globals';

// 1) Mock the DB module **before** importing the controller
jest.unstable_mockModule('../utils/db.js', () => {
  return {
    query: jest.fn().mockResolvedValue({
      rows: [{
        total_customers: '2',
        total_revenue: '100',
        avg_customer_value: '50',
        new_count: '1',
        customer_growth: '8.5',
        retention_rate: '84.0'
      }]
    })
  };
});

// 2) Now import the mocked query + the controller
const { query } = await import('../utils/db.js');
const { getOverview } = await import('../controllers/customerController.js');

// tiny helper to fake res
function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
}

describe('customerController.getOverview', () => {
  it('returns numbers and uses branchId as a parameter', async () => {
    const req = { query: { branchId: 'branch-123' } };
    const res = makeRes();

    await getOverview(req, res);

    expect(res.json).toHaveBeenCalledWith({
      totalCustomers: 2,
      totalRevenue: 100,
      avgCustomerValue: 50,
      newCustomers: 1,
      customerGrowth: 8.5,
      retentionRate: 84
    });

    // verify DB params include the branchId
    expect(query).toHaveBeenCalled();
    const [, params] = query.mock.calls[0];
    expect(params).toEqual(['branch-123']);
  });

  it('handles no branchId (all branches) and still responds', async () => {
    const req = { query: {} };
    const res = makeRes();

    await getOverview(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      totalCustomers: 2,
      totalRevenue: 100
    }));

    const [, params] = query.mock.calls.at(-1);
    expect(params).toEqual([]); // no params when branchId missing
  });
});
