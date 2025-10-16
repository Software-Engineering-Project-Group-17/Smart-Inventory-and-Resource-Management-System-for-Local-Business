import { jest } from '@jest/globals';

const rows = [
  {
    customer_id: 1,
    customer_name: 'Bob',
    customer_email: 'b@example.com',
    order_id: 99,
    order_date: '2024-01-02',
    qty: 7,
    amount: '200.00',
    order_status: 'completed',
    payment_status: 'paid',
    branch_name: 'North'
  }
];

jest.unstable_mockModule('../utils/db.js', () => ({
  query: jest.fn().mockResolvedValue({ rows })
}));

const { query } = await import('../utils/db.js');
const { customerHistory } = await import('../controllers/reportController.js');

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

describe('reportController.customerHistory', () => {
  it('applies branch ID, status and dates with correct param order', async () => {
    const req = { query: { branch: '12', status: 'processing', start: '2024-01-01', end: '2024-01-31' } };
    const res = resMock();

    await customerHistory(req, res);

    const [, params] = query.mock.calls[0];
    // numeric branch -> Number(b)
    expect(params).toEqual([12, 'processing', '2024-01-01', '2024-01-31']);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: rows,
      count: rows.length,
      filters: { branch: '12', status: 'processing', start: '2024-01-01', end: '2024-01-31' }
    });
  });

  it('generic 500 on other errors', async () => {
    query.mockRejectedValueOnce(new Error('oops'));
    const req = { query: {} };
    const res = resMock();

    await customerHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'INTERNAL_ERROR' }));
    expect(errSpy).toHaveBeenCalled();
  });
});
