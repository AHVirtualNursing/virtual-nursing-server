/* IMPORTS */
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("./middleware/passport");
const session = require("express-session");
const cors = require("cors");

/* ROUTES */
const deviceRoutes = require('./routes/device');
const authRoutes = require('./routes/auth');
const smartbedRoutes = require('./routes/smartbed');
const alertRoutes = require('./routes/alert');
const nurseRoutes = require('./routes/nurse');
const alertConfigRoutes = require('./routes/alertConfig');
const reminderRoutes = require("./routes/reminder");
const patientRoutes = require("./routes/patient");

const app = express();

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

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
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

/* Test Connection */
app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

/* APP USE */
app.use('/devices', deviceRoutes);
app.use('/auth', authRoutes);
app.use('/smartbeds', smartbedRoutes);
app.use('/alerts', alertRoutes);
app.use('/nurses', nurseRoutes);
app.use('/alertConfigs', alertConfigRoutes);
app.use("/reminders", reminderRoutes);
app.use("/patients", patientRoutes)

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
