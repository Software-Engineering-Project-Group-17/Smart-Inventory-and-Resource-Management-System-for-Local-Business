import { jest } from '@jest/globals';

// Mock DB — include a row that would compute retention < 20 to verify clamping
jest.unstable_mockModule('../utils/db.js', () => {
  return {
    query: jest.fn().mockResolvedValue({
      rows: [
        { cohort: 'Month 1', retention: '95' },
        { cohort: 'Month 2', retention: '10' }, // should clamp to 20
        { cohort: 'Month 3', retention: '40' },
      ]
    })
  };
});

const { query } = await import('../utils/db.js');
const { getRetention } = await import('../controllers/customerController.js');

const resMock = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

let errSpy;
beforeEach(() => {
  errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  errSpy.mockRestore();
  jest.clearAllMocks();
});

describe('customerController.getRetention', () => {
  it('passes branchId param and maps rows with clamping', async () => {
    const req = { query: { branchId: 'xyz' } };
    const res = resMock();

    await getRetention(req, res);

    const [, params] = query.mock.calls[0];
    expect(params).toEqual(['xyz']);

    expect(res.json).toHaveBeenCalledWith([
      { cohort: 'Month 1', retention: 95 },
      { cohort: 'Month 2', retention: 20 }, // clamped from 10
      { cohort: 'Month 3', retention: 40 },
    ]);
  });

  it('handles DB error with 500', async () => {
    query.mockRejectedValueOnce(new Error('db down'));
    const req = { query: {} };
    const res = resMock();

    await getRetention(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch retention data' });
    expect(errSpy).toHaveBeenCalled();
  });
});
