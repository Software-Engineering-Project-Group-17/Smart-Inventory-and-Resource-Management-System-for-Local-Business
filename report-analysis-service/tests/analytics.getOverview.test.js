import { jest } from '@jest/globals';

jest.unstable_mockModule('../utils/db.js', () => ({
  query: jest.fn()
}));
const { query } = await import('../utils/db.js');

const { default: analytics } = await import('../controllers/analyticsController.js');
const { getOverview } = analytics;

const resMock = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

let errSpy;
beforeEach(() => {
  query.mockReset();
  errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => errSpy.mockRestore());

describe('analytics.getOverview', () => {
  it('returns KPIs and status % without branchId', async () => {
    // first query (core + top_category + today/yday)
    query
      .mockResolvedValueOnce({
        rows: [{
          total_revenue: '1200.50',
          total_orders: '6',
          avg_order_value: '200.0833',
          unique_customers: '5',
          today_revenue: '300.50',
          yday_revenue: '200.50',
          top_category: 'Beverages'
        }]
      })
      // second query (status counts)
      .mockResolvedValueOnce({
        rows: [
          { status: 'completed', count: 3 },
          { status: 'processing', count: 1 }
        ]
      });

    const req = { query: { /* no branchId */ } };
    const res = resMock();

    await getOverview(req, res);

    // FIRST call params: [start]
    expect(query.mock.calls[0][1]).toEqual([expect.any(Date)]);
    // SECOND call params: [start]
    expect(query.mock.calls[1][1]).toEqual([expect.any(Date)]);

    expect(res.json).toHaveBeenCalledWith({
      period: '30d',
      totalRevenue: 1200.50,
      totalOrders: 6,
      avgOrderValue: 200.0833,
      uniqueCustomers: 5,
      todayRevenue: 300.50,
      yesterdayRevenue: 200.50,
      dayOverDayChange: parseFloat((((300.5 - 200.5) / 200.5) * 100).toFixed(1)),
      topCategory: 'Beverages',
      orderStatus: [
        { name: 'completed', value: Number(((3 / 4) * 100).toFixed(1)) },
        { name: 'processing', value: Number(((1 / 4) * 100).toFixed(1)) }
      ]
    });
  });

  it('passes branchId as second param to both queries', async () => {
    query
      .mockResolvedValueOnce({ rows: [{}] })
      .mockResolvedValueOnce({ rows: [] });

    const req = { query: { branchId: '5' } };
    const res = resMock();

    await getOverview(req, res);

    expect(query.mock.calls[0][1]).toEqual([expect.any(Date), '5']);
    expect(query.mock.calls[1][1]).toEqual([expect.any(Date), '5']);
  });

  it('500 on db error (first query)', async () => {
    query.mockRejectedValueOnce(new Error('boom'));
    const req = { query: {} };
    const res = resMock();

    await getOverview(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(errSpy).toHaveBeenCalled();
  });
});
