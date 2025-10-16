export function summarize(values = []) {
  const total = values.reduce((a, b) => a + b, 0);
  return { total, avg: values.length ? total / values.length : 0 };
}
