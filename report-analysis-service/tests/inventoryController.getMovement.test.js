import { jest } from '@jest/globals';

// Mock rows already aggregated by SQL
jest.unstable_mockModule('../utils/db.js', () => {
  return {
    query: jest.fn().mockResolvedValue({
      rows: [
        { month: 'Jan', inbound: '120', outbound: '100', net: '20' },
        { month: 'Feb', inbound: '90',  outbound: '110', net: '-20' },
      ]
    })
  };
});

const { query } = await import('../utils/db.js');
const { getMovement } = await import('../controllers/inventoryController.js');

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

describe('inventoryController.getMovement', () => {
  it('passes branchId + months and maps movement series', async () => {
    // pass period alias (e.g., "6") -> controller parses to months number
    const req = { query: { branchId: 'b3', period: '6' } };
    const res = resMock();

    await getMovement(req, res);

    const [, params] = query.mock.calls[0];
    expect(params).toEqual(['b3', 6]);

    expect(res.json).toHaveBeenCalledWith([
      { month: 'Jan', inbound: 120, outbound: 100, net: 20 },
      { month: 'Feb', inbound:  90, outbound: 110, net: -20 },
    ]);
  });

  it('handles DB error with 500', async () => {
    query.mockRejectedValueOnce(new Error('db down'));
    const req = { query: {} };
    const res = resMock();

    await getMovement(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch inventory movement' });
    expect(errSpy).toHaveBeenCalled();
  });
});
