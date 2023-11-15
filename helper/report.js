const { s3 } = require("../middleware/awsClient");
const {
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} = require("@aws-sdk/client-s3");
const { Patient } = require("../models/patient");
const { Report } = require("../models/report");

const uploadReport = async (patientId, type, name, file) => {
  const bucket = "ah-virtual-nursing";

  const listFilesCommand = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: `reports/${type}`,
  });

  const objectNames = [];
  try {
    const data = await s3.send(listFilesCommand);
    const objects = data.Contents;
    if (objects) {
      objects.forEach((object) => {
        const objectName = object.Key;
        objectNames.push(objectName);
      });
    }
  } catch (error) {
    console.error("Error listing objects:", error);
  }

  let destinationKey = `reports/${type}-reports/${patientId}-${type}-report.pdf`;
  let reportName = name;

  let index = 1;
  while (objectNames.includes(destinationKey)) {
    destinationKey = `reports/${type}-reports/${patientId}-${type}-report(${index}).pdf`;
    reportName = `${name}(${index})`;
    index++;
  }

  const uploadFileCommand = new PutObjectCommand({
    Bucket: bucket,
    Key: destinationKey,
    Body: file.buffer,
  });

  const url = `https://${bucket}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${destinationKey}`;

  await s3.send(uploadFileCommand);

  const report = new Report({
    name: reportName,
    type: type,
    url: url,
  });

  await report.save();

  await Patient.findOneAndUpdate(
    { _id: patientId },
    { $push: { reports: report._id } },
    {
      new: true,
      runValidators: true,
    }
  );

  return url;
};

const deleteReport = async (reportId) => {
  const report = await Report.findById(reportId);
  if (!report) {
    throw new Error({ message: `cannot find any report with ID ${reportId}` });
  }
  const patientId = await Patient.findOne({ reports: reportId });
  const updatedPatient = await Patient.findOneAndUpdate(
    { _id: patientId },
    { $pull: { reports: reportId } },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedPatient) {
    throw new Error({
      message: `cannot find any patient tagged to report with ID ${reportId}`,
    });
  }

  const key = report.url.split(".amazonaws.com/")[1];
  await s3.send(
    new DeleteObjectCommand({
      Bucket: "ah-virtual-nursing",
      Key: key,
    })
  );

  await Report.deleteOne({ _id: reportId });
};

module.exports = {
  uploadReport,
  deleteReport,
};
