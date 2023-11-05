const mongoose = require("mongoose");
const User = require("./user");

const virtualNurseSchema = new mongoose.Schema(
  {
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

virtualNurseSchema.add(User.schema);

module.exports = mongoose.model(
  "VirtualNurse",
  virtualNurseSchema,
  "virtual_nurses"
);
