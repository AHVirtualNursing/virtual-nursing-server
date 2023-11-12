const socket = require("socket.io");
const vitalController = require("../controllers/vitalController");
const patientController = require("../controllers/patientController");
const admitPatientNotification = require("../helper/admitPatientNotification");

const configureSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:3002",
      methods: ["GET", "POST"],
    },
  });

  const clientConnections = new Map();

  io.on("connection", (socket) => {
    socket.on("connectSmartWatch", async (patientId) => {
      clientConnections.set(patientId, socket);
    });

    socket.on("clientConnections", (virtualNurseId) => {
      if (!clientConnections.get(virtualNurseId)) {
        clientConnections.set(virtualNurseId, socket);
        console.log(`Connection established with ${virtualNurseId}`);
      }
    });

    socket.on("connectBedsideNurseForChatMessaging", (nurseId) => {
      console.log("Bedside Nurse is connected to Socket");
      clientConnections.set(nurseId, socket);
    });

    socket.on("watchData", (vitals) => {
      const patientId = vitals["patientId"];
      const dashboardSocket = clientConnections.get(patientId);

      const vitalsData = {
        datetime: vitals["datetime"],
        heartRate: vitals["heartRate"],
        bloodPressureSys: vitals["bloodPressureSys"],
        bloodPressureDia: vitals["bloodPressureDia"],
        spO2: vitals["spO2"],
        temperature: vitals["temperature"],
        respRate: vitals["respRate"],
      };

      vitalController.processVitalForPatient(patientId, vitalsData);

      if (dashboardSocket) {
        socket.emit("updateVitals", vitals);
      } else {
        console.log(`No dashboard found for patient ID ${patientId}`);
      }
    });

    socket.on("update-vitals", async (vital, patient) => {
      const req = { params: { id: patient } };
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
      const patientSocket = clientConnections.get(String(virtualNurse._id));

      if (patientSocket) {
        patientSocket.emit("updatedVitals", { vital: vital, patient: patient });
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

      await patientController.getPatientById(req, res);
      const patient = res.jsonData;

      const alertSocket = clientConnections.get(String(virtualNurse._id));

      await patientController.getAlertsByPatientId(req, res);
      const alertList = res.jsonData;

      if (alertSocket) {
        alertSocket.emit("alertIncoming", { alert: alert, patient: patient });
        alertSocket.emit("patientAlertAdded", {
          alertList: alertList,
          patient: patient,
        });
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

      await patientController.getPatientById(req, res);
      const patient = res.jsonData;

      const alertSocket = clientConnections.get(String(virtualNurse._id));

      await patientController.getAlertsByPatientId(req, res);
      const alertList = res.jsonData;

      if (alertSocket) {
        alertSocket.emit("patientAlertDeleted", {
          alertList: alertList,
          patient: patient,
        });
      }
    });

    socket.on("virtualToBedsideNurseChatUpdate", (chat) => {
      const bedsideNurseSocket = clientConnections.get(chat.bedsideNurse._id);
      if (bedsideNurseSocket) {
        bedsideNurseSocket.emit("updateBedsideNurseChat", chat);
      }
    });

    socket.on("bedsideToVirtualNurseChatUpdate", (chat) => {
      const virtualNurseSocket = clientConnections.get(chat.virtualNurse._id);
      if (virtualNurseSocket) {
        virtualNurseSocket.emit("updateVirtualNurseChat", chat);
      }
    });

    socket.on("update-smartbed", async (smartbed) => {
      const req = { params: { id: smartbed.patient } };
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
      const patientSocket = clientConnections.get(String(virtualNurse._id));

      if (patientSocket) {
        patientSocket.emit("updatedSmartbed", smartbed);
      }
    });

    socket.on("update-patient", async (patient) => {
      const req = { params: { id: patient._id } };
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
      const patientSocket = clientConnections.get(String(virtualNurse._id));

      if (patientSocket) {
        patientSocket.emit("updatedPatient", patient);
      }
    });

    socket.on("update-alert", async(alert) => {
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
      const alertSocket = clientConnections.get(String(virtualNurse._id));

      if (alertSocket) {
        alertSocket.emit("updatedAlert", alert);
      }

    })

    socket.on("admit-patient", async (patient) => {
      admitPatientNotification.sendAdmitPatientNotification(patient);
    })

    socket.on("fallRiskUpdate", (data) => {
      const [patient, virtualNurseId] = data;
      const fallRiskSocket = clientConnections.get(virtualNurseId);
      if (fallRiskSocket) {
        fallRiskSocket.emit("newFallRisk", patient.fallRisk);
      }
    });

    socket.on("disconnect", () => {
      clientConnections.delete(socket.id);
    });
  });
};

module.exports = configureSocket;
