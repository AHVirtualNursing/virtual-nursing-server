const puppeteer = require("puppeteer");
const { s3 } = require("../middleware/awsClient");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

const generateAndUploadDischargeReport = async (patientId, vitalId, alertConfigId) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto(process.env.DVS_DEVELOPMENT_URL, {
      waitUntil: "networkidle0",
    });

    await page.type("#identifier", process.env.DEFAULT_USERNAME);
    await page.type("#password", process.env.DEFAULT_PASSWORD);

    await page.click("#submit");
    await page.waitForNavigation();

    await page.goto(`${process.env.DVS_DEVELOPMENT_URL}/discharge?patientId=${patientId}&vitalId=${vitalId}&alertConfigId=${alertConfigId}`, {
      waitUntil: "networkidle0",
    });

    const pdfBuffer = await page.pdf();

    const command = new PutObjectCommand({
      Bucket: "ah-virtual-nursing",
      Key: "discharge-reports/report.pdf",
      Body: pdfBuffer,
    });

    await s3.send(command);
  } catch (error) {
    console.error(error);
  } finally {
    await browser.close();
  }
};

module.exports = {
  generateAndUploadDischargeReport,
};
