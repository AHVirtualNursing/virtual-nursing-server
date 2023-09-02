/* IMPORTS */
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

/* ROUTES */
const deviceRoutes = require('./routes/device');

const app = express();

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log('MongoDB connected'));

/* MIDDLEWARE */
app.use(bodyParser.json());

/* Test Connection */
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from server!' });
});

/* APP USE */
app.use('/devices', deviceRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
