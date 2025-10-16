import { jest } from '@jest/globals';

const rows = [
  {
    resource_id: 5,
    resource_name: 'Van-3',
    resource_number: 'V003',
    resource_type: 'VEHICLE',
    assigned_to: 'John Doe',
    start_date: '2024-03-01',
    end_date: '2024-03-10',
    status: 'in_use',
    branch_name: 'South',
    purpose: 'Delivery',
    assigned_at: '2024-03-01 09:00'
  }
];

jest.unstable_mockModule('../utils/db.js', () => ({
  query: jest.fn().mockResolvedValue({ rows })
}));

const { query } = await import('../utils/db.js');
const { resourcesAssignments } = await import('../controllers/reportController.js');

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

describe('reportController.resourcesAssignments', () => {
  it('applies branch name, status, and date range with correct param order', async () => {
    const req = { query: { branch: 'South', status: 'in_use', start: '2024-03-01', end: '2024-03-31' } };
    const res = resMock();

    await resourcesAssignments(req, res);

    const [, params] = query.mock.calls[0];
    expect(params).toEqual(['%South%', 'in_use', '2024-03-01', '2024-03-31']);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: rows,
      count: rows.length,
      filters: { branch: 'South', status: 'in_use', start: '2024-03-01', end: '2024-03-31' }
    });
  });

  it('500 on DB error', async () => {
    query.mockRejectedValueOnce(new Error('db fail'));
    const req = { query: {} };
    const res = resMock();

    await resourcesAssignments(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(errSpy).toHaveBeenCalled();
  });
});
