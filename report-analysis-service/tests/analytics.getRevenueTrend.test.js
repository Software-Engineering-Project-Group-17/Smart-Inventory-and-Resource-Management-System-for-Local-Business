import { jest } from '@jest/globals';

jest.unstable_mockModule('../utils/db.js', () => ({
  query: jest.fn()
}));
const { query } = await import('../utils/db.js');

const { default: analytics } = await import('../controllers/analyticsController.js');
const { getRevenueTrend } = analytics;

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

describe('analytics.getRevenueTrend', () => {
  it('without branchId: params = [days]', async () => {
    query.mockResolvedValueOnce({
      rows: [
        { date: '01/01', revenue: '10.5' },
        { date: '01/02', revenue: '0'  },
        { date: '01/03', revenue: '2.3' }
      ]
    });

    const req = { query: { days: '3' } };
    const res = resMock();

    await getRevenueTrend(req, res);

    expect(query.mock.calls[0][1]).toEqual([3]);
    expect(res.json).toHaveBeenCalledWith([
      { date: '01/01', revenue: 10.5 },
      { date: '01/02', revenue: 0 },
      { date: '01/03', revenue: 2.3 }
    ]);
  });

  it('with branchId: params = [branchId, days]', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    const req = { query: { branchId: 'b2', days: '7' } };
    const res = resMock();

    await getRevenueTrend(req, res);

    expect(query.mock.calls[0][1]).toEqual(['b2', 7]);
  });

  it('500 on error', async () => {
    query.mockRejectedValueOnce(new Error('x'));
    const req = { query: {} };
    const res = resMock();

    await getRevenueTrend(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(errSpy).toHaveBeenCalled();
  });
});
