const socket = require("socket.io");
const vitalController = require("../controllers/vitalController");
const patientController = require("../controllers/patientController");
const { virtualNurse } = require("../models/webUser");

const configureSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:3002",
      methods: ["GET", "POST"],
    },
  });

  const smartWatchConnections = new Map();
  const dashboardConnections = new Map();
  const alertConnections = new Map();

  io.on("connection", (socket) => {
    socket.on("connectSmartWatch", async (patientId) => {
      smartWatchConnections.set(patientId, socket);
    });

    socket.on("connectDashboard", (patientId) => {
      dashboardConnections.set(patientId, socket);
    });

    socket.on("alertConnections", (virtualNurseId) => {
      console.log("connection established");
      alertConnections.set(virtualNurseId, socket);
      console.log(alertConnections);
    });

    socket.on("watchData", (vitals) => {
      const patientId = vitals["patientId"];
      const dashboardSocket = dashboardConnections.get(patientId);

      const vitalsData = {
        datetime: vitals["datetime"],
        heartRate: vitals["heartRate"],
        bloodPressureSys: vitals["bloodPressureSys"],
        bloodPressureDia: vitals["bloodPressureDia"],
        spO2: vitals["spO2"],
      };

      vitalController.processVitalForPatient(patientId, vitalsData);

      if (dashboardSocket) {
        dashboardSocket.emit("updateVitals", vitals);
      } else {
        console.log(`No dashboard found for patient ID ${patientId}`);
      }
    });

    socket.on("new-alert", async (alert) => {
      const req = { params: { id: alert.patient } };
      const res = {
        statusCode: null,
        jsonData: null,
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.jsonData = data;
          return this;
        },
      };

      await patientController.getVirtualNurseByPatientId(req, res);
      const virtualNurse = res.jsonData;
      // console.log(virtualNurse);
      // console.log(virtualNurse._id.toString)
      // console.log(String(virtualNurse._id));
      const alertSocket = alertConnections.get(String(virtualNurse._id));

      await patientController.getAlertsByPatientId(req, res);
      const alertsList = res.jsonData;

      console.log(alertSocket);
      if (alertSocket) {
        console.log("went inside if");
        alertSocket.emit("alertIncoming", alert);
        alertSocket.emit("patientAlertAdded", alertsList);
      }
    });

    socket.on("delete-alert", async (alert) => {
      const req = { params: { id: alert.patient } };
      const res = {
        statusCode: null,
        jsonData: null,
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.jsonData = data;
          return this;
        },
      };

      await patientController.getVirtualNurseByPatientId(req, res);
      const virtualNurse = res.jsonData;
      const alertSocket = alertConnections.get(String(virtualNurse._id));

      await patientController.getAlertsByPatientId(req, res);
      const alertsList = res.jsonData;

      if (alertSocket) {
        alertSocket.emit("patientAlertDeleted", alertsList);
      }
    });

    socket.on("disconnect", () => {
      smartWatchConnections.delete(socket.id);
      dashboardConnections.delete(socket.id);
      alertConnections.delete(socket.id);
    });
  });
};

module.exports = configureSocket;
