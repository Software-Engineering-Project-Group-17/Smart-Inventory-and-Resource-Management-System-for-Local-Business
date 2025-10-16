import { jest } from '@jest/globals';

const rows = [
  {
    inventory_id: 10,
    item: 'Rice 5kg',
    current_qty: 8,
    low_stock_threshold: 20,
    pending_qty: 30,
    confirmed_incoming: 0,
    last_restock: '2024-02-15',
    stock_status: 'LOW_STOCK',
    branch_name: 'West',
    category_name: 'Staples'
  },
  {
    inventory_id: 11,
    item: 'Oil 1L',
    current_qty: 50,
    low_stock_threshold: 15,
    pending_qty: 0,
    confirmed_incoming: 10,
    last_restock: '2024-02-01',
    stock_status: 'INCOMING',
    branch_name: 'West',
    category_name: 'Staples'
  }
];

jest.unstable_mockModule('../utils/db.js', () => ({
  query: jest.fn().mockResolvedValue({ rows })
}));

const { query } = await import('../utils/db.js');
const { inventoryRestockTracking } = await import('../controllers/reportController.js');

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

describe('reportController.inventoryRestockTracking', () => {
  it('applies branch filter (NAME) with correct params', async () => {
    const req = { query: { branch: 'West' } };
    const res = resMock();

    await inventoryRestockTracking(req, res);

    const [, params] = query.mock.calls[0];
    expect(params).toEqual(['%West%']);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: rows,
      count: rows.length,
      filters: { branch: 'West', start: undefined, end: undefined }
    });
  });

  it('400 validation for bad dates', async () => {
    const req = { query: { start: '2024/01/01' } }; // bad format
    const res = resMock();

    await inventoryRestockTracking(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('500 generic error', async () => {
    query.mockRejectedValueOnce(new Error('boom'));
    const req = { query: {} };
    const res = resMock();

    await inventoryRestockTracking(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'INTERNAL_ERROR' }));
    expect(errSpy).toHaveBeenCalled();
  });
});
