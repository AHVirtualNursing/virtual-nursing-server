const mongoose = require("mongoose");

const reportTypeEnum = ["event", "discharge"];

const reportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    type: {
      type: String,
      enum: {
        values: reportTypeEnum,
        message: "Invalid report type: {VALUE}",
      },
      require: true,
    },
    url: {
      type: String,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.models.Report || mongoose.model("Report", reportSchema);

module.exports = {
  Report, reportSchema
}
