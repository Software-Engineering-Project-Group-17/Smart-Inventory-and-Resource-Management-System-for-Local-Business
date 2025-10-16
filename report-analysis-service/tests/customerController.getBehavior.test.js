import { jest } from '@jest/globals';

// This handler does not call the DB at all, just returns a static list.
// We still import to keep parity.
const { getBehavior } = await import('../controllers/customerController.js');

const resMock = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

describe('customerController.getBehavior', () => {
  it('returns predefined behavior scores', async () => {
    const req = { query: {} };
    const res = resMock();

    await getBehavior(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith([
      { behavior: "Purchase Frequency", score: 75 },
      { behavior: "Brand Loyalty",     score: 68 },
      { behavior: "Price Sensitivity", score: 45 },
      { behavior: "Product Diversity", score: 82 },
      { behavior: "Seasonal Shopping", score: 58 },
      { behavior: "Online Engagement", score: 91 },
    ]);
  });
});
