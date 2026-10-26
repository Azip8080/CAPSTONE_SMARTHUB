
const Activity = require("../models/Activity");

const ENTITY_TYPES = {
  project: "Project",
  event: "Event",
  user: "User",
};

async function logActivity({
  actor,
  action,
  entityType,
  entityId = null,
  entityTitle = "",
  details = "",
}) {
  try {
    const normalizedType =
      ENTITY_TYPES[String(entityType || "").toLowerCase()];

    if (!normalizedType) {
      throw new Error(
        `Invalid activity entity type: ${entityType}`
      );
    }

    if (!actor) {
      throw new Error("Activity actor is required.");
    }

    const activity = await Activity.create({
      actor,
      action,
      entityType: normalizedType,
      entityId,
      entityTitle,
      details,
    });

    console.log(
      `[ACTIVITY LOG CREATED] ${activity.action} ${activity.entityType}: ${activity._id}`
    );

    return activity;
  } catch (err) {
    console.error(
      "[ACTIVITY LOG ERROR]",
      err.message
    );

    return null;
  }
}

module.exports = { logActivity };
