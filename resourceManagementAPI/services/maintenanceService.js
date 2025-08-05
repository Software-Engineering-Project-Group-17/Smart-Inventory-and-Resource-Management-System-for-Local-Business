const Resource = require('../models/resource');

exports.checkMaintenanceAlerts = async () => {
  const now = new Date();
  const resources = await Resource.find({});

  for (const res of resources) {
    for (const task of res.maintenanceSchedule) {
      if (!task.alertSent && new Date(task.scheduledDate) <= now) {
        console.log(`🔔 ALERT: Maintenance due for "${res.name}" on ${task.scheduledDate}`);
        task.alertSent = true;
      }
    }
    await res.save();
  }
};

