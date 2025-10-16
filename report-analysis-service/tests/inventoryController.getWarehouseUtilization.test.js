import { jest } from '@jest/globals';

jest.unstable_mockModule('../utils/db.js', () => {
  return {
    query: jest.fn().mockResolvedValue({
      rows: [
        { branch_id: '1', warehouse: 'Main',   capacity: '10000', used: '1500', utilization: '15' },
        { branch_id: '2', warehouse: 'Annex',  capacity: '10000', used: '3200', utilization: '32' },
      ]
    })
  };
});

const { query } = await import('../utils/db.js');
const { getWarehouseUtilization } = await import('../controllers/inventoryController.js');

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

describe('inventoryController.getWarehouseUtilization', () => {
  it('uses branchId when passed and maps numeric fields', async () => {
    const req = { query: { branchId: '2' } };
    const res = resMock();

    await getWarehouseUtilization(req, res);

    const [, params] = query.mock.calls[0];
    expect(params).toEqual(['2']);

    expect(res.json).toHaveBeenCalledWith([
      { branch_id: '1', warehouse: 'Main',  capacity: 10000, used: 1500, utilization: 15 },
      { branch_id: '2', warehouse: 'Annex', capacity: 10000, used: 3200, utilization: 32 },
    ]);
  });

  it('handles DB error with 500', async () => {
    query.mockRejectedValueOnce(new Error('db down'));
    const req = { query: {} };
    const res = resMock();

    await getWarehouseUtilization(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch warehouse utilization' });
    expect(errSpy).toHaveBeenCalled();
  });
});
