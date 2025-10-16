import { jest } from '@jest/globals';

// Mock DB first
jest.unstable_mockModule('../utils/db.js', () => {
  return {
    query: jest.fn().mockResolvedValue({
      rows: [
        { month: 'Jan', new_customers: '10', returning_customers: '5', churned_customers: '1' },
        { month: 'Feb', new_customers: '12', returning_customers: '6', churned_customers: '2' },
      ]
    })
  };
});

const { query } = await import('../utils/db.js');
const { getAcquisition } = await import('../controllers/customerController.js');

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

describe('customerController.getAcquisition', () => {
  it('uses branchId + months and maps rows', async () => {
    const req = { query: { branchId: 'b2', months: '6' } };
    const res = resMock();

    await getAcquisition(req, res);

    // SQL params should be [branchId, months] when branchId is present
    const [, params] = query.mock.calls[0];
    expect(params).toEqual(['b2', 6]);

    expect(res.json).toHaveBeenCalledWith([
      { month: 'Jan', newCustomers: 10, returningCustomers: 5, churnedCustomers: 1 },
      { month: 'Feb', newCustomers: 12, returningCustomers: 6, churnedCustomers: 2 },
    ]);
  });

  it('handles error with 500', async () => {
    query.mockRejectedValueOnce(new Error('boom'));
    const req = { query: { months: '12' } };
    const res = resMock();

    await getAcquisition(req, res);

    // Without branchId, params is [months] but we error, so just assert 500
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch customer acquisition' });
    expect(errSpy).toHaveBeenCalled();
  });
});
