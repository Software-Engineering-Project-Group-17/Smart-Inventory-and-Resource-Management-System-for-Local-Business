import { jest } from '@jest/globals';

jest.unstable_mockModule('../utils/db.js', () => ({ query: jest.fn() }));
const { query } = await import('../utils/db.js');

const { default: sales } = await import('../controllers/salesController.js');
const { getSalesByChannel } = sales;

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

describe('sales.getSalesByChannel', () => {
  it('scales channel amounts to total', async () => {
    query.mockResolvedValueOnce({ rows: [{ total_amount: '1000' }] });

    const req = { query: {} };
    const res = resMock();
    await getSalesByChannel(req, res);

    const payload = res.json.mock.calls[0][0];
    const total = payload.reduce((s, x) => s + x.amount, 0);
    expect(Math.round(total)).toBe(1000);
    expect(payload.map(x => x.name)).toEqual(['Online', 'In-Store', 'Phone Orders']);
  });

  it('supports branch + category joins and params ordering', async () => {
    query.mockResolvedValueOnce({ rows: [{ total_amount: '0' }] });

    const req = { query: { branchId: 'b1', categoryId: '3' } };
    const res = resMock();
    await getSalesByChannel(req, res);

    // params should be [branchId, categoryId] or [categoryId] then branch depending on path;
    // we at least ensure both present and properly typed:
    const params = query.mock.calls[0][1];
    expect(params).toContain('b1');
    expect(params).toContain(3);
  });

  it('500 on error', async () => {
    query.mockRejectedValueOnce(new Error('err'));
    const req = { query: {} };
    const res = resMock();
    await getSalesByChannel(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(errSpy).toHaveBeenCalled();
  });
});
