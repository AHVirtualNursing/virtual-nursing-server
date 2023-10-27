const { s3 } = require("../middleware/awsClient");
const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const uploadFile = async (req, res) => {
  try {
    const { bucket } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

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
    res.status(500).json({ error: "Error uploading file", error });
  }
};

const retrieveFileWithPresignedUrl = async (req, res) => {
  try {
    const { bucket, key } = req.body;
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    res.status(200).json({ url });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error retrieving file", error });
  }
};

module.exports = {
  uploadFile,
  retrieveFileWithPresignedUrl,
};
