const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("readline");
require("dotenv").config();

const User = require("../models/User");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function createAdmin() {
  try {
    await mongoose.connect(
      "mongodb://127.0.0.1:27017/sdg_smarthub"
    );

    console.log("Connected to MongoDB");

    const fullName = await ask("Full name: ");
    const email = await ask("Email: ");
    const password = await ask("Password: ");

    if (!fullName || !email || !password) {
      console.log(
        "All fields are required."
      );

      rl.close();
      await mongoose.disconnect();
      return;
    }

    const existing = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existing) {
      console.log(
        "An account with this email already exists."
      );

      rl.close();
      await mongoose.disconnect();
      return;
    }

    const hashedPassword =
      await bcrypt.hash(password, 12);

    await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "admin",
    });

    console.log(
      "Admin account created successfully."
    );

    rl.close();
    await mongoose.disconnect();
  } catch (err) {
    console.error(
      "Failed to create admin:",
      err.message
    );

    rl.close();
    await mongoose.disconnect();
  }
}

createAdmin();