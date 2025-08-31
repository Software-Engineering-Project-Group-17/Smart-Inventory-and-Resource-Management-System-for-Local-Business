const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    resourceNumber: { type: String, required: true, unique: true, trim: true },
    availabilityStatus: {
      type: String,
      enum: ['available', 'under_maintenance', 'use'], // per ERD
      default: 'available',
      required: true
    },
    createdDate: { type: Date, default: Date.now },
    branchId: { type: Number, required: true } // foreign_key branch_id
  },
  { collection: 'resources' }
);

module.exports = mongoose.model('Resource', resourceSchema);
