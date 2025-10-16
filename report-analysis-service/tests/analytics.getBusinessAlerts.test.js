import { jest } from '@jest/globals';

jest.unstable_mockModule('../utils/db.js', () => ({
  query: jest.fn()
}));
const { query } = await import('../utils/db.js');

const { default: analytics } = await import('../controllers/analyticsController.js');
const { getBusinessAlerts } = analytics;

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

describe('analytics.getBusinessAlerts', () => {
  it('passes [start, branchId|null, prevStart] and returns spike info', async () => {
    query.mockResolvedValueOnce({
      rows: [{ cur_rev: '2300', prev_rev: '2000', low_stock_items: '0' }]
    });

    const req = { query: { branchId: '3', lookbackDays: '10' } };
    const res = resMock();

    await getBusinessAlerts(req, res);

    const [, params] = query.mock.calls[0];
    expect(params[0]).toEqual(expect.any(Date)); // start
    expect(params[1]).toBe(3);                   // branchId as int or null
    expect(params[2]).toEqual(expect.any(Date)); // prevStart

    expect(res.json).toHaveBeenCalledWith([
      { type: 'revenue-spike', severity: 'info', message: expect.stringMatching(/Revenue up/) }
    ]);
  });

  it('returns revenue-drop alerts and low-stock alert', async () => {
    query.mockResolvedValueOnce({
      rows: [{ cur_rev: '800', prev_rev: '1000', low_stock_items: '12' }]
    });

    const req = { query: { branchId: '', lookbackDays: '7' } };
    const res = resMock();

    await getBusinessAlerts(req, res);

    const [, params] = query.mock.calls[0];
    expect(params[1]).toBeNull();

    const alerts = res.json.mock.calls[0][0];
    expect(alerts.some(a => a.type === 'revenue-drop')).toBe(true);
    expect(alerts.some(a => a.type === 'low-stock')).toBe(true);
  });

  it('500 on error', async () => {
    query.mockRejectedValueOnce(new Error('nope'));
    const req = { query: {} };
    const res = resMock();

    await getBusinessAlerts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(errSpy).toHaveBeenCalled();
  });
});
