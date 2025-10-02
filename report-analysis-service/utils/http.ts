export const ok = <T>(res: any, data: T) => res.status(200).json({ ok: true, data });
export const created = <T>(res: any, data: T) => res.status(201).json({ ok: true, data });
export const bad = (res: any, message = "Bad Request") => res.status(400).json({ ok: false, message });
export const notFound = (res: any, message = "Not Found") => res.status(404).json({ ok: false, message });
export const fail = (res: any, err: any) => {
  console.error(err);
  res.status(500).json({ ok: false, message: "Server Error" });
};
