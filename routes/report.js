const express = require("express");
const router = express.Router();
const Report = require("../controllers/reportController");
const { upload } = require("../middleware/upload");

router.get("/discharge", Report.getDischargeReports);
router.get("/:id", Report.getReportByReportId);
router.get("/", Report.getReports);
router.post("/", upload.single("file"), Report.createReport);
router.put("/:id", Report.updateReportByReportId);
router.delete("/:id", Report.deleteReportByReportId);

module.exports = router;
