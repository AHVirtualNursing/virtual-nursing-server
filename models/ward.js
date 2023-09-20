const mongoose = require("mongoose");
const wardTypeEnum = ["A1", "B1", "B2", "C"];

const wardSchema = new mongoose.Schema(
  {
    wardNum: {
      type: String,
      required: true,
    },
    wardType: {
      type: String,
      enum: {
        values: wardTypeEnum,
        message: "Invalid ward type status: {VALUE}",
      },
      required: false,
    },
    numRooms: {
      type: Number,
      required: true,
    },
    smartBeds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SmartBed",
      },
    ],
    nurses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Nurse",
      },
    ],
    beds: [
      {
        type: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

wardSchema.pre("save", async function (next) {
  const ward = this;
  const wardType = ward.wardType;

  function getBedsPerRoom() {
    switch (wardType) {
      case "A1":
        return 1;
      case "B1":
        return 4;
      case "B2":
        return 5;
      case "C":
        return 5;
    }
  }

  const numBeds = getBedsPerRoom() * ward.numRooms;

  ward.beds = new Array(numBeds).fill(0);
});

module.exports = mongoose.models.Ward || mongoose.model("Ward", wardSchema);
