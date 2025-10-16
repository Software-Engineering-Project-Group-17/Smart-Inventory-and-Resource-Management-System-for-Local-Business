import { jest } from '@jest/globals';

const rows = [
  {
    supplier_id: 9,
    supplier_name: 'FreshCo',
    supplier_email: 'fresh@example.com',
    supplier_tel: '123-456',
    po_id: 77,
    po_date: '2024-01-20',
    items: 3,
    total_value: '560.40',
    status: 'pending',
    payment_status: 'unpaid',
    branch_name: 'Central',
    request_title: 'RR-001',
    estimated_delivery: '2024-01-28',
    actual_delivery: null
  }
];

jest.unstable_mockModule('../utils/db.js', () => ({
  query: jest.fn().mockResolvedValue({ rows })
}));

const { query } = await import('../utils/db.js');
const { supplierOrderDetails } = await import('../controllers/reportController.js');

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

describe('reportController.supplierOrderDetails', () => {
  it('applies branch NAME (rr), status, and date range with correct param order', async () => {
    // filters use rr (restock_request) branch side
    const req = { query: { branch: 'Cent', status: 'pending', start: '2024-01-01', end: '2024-01-31' } };
    const res = resMock();

    await supplierOrderDetails(req, res);

    const [, params] = query.mock.calls[0];
    expect(params).toEqual(['%Cent%', 'pending', '2024-01-01', '2024-01-31']);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: rows,
      count: rows.length,
      filters: { branch: 'Cent', status: 'pending', start: '2024-01-01', end: '2024-01-31' }
    });
  });

  it('42703 column error mapped', async () => {
    query.mockRejectedValueOnce(Object.assign(new Error('bad col'), { code: '42703' }));
    const req = { query: {} };
    const res = resMock();

    await supplierOrderDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'COLUMN_ERROR' }));
    expect(errSpy).toHaveBeenCalled();
  });
});
