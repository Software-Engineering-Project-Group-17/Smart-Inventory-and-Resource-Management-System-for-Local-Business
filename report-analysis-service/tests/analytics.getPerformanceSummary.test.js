import { jest } from '@jest/globals';

jest.unstable_mockModule('../utils/db.js', () => ({
  query: jest.fn()
}));
const { query } = await import('../utils/db.js');

const { default: analytics } = await import('../controllers/analyticsController.js');
const { getPerformanceSummary } = analytics;

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

describe('analytics.getPerformanceSummary', () => {
  it('without branchId: params = [] and maps weeklyGrowth', async () => {
    query.mockResolvedValueOnce({
      rows: [{
        sales: '1000',
        orders: '10',
        aov: '100',
        prev_sales: '500',
        sales_mtd: '3000'
      }]
    });

    const req = { query: {} };
    const res = resMock();

    await getPerformanceSummary(req, res);

    expect(query.mock.calls[0][1]).toEqual([]);
    expect(res.json).toHaveBeenCalledWith({
      salesThisWeek: 1000,
      ordersThisWeek: 10,
      avgOrderValueThisWeek: 100,
      weeklyGrowth: parseFloat((((1000 - 500) / 500) * 100).toFixed(1)),
      monthToDateSales: 3000
    });
  });

  it('with branchId: params = [branchId]', async () => {
    query.mockResolvedValueOnce({ rows: [{ sales: 0, orders: 0, aov: 0, prev_sales: 0, sales_mtd: 0 }] });
    const req = { query: { branchId: 'z' } };
    const res = resMock();

    await getPerformanceSummary(req, res);

    expect(query.mock.calls[0][1]).toEqual(['z']);
  });

  it('500 on error', async () => {
    query.mockRejectedValueOnce(new Error('boom'));
    const req = { query: {} };
    const res = resMock();

    await getPerformanceSummary(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(errSpy).toHaveBeenCalled();
  });
});
