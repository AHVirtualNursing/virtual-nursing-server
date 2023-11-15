const { patientSchema } = require("../models/patient");
const { Alert, alertSchema } = require("../models/alert");
const { AlertConfig, alertConfigSchema } = require("../models/alertConfig");
const { Reminder, reminderSchema } = require("../models/reminder");
const { Vital, vitalSchema } = require("../models/vital");
const { Report, reportSchema } = require("../models/report");
const { mongooseCreateConnection } = require("../middleware/mongoose");
const { deleteReport } = require("./report");

const migratePatient = async (
  patient,
  alerts,
  alertConfigId,
  reminders,
  vitalId,
  reports
) => {
  let ahDbConnection;
  try {
    ahDbConnection = mongooseCreateConnection(process.env.MONGODB_AH_URI);
    const Patient = ahDbConnection.model("patient", patientSchema);
    const MigratedAlert = ahDbConnection.model("alert", alertSchema);
    const MigratedAlertConfig = ahDbConnection.model(
      "alertConfig",
      alertConfigSchema
    );
    const MigratedReminder = ahDbConnection.model("reminder", reminderSchema);
    const MigratedVital = ahDbConnection.model("vital", vitalSchema);
    const MigratedReport = ahDbConnection.model("report", reportSchema);

    const migratedAlertIds = [];
    if (alerts) {
      alerts.map(async (alertId) => {
        const alert = await Alert.findById(alertId);
        const alertData = {
          status: alert.status,
          enum: alert.enum,
          description: alert.description,
          notes: alert.notes,
          patient: patient._id,
          handledBy: alert.handledBy,
          followUps: alert.followUps,
          alertVitals: alert.alertVitals,
          alertType: alert.alertType,
          redelegate: alert.redelegate,
        };
        const migratedAlert = new MigratedAlert(alertData);
        const migratedAlertId = await migratedAlert.save();
        migratedAlertIds.push(migratedAlertId);
      });
    }

    let migratedAlertConfigId;
    if (alertConfigId) {
      const alertConfig = await AlertConfig.findById(alertConfigId);
      const alertConfigData = {
        rrConfig: alertConfig.rrConfig,
        hrConfig: alertConfig.hrConfig,
        bpSysConfig: alertConfig.bpSysConfig,
        bpDiaConfig: alertConfig.bpDiaConfig,
        spO2Config: alertConfig.spO2Config,
        temperatureConfig: alertConfig.temperatureConfig,
      };
      const migratedAlertConfig = new MigratedAlertConfig(alertConfigData);

      migratedAlertConfigId = await migratedAlertConfig.save();
    }

    const migratedReminderIds = [];
    if (reminders) {
      reminders.map(async (reminderId) => {
        const reminder = await Reminder.findById(reminderId);
        const reminderData = {
          content: reminder.content,
          isComplete: reminder.isComplete,
          picture: reminder.picture,
          createdBy: reminder.createdBy,
          patient: patient._id,
          time: reminder.time,
          interval: reminder.interval,
        };
        const migratedReminder = new MigratedReminder(reminderData);
        const migratedReminderId = await migratedReminder.save();
        migratedReminderIds.push(migratedReminderId);
      });
    }

    let migratedVitalId;
    if (vitalId) {
      const vital = await Vital.findById(vitalId);
      const vitalData = {
        respRate: vital.respRate,
        heartRate: vital.heartRate,
        bloodPressureSys: vital.bloodPressureSys,
        bloodPressureDia: vital.bloodPressureDia,
        spO2: vital.spO2,
        news2Score: vital.news2Score,
        temperature: vital.temperature,
      };
      const migratedVital = new MigratedVital(vitalData);
      migratedVitalId = await migratedVital.save();
    }

    const migratedReportIds = [];
    if (reports) {
      reports.map(async (reportId) => {
        const report = await Report.findById(reportId);
        const reportData = {
          name: report.name,
          type: report.type,
          content: report.content,
          url: report.url,
        };
        if (report.type == "event") {
          console.log("Deleting event report, ", report);
          await deleteReport(reportId);
        } else if (report.type == "discharge") {
          const migratedReport = new MigratedReport(reportData);
          const migratedReportId = await migratedReport.save();
          migratedReportIds.push(migratedReportId);
        }
      });
    }

    const migratedPatientData = {
      name: patient.name,
      nric: patient.nric,
      picture: patient.picture,
      condition: patient.condition,
      infoLogs: patient.infoLogs,
      copd: patient.copd,
      o2Intake: patient.o2Intake,
      consciousness: patient.consciousness,
      acuityLevel: patient.acuityLevel,
      fallRisk: patient.fallRisk,
      admissionDateTime: patient.admissionDateTime,
      dischargeDateTime: patient.dischargeDateTime,
      alerts: migratedAlertIds,
      alertConfig: migratedAlertConfigId,
      reminders: migratedReminderIds,
      vital: migratedVitalId,
      reports: migratedReportIds,
    };

    const newPatient = new Patient(migratedPatientData);
    await newPatient.save();
  } catch (error) {
    console.error("Error during patient migration:", error);
  } finally {
    if (ahDbConnection) {
      ahDbConnection.close();
    }
  }
};

module.exports = {
  migratePatient,
};
