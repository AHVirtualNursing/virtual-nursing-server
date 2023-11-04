const express = require("express");
const router = express.Router();
const Report = require("../controllers/reportController");

router.get("/", Report.getReports);
router.get("/:id", Report.getReportByReportId);
router.post("/", Report.createReport);
router.put("/:id", Report.updateReportByReportId);
router.delete("/:id", Report.deleteReportByReportId);

module.exports = router;
