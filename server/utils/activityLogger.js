const Activity = require(
  "../models/Activity"
);

async function logActivity({
  actor,
  action,
  entityType,
  entityId,
  entityTitle,
  details,
}) {
  try {
    await Activity.create({
      actor,
      action,
      entityType,
      entityId,
      entityTitle,
      details,
    });
  } catch (err) {
    console.error(
      "[ACTIVITY LOG ERROR]",
      err
    );
  }
}

module.exports = {
  logActivity,
};