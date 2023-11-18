const express = require("express");
const router = express.Router();
const s3 = require("../controllers/s3Controller");
const { upload } = require("../middleware/upload");

router.post("/upload", upload.single("file"), s3.uploadFile);
router.post("/", s3.retrieveFileWithPresignedUrl);
router.post("/mockdata", upload.single("file"), s3.uploadAndParseMockData);
router.post("/stopMockData", s3.stopMockDataSimulation);

module.exports = router;
