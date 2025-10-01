// middleware/validateBranchId.js
const validateBranchId = (req, res, next) => {
  const { branchId } = req.query;

  if (branchId && (isNaN(branchId) || parseInt(branchId, 10) < 1)) {
    return res.status(400).json({
      error: {
        message: 'Invalid branchId parameter',
        status: 400
      }
    });
  }

  next();
};

export default validateBranchId;
