const { s3 } = require("../middleware/awsClient");
const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const {
  sendMockPatientVitals,
  clearInterval,
} = require("../middleware/sendMockData");

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const folder = req.body.folder ?? "uploads";

    const bucket = "ah-virtual-nursing";
    const file = req.file;
    const filename = Date.now() + "-" + file.originalname.replace(/\s+/g, "+");
    const destinationKey = folder + "/" + filename;

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
    console.error(error);
    res.status(500).json({ error: "Error uploading file", error });
  }
};

const retrieveFileWithPresignedUrl = async (req, res) => {
  try {
    const { url } = req.body;
    const urlParts = url.split(".s3.ap-southeast-2.amazonaws.com/");
    const bucket = urlParts[0].slice(8);
    const key = urlParts[1];

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    res.status(200).json({ presignedUrl });
  } catch (error) {
    console.error(error);
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
    const responseMockData = await sendMockPatientVitals(patientId);
    if (responseMockData.success) {
      res.status(200).json({ responseMockData });
    } else {
      res
        .status(500)
        .json({ error: "Error uploading or parsing mock data from S3" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error uploading or parsing mock data from S3" });
  }
};

const stopMockDataSimulation = async (req, res) => {
  try {
    clearInterval();
    res.status(200).json({ success: "Stopped mock data simulation" });
  } catch (error) {
    res.status(500).json({ error: "Failed to stop mock data simulation" });
  }
};

module.exports = {
  uploadFile,
  retrieveFileWithPresignedUrl,
  uploadAndParseMockData,
  stopMockDataSimulation,
};
