import { jest } from '@jest/globals';

jest.unstable_mockModule('../utils/db.js', () => ({
  query: jest.fn()
}));
const { query } = await import('../utils/db.js');

const { default: analytics } = await import('../controllers/analyticsController.js');
const { getQuickInsights } = analytics;

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

describe('analytics.getQuickInsights', () => {
  it('passes [start, branchId|null, prevStart] and builds insights', async () => {
    query.mockResolvedValueOnce({
      rows: [{
        cur_rev: '2000',
        prev_rev: '1000',
        low_stock_items: '3',
        top_category: 'Snacks'
      }]
    });

    const req = { query: { branchId: '42', period: '7d' } };
    const res = resMock();

    await getQuickInsights(req, res);

    const [, params] = query.mock.calls[0];
    expect(params[0]).toEqual(expect.any(Date)); // start
    expect(params[1]).toBe(42);                  // branchId as int or null
    expect(params[2]).toEqual(expect.any(Date)); // prevStart

    expect(res.json).toHaveBeenCalledWith([
      { type: 'positive', text: expect.stringMatching(/Revenue rose/) },
      { type: 'info', text: 'Top category: Snacks' },
      { type: 'alert', text: '3 item(s) are at or below low-stock threshold' }
    ]);
  });

  it('handles null branchId cleanly and negative growth path', async () => {
    query.mockResolvedValueOnce({
      rows: [{ cur_rev: '400', prev_rev: '800', low_stock_items: '0', top_category: null }]
    });

    const req = { query: { branchId: '', period: '30d' } };
    const res = resMock();

    await getQuickInsights(req, res);

    const [, params] = query.mock.calls[0];
    expect(params[1]).toBeNull();

    expect(res.json.mock.calls[0][0][0]).toMatchObject({ type: 'warning' });
  });

  it('500 on error', async () => {
    query.mockRejectedValueOnce(new Error('boom'));
    const req = { query: {} };
    const res = resMock();

    await getQuickInsights(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(errSpy).toHaveBeenCalled();
  });
});
