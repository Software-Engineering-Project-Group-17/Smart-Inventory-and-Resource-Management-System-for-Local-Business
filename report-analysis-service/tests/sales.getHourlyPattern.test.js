import { jest } from '@jest/globals';

jest.unstable_mockModule('../utils/db.js', () => ({ query: jest.fn() }));
const { query } = await import('../utils/db.js');

const { default: sales } = await import('../controllers/salesController.js');
const { getHourlyPattern } = sales;

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

describe('sales.getHourlyPattern', () => {
  it('returns 24 rows and maps provided hours', async () => {
    query.mockResolvedValueOnce({
      rows: [
        { hour: '0', sales: '10.5', orders: '2' },
        { hour: '13', sales: '30', orders: '5' },
        { hour: '23', sales: '1.25', orders: '1' },
      ]
    });

    const req = { query: { days: '3' } };
    const res = resMock();
    await getHourlyPattern(req, res);

    const out = res.json.mock.calls[0][0];
    expect(out).toHaveLength(24);
    expect(out[0]).toEqual({ hour: 0, sales: 10.5, orders: 2 });
    expect(out[13]).toEqual({ hour: 13, sales: 30, orders: 5 });
    expect(out[23]).toEqual({ hour: 23, sales: 1.25, orders: 1 });

    // first param is startDate
    const params = query.mock.calls[0][1];
    expect(params[0]).toEqual(expect.any(Date));
  });

  it('adds branch + category filters', async () => {
    query.mockResolvedValueOnce({ rows: [] });

    const req = { query: { branchId: 'b1', categoryId: '8' } };
    const res = resMock();
    await getHourlyPattern(req, res);

    const params = query.mock.calls[0][1];
    // [start, branchId, categoryId]
    expect(params).toHaveLength(3);
    expect(params[1]).toBe('b1');
    expect(params[2]).toBe(8);
  });

  it('500 on error', async () => {
    query.mockRejectedValueOnce(new Error('err'));
    const req = { query: {} };
    const res = resMock();

    await getHourlyPattern(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(errSpy).toHaveBeenCalled();
  });
});
