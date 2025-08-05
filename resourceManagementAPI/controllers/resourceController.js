const Resource = require('../models/resource');

exports.addResource = async (req, res) => {
  try {
    const newResource = await Resource.create(req.body);
    res.status(201).json(newResource);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateResource = async (req, res) => {
  try {
    const updated = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.setAvailability = async (req, res) => {
  try {
    const updated = await Resource.findByIdAndUpdate(req.params.id, {
      availabilityStatus: req.body.availabilityStatus
    }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.addUsage = async (req, res) => {
  try {
    const updated = await Resource.findByIdAndUpdate(
      req.params.id,
      { $push: { usageHistory: req.body } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.addMaintenance = async (req, res) => {
  try {
    const updated = await Resource.findByIdAndUpdate(
      req.params.id,
      { $push: { maintenanceSchedule: req.body } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
