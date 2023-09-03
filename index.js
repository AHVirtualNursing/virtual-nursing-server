/* IMPORTS */
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('./middleware/passport');
const session = require('express-session');

/* ROUTES */
const deviceRoutes = require('./routes/device');
const authRoutes = require('./routes/auth');

const app = express();

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log('MongoDB connected'));

/* MIDDLEWARE */
app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

/* Test Connection */
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from server!' });
});

/* APP USE */
app.use('/devices', deviceRoutes);
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
