import { jest } from '@jest/globals';

// Mock DB: total customers drives the computed buckets
jest.unstable_mockModule('../utils/db.js', () => {
  return {
    query: jest.fn().mockResolvedValue({
      rows: [{ total_customers: '1000' }]
    })
  };
});

const { query } = await import('../utils/db.js');
const { getDemographics } = await import('../controllers/customerController.js');

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

describe('customerController.getDemographics', () => {
  it('computes demographic buckets from total count', async () => {
    const req = { query: {} };
    const res = resMock();

    await getDemographics(req, res);

    expect(query).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith([
      { ageGroup: "18-25", customers: 180, percentage: 18, spending: 45000 },
      { ageGroup: "26-35", customers: 280, percentage: 28, spending: 125000 },
      { ageGroup: "36-45", customers: 240, percentage: 24, spending: 165000 },
      { ageGroup: "46-55", customers: 190, percentage: 19, spending: 98000 },
      { ageGroup: "56+",   customers: 110, percentage: 11, spending: 67000 },
    ]);
  });

  it('handles DB error with 500', async () => {
    query.mockRejectedValueOnce(new Error('db down'));
    const req = { query: {} };
    const res = resMock();

    await getDemographics(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch demographics' });
    expect(errSpy).toHaveBeenCalled();
  });
});
