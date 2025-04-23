// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Handle signup request
const signup = async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const newUser = new User({
    name,
    email,
    password,
  });

  try {
    // Save user to the database
    await newUser.save();

    // Generate a JWT token after successful signup
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Respond with success message and token
    res.status(201).json({
      message: 'User created successfully',
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
};

module.exports = { signup };
