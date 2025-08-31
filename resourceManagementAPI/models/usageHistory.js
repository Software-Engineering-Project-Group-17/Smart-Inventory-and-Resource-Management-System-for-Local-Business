const mongoose = require('mongoose');

const usageHistorySchema = new mongoose.Schema(
  {
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
      index: true
    },
    startDate: { type: Date, required: true },
    endDate:   { type: Date, required: true },
    purpose:   { type: String, trim: true }
  },
  { collection: 'usage_history' }
);

// simple guard: startDate <= endDate
usageHistorySchema.pre('validate', function (next) {
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    return next(new Error('startDate must be before or equal to endDate'));
  }
  next();
});

module.exports = mongoose.model('UsageHistory', usageHistorySchema);
