const express = require('express');
const router = express.Router();
const passport = require('../../bin/passport');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');

router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 1 }).escape(),
    body('email').trim().isEmail().normalizeEmail().escape(),
    body('password').trim().isLength({ min: 6 }).escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const newUser = new User({ username, email, password });

    try {
      await newUser.save();
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Registration failed' });
    }
  }
);

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (err) {
      return res
        .status(500)
        .json({ message: 'An error occurred during login.' });
    }
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    req.login(user, (err) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ message: 'An error occurred during login.' });
      }
      return res.status(200).json({ message: 'Login successful', user: user });
    });
  })(req, res, next);
});

module.exports = router;
