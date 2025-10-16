import { jest } from '@jest/globals';

jest.unstable_mockModule('../utils/db.js', () => ({ query: jest.fn() }));
const { query } = await import('../utils/db.js');

const { default: sales } = await import('../controllers/salesController.js');
const { getDailySales } = sales;

const resMock = () => {
  const r = {};
  r.status = jest.fn().mockReturnValue(r);
  r.json   = jest.fn().mockReturnValue(r);
  return r;
};

let errSpy;
beforeEach(() => {
  query.mockReset();
  errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => errSpy.mockRestore());

describe('sales.getDailySales', () => {
  it('uses period->days and maps rows', async () => {
    query.mockResolvedValueOnce({
      rows: [
        { date: '01/01', sales: '10.5', orders: '2',  avg_order_value: '5.25' },
        { date: '01/02', sales: '0',    orders: '0',  avg_order_value: '0'    },
        { date: '01/03', sales: '7.2',  orders: '3',  avg_order_value: '2.4'  },
      ]
    });

    const req = { query: { period: '30d' } };
    const res = resMock();
    await getDailySales(req, res);

    // First param is days for generate_series
    expect(query.mock.calls[0][1]).toEqual([30]);
    expect(res.json).toHaveBeenCalledWith([
      { date: '01/01', sales: 10.5, orders: 2, avgOrderValue: 5.25 },
      { date: '01/02', sales: 0,    orders: 0, avgOrderValue: 0    },
      { date: '01/03', sales: 7.2,  orders: 3, avgOrderValue: 2.4  },
    ]);
  });

  it('accepts explicit days and filters by branch+category', async () => {
    query.mockResolvedValueOnce({ rows: [] });

    const req = { query: { days: '5', branchId: 'x', categoryId: '9' } };
    const res = resMock();
    await getDailySales(req, res);

    const params = query.mock.calls[0][1];
    // [ days, categoryId, branchId ]
    expect(params).toEqual([5, 9, 'x']);
  });

  it('500 on error', async () => {
    query.mockRejectedValueOnce(new Error('nope'));
    const req = { query: {} };
    const res = resMock();

    await getDailySales(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(errSpy).toHaveBeenCalled();
  });
});
