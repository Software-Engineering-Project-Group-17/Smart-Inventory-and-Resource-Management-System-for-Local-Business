import { jest } from '@jest/globals';

jest.unstable_mockModule('../utils/db.js', () => ({ query: jest.fn() }));
const { query } = await import('../utils/db.js');

const { default: sales } = await import('../controllers/salesController.js');
const { getTopPerformers } = sales;

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

describe('sales.getTopPerformers', () => {
  it('maps rows and clamps limit', async () => {
    query.mockResolvedValueOnce({
      rows: [
        { name: 'Alex Doe', sales: '15000', orders: '12', target: '30000', performance: '50' }
      ]
    });

    const req = { query: { limit: '999' } }; // clamp to 100 but we only check mapping
    const res = resMock();
    await getTopPerformers(req, res);

    const out = res.json.mock.calls[0][0];
    expect(out).toEqual([
      { name: 'Alex Doe', sales: 15000, orders: 12, target: 30000, performance: 50 }
    ]);

    // last param is limit
    const params = query.mock.calls[0][1];
    expect(params.at(-1)).toBe(100);
  });

  it('applies branch + category filters param order before limit', async () => {
    query.mockResolvedValueOnce({ rows: [] });

    const req = { query: { branchId: 'b9', categoryId: '7', limit: '5' } };
    const res = resMock();
    await getTopPerformers(req, res);

    const params = query.mock.calls[0][1];
    // [branchId?, categoryId?, limit]
    expect(params.slice(-1)[0]).toBe(5);
    expect(params).toContain('b9');
    expect(params).toContain(7);
  });

  it('500 on error', async () => {
    query.mockRejectedValueOnce(new Error('down'));
    const req = { query: {} };
    const res = resMock();

    await getTopPerformers(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(errSpy).toHaveBeenCalled();
  });
});
