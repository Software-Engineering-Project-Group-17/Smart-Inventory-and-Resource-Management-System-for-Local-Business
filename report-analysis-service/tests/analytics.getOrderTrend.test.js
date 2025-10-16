import { jest } from '@jest/globals';

jest.unstable_mockModule('../utils/db.js', () => ({
  query: jest.fn()
}));
const { query } = await import('../utils/db.js');

const { default: analytics } = await import('../controllers/analyticsController.js');
const { getOrderTrend } = analytics;

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

describe('analytics.getOrderTrend', () => {
  it('maps orders as int, default days clamp', async () => {
    query.mockResolvedValueOnce({
      rows: [
        { date: '01/01', orders: '1' },
        { date: '01/02', orders: '0' }
      ]
    });

    const req = { query: {} }; // default 30
    const res = resMock();

    await getOrderTrend(req, res);

    expect(query.mock.calls[0][1]).toEqual([30]);
    expect(res.json).toHaveBeenCalledWith([
      { date: '01/01', orders: 1 },
      { date: '01/02', orders: 0 }
    ]);
  });

  it('with branchId: params = [branchId, days]', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    const req = { query: { branchId: 'x', days: '5' } };
    const res = resMock();

    await getOrderTrend(req, res);

    expect(query.mock.calls[0][1]).toEqual(['x', 5]);
  });

  it('500 on error', async () => {
    query.mockRejectedValueOnce(new Error('err'));
    const req = { query: {} };
    const res = resMock();

    await getOrderTrend(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(errSpy).toHaveBeenCalled();
  });
});
