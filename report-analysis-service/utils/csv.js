import { stringify } from "csv-stringify";

export function toCSV(rows, opts = {}) {
  return new Promise((resolve, reject) => {
    stringify(rows, { header: true, ...opts }, (err, output) => {
      if (err) return reject(err);
      resolve(output);
    });
  });
}
