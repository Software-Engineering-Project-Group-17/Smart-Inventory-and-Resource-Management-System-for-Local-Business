// middleware/validatePeriod.js
const validatePeriod = (req, res, next) => {
  const { period } = req.query;
  const validPeriods = ['7d', '30d', '90d', '1m', '3m', '6m', '12m', '1y'];

  if (period && !validPeriods.includes(period)) {
    return res.status(400).json({
      error: {
        message: `Invalid period parameter. Must be one of: ${validPeriods.join(', ')}`,
        status: 400
      }
    });
  }

  next();
};

export default validatePeriod;
