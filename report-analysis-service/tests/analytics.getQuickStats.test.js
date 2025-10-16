import { jest } from '@jest/globals';

jest.unstable_mockModule('../utils/db.js', () => ({
  query: jest.fn()
}));
const { query } = await import('../utils/db.js');

const { default: analytics } = await import('../controllers/analyticsController.js');
const { getQuickStats } = analytics;

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

describe('analytics.getQuickStats', () => {
  it('maps numbers and passes [start] when no branch', async () => {
    query.mockResolvedValueOnce({
      rows: [{ revenue: '1000.5', orders: '7', aov: '142.93', revenue_mtd: '4500' }]
    });

    const req = { query: {} };
    const res = resMock();

    await getQuickStats(req, res);

    expect(query.mock.calls[0][1]).toEqual([expect.any(Date)]);
    expect(res.json).toHaveBeenCalledWith({
      period: '30d',
      revenue: 1000.5,
      orders: 7,
      avgOrderValue: 142.93,
      monthToDateRevenue: 4500
    });
  });

  it('passes [start, branchId] when branch specified', async () => {
    query.mockResolvedValueOnce({ rows: [{ revenue: 0, orders: 0, aov: 0, revenue_mtd: 0 }] });
    const req = { query: { branchId: 'b1' } };
    const res = resMock();

    await getQuickStats(req, res);

    expect(query.mock.calls[0][1]).toEqual([expect.any(Date), 'b1']);
  });

  it('500 on error', async () => {
    query.mockRejectedValueOnce(new Error('nope'));
    const req = { query: {} };
    const res = resMock();

    await getQuickStats(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(errSpy).toHaveBeenCalled();
  });
});
