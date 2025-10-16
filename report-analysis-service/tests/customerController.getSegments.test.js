import { jest } from '@jest/globals';

jest.unstable_mockModule('../utils/db.js', () => {
  return {
    query: jest.fn().mockResolvedValue({
      rows: [
        { segment: 'VIP Customers', count: '3', revenue: '9000', avg_order_value: '3000' },
        { segment: 'Regular Customers', count: '10', revenue: '12000', avg_order_value: '1200' },
      ]
    })
  };
});

const { query } = await import('../utils/db.js');
const { getSegments } = await import('../controllers/customerController.js');

const resMock = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

describe('customerController.getSegments', () => {
  it('scopes by branchId and maps numbers', async () => {
    const req = { query: { branchId: 'branch-123' } };
    const res = resMock();

    await getSegments(req, res);

    expect(query).toHaveBeenCalled();
    const [, params] = query.mock.calls[0];
    expect(params).toEqual(['branch-123']);

    expect(res.json).toHaveBeenCalledWith([
      expect.objectContaining({
        segment: 'VIP Customers',
        count: 3,
        revenue: 9000,
        avgOrderValue: 3000,
        color: expect.any(String),
      }),
      expect.objectContaining({
        segment: 'Regular Customers',
        count: 10,
        revenue: 12000,
        avgOrderValue: 1200,
      }),
    ]);
  });

  it('handles error from DB', async () => {
  const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // silence

  query.mockRejectedValueOnce(new Error('boom'));
  const req = { query: {} };
  const res = resMock();

  await getSegments(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch customer segments' });

  // optional: assert your log line shape
  expect(errSpy).toHaveBeenCalled();
  const [firstArg] = errSpy.mock.calls[0];
  expect(String(firstArg)).toContain('Error in getSegments');

  errSpy.mockRestore();
});

});
