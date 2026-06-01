const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();

const User = require("../models/User");

router.post("/register", async (req, res) => {

    try {

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newUser = new User({
    ...req.body,
    password: hashedPassword
});

await newUser.save();

        res.status(201).json({
            message: "User Registered Successfully",
            user: newUser
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});

module.exports = router;

router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
    {
        id: user._id,
        role: user.role
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "1d"
    }
);

res.status(200).json({
    message: "Login Successful",
    token,
    user
});

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});