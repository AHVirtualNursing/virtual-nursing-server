/* IMPORTS */
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");

/* MIDDLEWARE IMPORTS */
const passport = require("./middleware/passport");

/* ROUTES */
const deviceRoutes = require("./routes/device");
const authRoutes = require("./routes/auth");
const smartbedRoutes = require("./routes/smartbed");
const alertRoutes = require("./routes/alert");
const nurseRoutes = require("./routes/nurse");
const alertConfigRoutes = require("./routes/alertConfig");
const reminderRoutes = require("./routes/reminder");
const patientRoutes = require("./routes/patient");
const wardRoutes = require("./routes/ward");
const reportRoutes = require("./routes/report");
const vitalRoutes = require("./routes/vital");
const userRoutes = require("./routes/user");

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
    origin: ["http://localhost:3000", "http://localhost:3002"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

/* Test Connection */
app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

/* APP USE */
app.use("/device", deviceRoutes);
app.use("/auth", authRoutes);
app.use("/smartbed", smartbedRoutes);
app.use("/alert", alertRoutes);
app.use("/nurse", nurseRoutes);
app.use("/alertConfig", alertConfigRoutes);
app.use("/reminder", reminderRoutes);
app.use("/patient", patientRoutes);
app.use("/ward", wardRoutes);
app.use("/report", reportRoutes);
app.use("/vital", vitalRoutes);
app.use("/user", userRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
