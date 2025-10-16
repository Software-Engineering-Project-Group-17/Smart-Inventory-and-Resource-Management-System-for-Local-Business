import { jest } from '@jest/globals';

jest.unstable_mockModule('../utils/db.js', () => ({ query: jest.fn() }));
const { query } = await import('../utils/db.js');

const { default: sales } = await import('../controllers/salesController.js');
const { getSalesMetrics } = sales;

const resMock = () => {
  const r = {};
  r.status = jest.fn().mockReturnValue(r);
  r.json   = jest.fn().mockReturnValue(r);
  return r;
};

let errSpy;
beforeEach(() => {
  query.mockReset();
  errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => errSpy.mockRestore());

describe('sales.getSalesMetrics', () => {
  it('maps KPIs and growth', async () => {
    query.mockResolvedValueOnce({
      rows: [{
        total_sales: '2000',
        total_orders: '10',
        avg_order_value: '200',
        weekly_growth: '25.5',
        conversion_rate: '3.2'
      }]
    });

    const req = { query: {} };
    const res = resMock();
    await getSalesMetrics(req, res);

    expect(res.json).toHaveBeenCalledWith({
      totalSales: 2000,
      totalOrders: 10,
      avgOrderValue: 200,
      weeklyGrowth: 25.5,
      conversionRate: 3.2
    });
  });

  it('passes branch + category as params (same index in both periods)', async () => {
    query.mockResolvedValueOnce({ rows: [{ total_sales: 0, total_orders: 0, avg_order_value: 0, weekly_growth: 0, conversion_rate: 0 }] });

    const req = { query: { branchId: 'b2', categoryId: '3' } };
    const res = resMock();
    await getSalesMetrics(req, res);

    const params = query.mock.calls[0][1];
    expect(params).toEqual(['b2', 3]); // appears once but used twice in SQL
  });

  it('500 on error', async () => {
    query.mockRejectedValueOnce(new Error('down'));
    const req = { query: {} };
    const res = resMock();
    await getSalesMetrics(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(errSpy).toHaveBeenCalled();
  });
});
