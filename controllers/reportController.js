const { Report } = require("../models/report");
const { Patient } = require("../models/patient");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { s3 } = require("../middleware/awsClient");

const getReports = async (req, res) => {
  try {
    const reports = await Report.find({});
    res.status(200).json({ success: true, data: reports });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const getReportByReportId = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);
    if (!report) {
      return res
        .status(404)
        .json({ message: `cannot find any report with ID ${id}` });
    }
    res.status(200).json(report);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const getReportsWithPatientParticulars = async (req, res) => {
  try {
    const reports = await Patient.aggregate([
      {
        $unwind: "$reports",
      },
      {
        $lookup: {
          from: "reports",
          localField: "reports",
          foreignField: "_id",
          as: "reportDetails",
        },
      },
      {
        $unwind: "$reportDetails",
      },
      {
        $project: {
          patientName: "$name",
          patientNric: "$nric",
          name: "$reportDetails.name",
          type: "$reportDetails.type",
          url: "$reportDetails.url",
          createdAt: "$reportDetails.createdAt",
        },
      },
    ]);

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createReport = async (req, res) => {
  try {
    const patient = await Patient.findById({ _id: req.body.patient });
    if (!patient) {
      return res.status(500).json({
        message: `cannot find any patient with Patient ID ${req.body.patient}`,
      });
    }

    const report = new Report({
      name: req.body.name,
      type: req.body.type,
      content: req.body.content,
      url: req.body.url,
    });
    await report.save();

    await Patient.findOneAndUpdate(
      { _id: patient._id },
      { $push: { reports: report._id } },
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json({ success: true, data: report });
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      return res.status(400).json({ validationErrors });
    } else {
      res.status(500).json({ message: e.message });
    }
  }
};

const updateReportByReportId = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);
    if (!report) {
      return res
        .status(500)
        .json({ message: `cannot find any report with ID ${id}` });
    }
    const { name } = req.body;
    if (name) {
      report.name = name;
    }
    const updatedReport = await report.save();
    res.status(200).json(updatedReport);
  } catch (e) {
    if (e.name === "ValidationError") {
      const validationErrors = Object.values(e.errors).map((e) => e.message);
      return res.status(400).json({ validationErrors });
    } else {
      res.status(500).json({ message: e.message });
    }
  }
};

const deleteReportByReportId = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);
    if (!report) {
      return res
        .status(404)
        .json({ message: `cannot find any report with ID ${id}` });
    }
    const patientId = await Patient.findOne({ reports: id });
    const updatedPatient = await Patient.findOneAndUpdate(
      { _id: patientId },
      { $pull: { reports: id } },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedPatient) {
      return res.status(500).json({
        message: `cannot find any patient tagged to report with ID ${id}`,
      });
    }

    const key = report.url.split(".amazonaws.com/")[1];
    await s3.send(
      new DeleteObjectCommand({
        Bucket: "ah-virtual-nursing",
        Key: key,
      })
    );

    await Report.deleteOne({ _id: id });

    res.status(200).json(report);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = {
  getReports,
  createReport,
  getReportByReportId,
  getReportsWithPatientParticulars,
  updateReportByReportId,
  deleteReportByReportId,
};
