// controllers/resourceController.js
const Resource = require('../models/resource');
const UsageHistory = require('../models/usageHistory');
const { resolveBranch } = require('../services/branchService');

// allow only these fields from client (branchId always server-side)
const ALLOWED_CREATE_FIELDS = ['name', 'resourceNumber', 'availabilityStatus', 'createdDate'];
const ALLOWED_UPDATE_FIELDS = ['name', 'resourceNumber', 'availabilityStatus'];

function pick(obj, keys) {
  return Object.fromEntries(Object.entries(obj || {}).filter(([k]) => keys.includes(k)));
}

// POST /api/resources
// body MUST include: user_id
exports.addResource = async (req, res, next) => {
  try {
    const { user_id } = req.body;
    if (user_id == null) return res.status(400).json({ error: 'user_id is required' });

    const branchId = await resolveBranch(Number(user_id));
    const payload = pick(req.body, ALLOWED_CREATE_FIELDS);

    const created = await Resource.create({ ...payload, branchId });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

// GET /api/resources
// Optional filters: ?branchId=12&status=available&search=van
exports.listResources = async (req, res, next) => {
  try {
    const { branchId, status, search } = req.query;
    const q = {};
    if (branchId != null) q.branchId = Number(branchId);
    if (status) q.availabilityStatus = status;
    if (search) q.name = { $regex: search, $options: 'i' };
    const items = await Resource.find(q).sort({ createdDate: -1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// GET /api/resources/:id
exports.getResource = async (req, res, next) => {
  try {
    const item = await Resource.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Resource not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

// PUT /api/resources/:id
// body MUST include: user_id (we always re-resolve the branch)
exports.updateResource = async (req, res, next) => {
  try {
    const { user_id } = req.body;
    if (user_id == null) return res.status(400).json({ error: 'user_id is required' });

    const branchId = await resolveBranch(Number(user_id));
    const payload = pick(req.body, ALLOWED_UPDATE_FIELDS);

    const updated = await Resource.findByIdAndUpdate(
      req.params.id,
      { $set: { ...payload, branchId } },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Resource not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/resources/:id
exports.deleteResource = async (req, res, next) => {
  try {
    const deleted = await Resource.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Resource not found' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// PUT /api/resources/:id/availability
exports.setAvailability = async (req, res, next) => {
  try {
    const { availabilityStatus } = req.body;
    const updated = await Resource.findByIdAndUpdate(
      req.params.id,
      { availabilityStatus },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Resource not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// POST /api/resources/:id/usage
exports.addUsage = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });

    const doc = await UsageHistory.create({
      resource: resource._id,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      purpose: req.body.purpose
    });

    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
};

// GET /api/resources/:id/usage
exports.listUsageForResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found' });

    const rows = await UsageHistory.find({ resource: resource._id })
      .sort({ startDate: -1 });
    res.json(rows);
  } catch (err) {
    next(err);
  }
};
