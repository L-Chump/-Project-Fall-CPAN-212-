// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/user');

// GET register form
router.get('/register', function(req, res) {
  res.render('register', { title: 'Register', errors: null, form: {} });
});

// POST register
router.post('/register', async function(req, res) {
  const { username, password, password2 } = req.body;
  const errors = [];

  if (!username || username.length < 3) errors.push('Username must be at least 3 characters');
  if (!password || password.length < 6) errors.push('Password must be at least 6 characters');
  if (password !== password2) errors.push('Passwords do not match');

  if (errors.length) {
    return res.render('register', { title: 'Register', errors: errors, form: req.body });
  }

  // check unique
  const existing = await User.findOne({ username: username });
  if (existing) {
    return res.render('register', { title: 'Register', errors: ['Username is already taken'], form: req.body });
  }
let genres = req.body.genres;

if (Array.isArray(genres)) {
  genres = genres.join(", ");  // Convert array → "Horror, Action"
}

  const user = new User({ username: username });
  await user.setPassword(password);
  await user.save();

  // log them in
  req.session.user = { _id: user._id, username: user.username };
  res.redirect('/');
});

// GET login
router.get('/login', function(req, res) {
  res.render('login', { title: 'Login', errors: null });
});

// POST login
router.post('/login', async function(req, res) {
  const { username, password } = req.body;
  const user = await User.findOne({ username: username });
  if (!user) return res.render('login', { title: 'Login', errors: ['Invalid username or password'] });

  const ok = await user.validatePassword(password);
  if (!ok) return res.render('login', { title: 'Login', errors: ['Invalid username or password'] });

  req.session.user = { _id: user._id, username: user.username };
  res.redirect('/');
});

// logout
router.post('/logout', function(req, res) {
  req.session.destroy(function() {
    res.redirect('/');
  });
});

module.exports = router;
