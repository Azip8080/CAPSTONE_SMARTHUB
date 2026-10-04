const express = require("express");

const router = express.Router();

const Event = require("../models/Event");

const auth = require("../middleware/auth");

const adminOnly = require("../middleware/adminOnly");

const {
  logActivity,
} = require("../utils/activityLogger");

router.get(
  "/",
  async (req, res) => {
    try {
      const events =
        await Event.find().sort({
          date: 1,
        });

      res.json({
        success: true,
        data: events,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

router.get(
  "/:id",
  async (req, res) => {
    try {
      const event =
        await Event.findById(
          req.params.id
        );

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      res.json({
        success: true,
        data: event,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

router.post(
  "/",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const event =
        await Event.create(
          req.body
        );

      await logActivity({
        actor: req.user.id,
        action: "created",
        entityType: "event",
        entityId: event._id,
        entityTitle: event.title,
        details:
          "Created a new event.",
      });

      res.status(201).json({
        success: true,
        data: event,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

router.put(
  "/:id",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const event =
        await Event.findByIdAndUpdate(
          req.params.id,
          req.body,
          {
            new: true,
          }
        );

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      await logActivity({
        actor: req.user.id,
        action: "updated",
        entityType: "event",
        entityId: event._id,
        entityTitle: event.title,
        details:
          "Updated event details.",
      });

      res.json({
        success: true,
        data: event,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

router.delete(
  "/:id",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const event =
        await Event.findByIdAndDelete(
          req.params.id
        );

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      await logActivity({
        actor: req.user.id,
        action: "deleted",
        entityType: "event",
        entityId: event._id,
        entityTitle: event.title,
        details:
          "Deleted an event.",
      });

      res.json({
        success: true,
        message: "Event deleted",
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

module.exports = router;