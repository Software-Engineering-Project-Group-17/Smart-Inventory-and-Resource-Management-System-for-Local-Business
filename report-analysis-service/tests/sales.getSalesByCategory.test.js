import { jest } from '@jest/globals';

jest.unstable_mockModule('../utils/db.js', () => ({ query: jest.fn() }));
const { query } = await import('../utils/db.js');

const { default: sales } = await import('../controllers/salesController.js');
const { getSalesByCategory } = sales;

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

describe('sales.getSalesByCategory', () => {
  it('maps numeric fields and builds start param', async () => {
    query.mockResolvedValueOnce({
      rows: [
        { category_id: '1', category: 'Beverages', sales: '250.75', orders: '3', growth: '0' },
        { category_id: '2', category: 'Snacks',    sales: '100.00', orders: '1', growth: '0' },
      ]
    });

    const req = { query: {} };
    const res = resMock();
    await getSalesByCategory(req, res);

    const params = query.mock.calls[0][1];
    expect(params[0]).toEqual(expect.any(Date)); // startDate
    expect(res.json).toHaveBeenCalledWith([
      { id: 1, category: 'Beverages', sales: 250.75, orders: 3, growth: 0 },
      { id: 2, category: 'Snacks',    sales: 100.00, orders: 1, growth: 0 },
    ]);
  });

  it('adds branch and category filters', async () => {
    query.mockResolvedValueOnce({ rows: [] });

    const req = { query: { branchId: 'b9', categoryId: '12', period: '7d' } };
    const res = resMock();
    await getSalesByCategory(req, res);

    const params = query.mock.calls[0][1];
    expect(params).toHaveLength(3);
    expect(params[0]).toEqual(expect.any(Date));
    expect(params[1]).toBe('b9');
    expect(params[2]).toBe(12);
  });

  it('500 on error', async () => {
    query.mockRejectedValueOnce(new Error('x'));
    const req = { query: {} };
    const res = resMock();
    await getSalesByCategory(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(errSpy).toHaveBeenCalled();
  });
});
