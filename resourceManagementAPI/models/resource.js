const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., vehicle, equipment
  name: { type: String, required: true },
  resourceNumber: { type: String, required: false, unique: true },
  availabilityStatus: {
    type: String,
    enum: ['available', 'under maintenance'],
    default: 'available'
  },
  usageHistory: [{
    usedBy: String,
    startDate: Date,
    endDate: Date,
    purpose: String
  }],
  maintenanceSchedule: [{
    scheduledDate: Date,
    description: String,
    alertSent: { type: Boolean, default: false }
  }]
});

module.exports = mongoose.model('Resource', resourceSchema);
