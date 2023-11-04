const mongoose = require("mongoose");
const User = require("./user");

const itAdminSchema = new mongoose.Schema(
  {},
  {
    timestamps: true,
  }
);

itAdminSchema.add(User.schema);

module.exports = mongoose.model("itAdmin", itAdminSchema);
