const mongoose = require("mongoose");
const User = require("./user");

const itAdminSchema = new mongoose.Schema(
  {},
  {
    
  }
);

itAdminSchema.add(User.schema);

module.exports = mongoose.model("itAdmin", itAdminSchema, "it_admins");
