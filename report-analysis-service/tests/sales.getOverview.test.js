import { jest } from '@jest/globals';

jest.unstable_mockModule('../utils/db.js', () => ({ query: jest.fn() }));
const { query } = await import('../utils/db.js');

const { default: sales } = await import('../controllers/salesController.js');
const { getOverview } = sales;

const resMock = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

let errSpy;
beforeEach(() => {
  query.mockReset();
  errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => errSpy.mockRestore());

describe('sales.getOverview', () => {
  it('maps totals without filters (period default 30d)', async () => {
    query.mockResolvedValueOnce({
      rows: [{ total_sales: '123.45', total_orders: '7', avg_order_value: '17.6357', unique_customers: '5' }]
    });

    const req = { query: {} };
    const res = resMock();
    await getOverview(req, res);

    // first param is startDate
    expect(query.mock.calls[0][1][0]).toEqual(expect.any(Date));
    // only 1 param when no filters
    expect(query.mock.calls[0][1]).toHaveLength(1);

    expect(res.json).toHaveBeenCalledWith({
      totalSales: 123.45,
      totalOrders: 7,
      avgOrderValue: 17.6357,
      uniqueCustomers: 5,
      period: '30d'
    });
  });

  it('adds branch + category filters and renumbers params', async () => {
    query.mockResolvedValueOnce({
      rows: [{ total_sales: '500', total_orders: '3', avg_order_value: '166.66', unique_customers: '3' }]
    });

    const req = { query: { branchId: 'b1', categoryId: '12', period: '7d' } };
    const res = resMock();
    await getOverview(req, res);

    const params = query.mock.calls[0][1];
    // [ startDate, branchId, categoryId(number) ]
    expect(params).toHaveLength(3);
    expect(params[0]).toEqual(expect.any(Date));
    expect(params[1]).toBe('b1');
    expect(params[2]).toBe(12);

    expect(res.json).toHaveBeenCalledWith({
      totalSales: 500,
      totalOrders: 3,
      avgOrderValue: 166.66,
      uniqueCustomers: 3,
      period: '7d'
    });
  });

  it('500 on error', async () => {
    query.mockRejectedValueOnce(new Error('boom'));
    const req = { query: {} };
    const res = resMock();

    await getOverview(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(errSpy).toHaveBeenCalled();
  });
});
