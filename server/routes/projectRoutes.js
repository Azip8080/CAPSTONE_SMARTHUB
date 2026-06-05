const express = require("express");
const router = express.Router();

const Project = require("../models/Project");

router.post("/create", async (req, res) => {

    try {

        const project = new Project(req.body);

        await project.save();

        res.status(201).json(project);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});

router.get("/", async (req, res) => {
    try {
        const projects = await Project.find();

        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Project deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});


module.exports = router;