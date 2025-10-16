import { jest } from '@jest/globals';

// Mock DB
jest.unstable_mockModule('../utils/db.js', () => {
  return {
    query: jest.fn().mockResolvedValue({
      rows: [{
        total_customers: '123',
        total_revenue: '4567.89',
        avg_customer_value: '37.128',
        new_count: '12',
        customer_growth: '8.5',
        retention_rate: '84',
        vip_revenue_percent: '60'
      }]
    })
  };
});

const { query } = await import('../utils/db.js');
const { getMetrics } = await import('../controllers/customerController.js');

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

describe('customerController.getMetrics', () => {
  it('uses branchId and maps numeric fields', async () => {
    const req = { query: { branchId: 'b7' } };
    const res = resMock();

    await getMetrics(req, res);

    const [, params] = query.mock.calls[0];
    expect(params).toEqual(['b7']);

    expect(res.json).toHaveBeenCalledWith({
      totalCustomers: 123,
      totalRevenue: 4567.89,
      avgCustomerValue: 37.128,
      newCustomers: 12,
      customerGrowth: 8.5,
      retentionRate: 84,
      vipRevenue: 60
    });
  });

  it('handles DB error with 500', async () => {
    query.mockRejectedValueOnce(new Error('db down'));
    const req = { query: {} };
    const res = resMock();

    await getMetrics(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch customer metrics' });
    expect(errSpy).toHaveBeenCalled();
  });
});
