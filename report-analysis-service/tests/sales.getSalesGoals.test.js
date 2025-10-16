import { jest } from '@jest/globals';

jest.unstable_mockModule('../utils/db.js', () => ({ query: jest.fn() }));
const { query } = await import('../utils/db.js');

const { default: sales } = await import('../controllers/salesController.js');
const { getSalesGoals } = sales;

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

describe('sales.getSalesGoals', () => {
  it('returns goal math with default target 120k', async () => {
    query.mockResolvedValueOnce({ rows: [{ achieved: '30000' }] });

    const req = { query: {} };
    const res = resMock();
    await getSalesGoals(req, res);

    expect(res.json).toHaveBeenCalledWith({
      target: 120000,
      achieved: 30000,
      achievementPercent: 25.0,
      remaining: 90000
    });
  });

  it('supports branch + category params', async () => {
    query.mockResolvedValueOnce({ rows: [{ achieved: '0' }] });

    const req = { query: { branchId: 'b8', categoryId: '11' } };
    const res = resMock();
    await getSalesGoals(req, res);

    const params = query.mock.calls[0][1];
    expect(params).toEqual(['b8', 11]);
  });

  it('500 on error', async () => {
    query.mockRejectedValueOnce(new Error('boom'));
    const req = { query: {} };
    const res = resMock();
    await getSalesGoals(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(errSpy).toHaveBeenCalled();
  });
});
