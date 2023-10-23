const { s3 } = require("../middleware/awsClient");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");

const uploadFile = async (req, res) => {
  try {
    const { bucket } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.file;
    const destinationKey = "uploads/" + file.originalname;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: destinationKey,
      Body: file.buffer,
    });

    await s3.send(command);
    res.status(200).json({
      success: true,
      message: `File uploaded successfully to ${bucket}`,
    });
  } catch (error) {
    res.status(500).json({ error: "Error uploading file", error });
  }
};

module.exports = {
  uploadFile,
};
