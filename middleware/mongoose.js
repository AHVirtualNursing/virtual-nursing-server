const mongoose = require("mongoose");

const mongooseConnect = () => {
  return mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: false,
  });
};

const mongooseCreateConnection = (connectionUri) => {
  return mongoose.createConnection(connectionUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

module.exports = {
  mongooseConnect,
  mongooseCreateConnection,
};
