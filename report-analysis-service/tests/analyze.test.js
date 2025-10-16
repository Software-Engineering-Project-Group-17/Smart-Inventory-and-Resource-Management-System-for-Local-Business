import { summarize } from "../utils/analyze.js";

describe("summarize", () => {
  it("computes total and average", () => {
    const out = summarize([2, 4, 6]);
    expect(out.total).toBe(12);
    expect(out.avg).toBeCloseTo(4);
  });

  it("handles empty array", () => {
    const out = summarize([]);
    expect(out).toEqual({ total: 0, avg: 0 });
  });
});
