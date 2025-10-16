import { jest } from '@jest/globals';

const rows = [
  {
    order_id: 10,
    order_date: '2024-02-01',
    customer: 'Alice',
    total_items: 4,
    total_value: '120.50',
    status: 'completed',
    payment_status: 'paid',
    branch_name: 'Central',
    shipping_address: '123 Street'
  }
];

jest.unstable_mockModule('../utils/db.js', () => ({
  query: jest.fn().mockResolvedValue({ rows })
}));

const { query } = await import('../utils/db.js');
const { ordersSummary } = await import('../controllers/reportController.js');

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

describe('reportController.ordersSummary', () => {
  it('applies branch NAME, status, and date range params in order', async () => {
    const req = {
      query: { branch: 'Central', status: 'completed', start: '2024-02-01', end: '2024-02-29' }
    };
    const res = resMock();

    await ordersSummary(req, res);

    const [, params] = query.mock.calls[0];
    expect(params).toEqual(['%Central%', 'completed', '2024-02-01', '2024-02-29']);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: rows,
      count: rows.length,
      filters: { branch: 'Central', status: 'completed', start: '2024-02-01', end: '2024-02-29' }
    });
  });

  it('400 when start > end', async () => {
    const req = { query: { start: '2024-03-10', end: '2024-03-01' } };
    const res = resMock();

    await ordersSummary(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('maps column error 42703', async () => {
    query.mockRejectedValueOnce(Object.assign(new Error('bad column'), { code: '42703' }));
    const req = { query: {} };
    const res = resMock();

    await ordersSummary(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'COLUMN_ERROR' }));
    expect(errSpy).toHaveBeenCalled();
  });
});
