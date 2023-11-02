const mongoose = require("mongoose");

const reportTypeEnum = ["event", "discharge"];

const reportSchema = new mongoose.Schema(
  {
    reportName: {
      type: String,
      require: true,
    },
    reportType: {
      type: String,
      enum: {
        values: reportTypeEnum,
        message: "Invalid report type: {VALUE}",
      },
      require: true
    },
    content: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Report || mongoose.model("Report", reportSchema);
