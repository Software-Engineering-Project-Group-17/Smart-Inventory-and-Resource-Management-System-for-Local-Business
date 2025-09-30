export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Not Found - ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  const status = res.statusCode !== 200 ? res.statusCode : 500;
  const payload = {
    message: err.message || "Server Error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack })
  };
  res.status(status).json(payload);
};
