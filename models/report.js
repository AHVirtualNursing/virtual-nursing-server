const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
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
