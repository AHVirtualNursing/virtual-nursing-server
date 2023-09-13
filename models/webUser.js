const mongoose = require("mongoose");
const User = require("./user");

const webUserSchema = new mongoose.Schema({}, { timestamps: true });

webUserSchema.add(User.schema);

const itAdmin = mongoose.model("itAdmin", webUserSchema, "it_admin");
const virtualNurse = mongoose.model(
  "virtualNurse",
  webUserSchema,
  "virtual_nurses"
);

module.exports = {
  itAdmin,
  virtualNurse,
};
