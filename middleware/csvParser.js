require("dotenv").config();
const { S3Client } = require("@aws-sdk/client-s3");
const fs = require("fs");
const csvParser = require("csv-parser");

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  },
});

function simulatePatientVitalsWithCsv() {
  fs.createReadStream("data.csv")
    .pipe(csv())
    .on("data", (row) => {
      data.push(row);
    })
    .on("end", () => {
      console.log(data);
    });
}
