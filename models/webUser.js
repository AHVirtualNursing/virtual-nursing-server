const mongoose = require("mongoose");
const User = require("./user");

const webUserSchema = new mongoose.Schema({}, { timestamps: true });

const virtualNurseSchema = new mongoose.Schema(
  {
    name: String,
    wards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ward",
        default: null,
      },
    ],
  },
  {
    timestamps: true,
  }
);

webUserSchema.add(User.schema);
virtualNurseSchema.add(User.schema);

const itAdmin = mongoose.model("itAdmin", webUserSchema, "it_admins");

const virtualNurse = mongoose.model(
  "virtualNurse",
  virtualNurseSchema,
  "virtual_nurses"
);

module.exports = {
  itAdmin,
  virtualNurse,
};
