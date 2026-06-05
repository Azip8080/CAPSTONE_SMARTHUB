const express = require("express");
const router = express.Router();

const Event = require("../models/Event");


router.post("/create", async (req, res) => {
    try {
        const event = new Event(req.body);

        await event.save();

        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


router.get("/", async (req, res) => {
    try {
        const events = await Event.find();

        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


router.get("/:id", async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


router.put("/:id", async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


router.delete("/:id", async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Event deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

module.exports = router;