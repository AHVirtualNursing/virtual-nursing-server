const { s3 } = require("../middleware/awsClient");
const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { sendMockPatientVitals } = require("../scripts/sendMockPatientVitals");

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const bucket = "ah-virtual-nursing";
    const file = req.file;
    const filename = Date.now() + "-" + file.originalname;
    const destinationKey = "uploads/" + filename;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: destinationKey,
      Body: file.buffer,
    });

    const url = `https://${bucket}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${destinationKey}`;

    await s3.send(command);
    res.status(200).json({
      message: `File uploaded successfully to ${bucket}`,
      url: url,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error uploading file", error });
  }
};

const retrieveFileWithPresignedUrl = async (req, res) => {
  try {
    const { key } = req.body;
    const command = new GetObjectCommand({
      Bucket: "ah-virtual-nursing",
      Key: key,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    res.status(200).json({ url });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error retrieving file", error });
  }
};

const uploadAndParseMockData = async (req, res) => {
  try {
    const { patientId } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const bucket = "ah-virtual-nursing";
    const file = req.file;
    const filename = "DE2300223_enc.xlsx";
    const destinationKey = "mock-data/" + filename;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: destinationKey,
      Body: file.buffer,
    });

    await s3.send(command);

    sendMockPatientVitals(patientId);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Error uploading or pasrsing mock data from S3" });
  }
};

module.exports = {
  uploadFile,
  retrieveFileWithPresignedUrl,
  uploadAndParseMockData,
};
