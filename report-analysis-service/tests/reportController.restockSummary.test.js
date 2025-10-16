import { jest } from '@jest/globals';

const rows = [
  {
    inventory_id: 100,
    item: 'Flour 1kg',
    last_restock: '2024-02-15',
    restocked_qty: '30',
    supplier: 'Acme Foods',
    next_restock_due: '2024-03-05',
    restock_requests: '2',
    request_status: 'approved',
    branch_name: 'East'
  }
];

jest.unstable_mockModule('../utils/db.js', () => ({
  query: jest.fn().mockResolvedValue({ rows })
}));

const { query } = await import('../utils/db.js');
const { restockSummary } = await import('../controllers/reportController.js');

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

describe('reportController.restockSummary', () => {
  it('applies branch ID, status and dates with correct param order', async () => {
    const req = { query: { branch: '5', status: 'approved', start: '2024-02-01', end: '2024-02-29' } };
    const res = resMock();

    await restockSummary(req, res);

    const [, params] = query.mock.calls[0];
    expect(params).toEqual([5, 'approved', '2024-02-01', '2024-02-29']);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: rows,
      count: rows.length,
      filters: { branch: '5', status: 'approved', start: '2024-02-01', end: '2024-02-29' }
    });
  });

  it('42P01 schema error mapped correctly', async () => {
    query.mockRejectedValueOnce(Object.assign(new Error('table missing'), { code: '42P01' }));
    const req = { query: {} };
    const res = resMock();

    await restockSummary(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'SCHEMA_ERROR' }));
    expect(errSpy).toHaveBeenCalled();
  });
});
