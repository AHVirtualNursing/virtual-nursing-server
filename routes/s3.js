const express = require("express");
const router = express.Router();
const s3 = require("../controllers/s3Controller");
const { upload } = require("../middleware/upload");

router.post("/:bucket", upload.single("file"), s3.uploadFile);

module.exports = router;
