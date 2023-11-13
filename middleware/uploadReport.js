const { s3 } = require("./awsClient");
const {
  PutObjectCommand,
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

  let destinationKey = `reports/${type}-reports/${patientId}-${type}-report`;
  let reportName = name;

  let index = 1;
  while (objectNames.includes(destinationKey)) {
    destinationKey = `reports/${type}-reports/${patientId}(${index})`;
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

module.exports = {
  uploadReport,
};
