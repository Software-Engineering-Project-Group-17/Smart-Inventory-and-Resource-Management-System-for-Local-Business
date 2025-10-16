import { jest } from '@jest/globals';

const rows = [
  {
    inventory_id: 1,
    inventory_name: 'Sugar',
    quantity: 3,
    low_stock_threshold: 10,
    unit_price: '12.50',
    branch_id: 2,
    category_name: 'Groceries',
    branch_name: 'Downtown',
    shortage_amount: 7
  }
];

jest.unstable_mockModule('../utils/db.js', () => ({
  query: jest.fn().mockResolvedValue({ rows })
}));

const { query } = await import('../utils/db.js');
const { inventoryLowStock } = await import('../controllers/reportController.js');

const resMock = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

let errSpy;
beforeEach(() => {
  jest.clearAllMocks();
  errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => errSpy.mockRestore());

describe('reportController.inventoryLowStock', () => {
  it('filters by branch NAME and start/end date with correct param order', async () => {
    const req = { query: { branch: 'Down', start: '2024-01-01', end: '2024-01-31' } };
    const res = resMock();

    await inventoryLowStock(req, res);

    const [, params] = query.mock.calls[0];
    expect(params).toEqual(['%Down%', '2024-01-01', '2024-01-31']);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: rows,
      count: rows.length,
      filters: { branch: 'Down', start: '2024-01-01', end: '2024-01-31', status: undefined }
    });
  });

  it('400 on invalid date format', async () => {
    const req = { query: { start: '01-01-2024' } }; // invalid
    const res = resMock();

    await inventoryLowStock(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].success).toBe(false);
  });

  it('maps schema error 42P01', async () => {
    query.mockRejectedValueOnce(Object.assign(new Error('no table'), { code: '42P01' }));
    const req = { query: {} };
    const res = resMock();

    await inventoryLowStock(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'SCHEMA_ERROR' })
    );
    expect(errSpy).toHaveBeenCalled();
  });
});
