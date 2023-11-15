require("dotenv").config();
const mongoose = require("mongoose");
console.log(".env", process.env);
const mongooseConnect = () => {
  try {
    return mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: false,
    });
  } catch (error) {
    console.log("Error connecting to mongoose: ", error);
  }
};

const mongooseCreateConnection = (connectionUri) => {
  try {
    return mongoose.createConnection(connectionUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.log("Error creating mongoose connection: ", error);
  }
};

module.exports = {
  mongooseConnect,
  mongooseCreateConnection,
};
