const socket = require("socket.io");
const vitalController = require("../controllers/vitalController");
const patientController = require("../controllers/patientController");
const smartbed = require("../models/smartbed");

const configureSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:3002",
      methods: ["GET", "POST"],
    },
  });

  const smartWatchConnections = new Map();
  // maps patient to open nurse sockets
  const dashboardConnections = new Map();
  // maps each virtual nurse to a socket
  const dvsClientConnections = new Map();
  const virtualNurseChatConnections = new Map();
  const bedsideNurseChatConnections = new Map();

  io.on("connection", (socket) => {
    socket.on("connectSmartWatch", async (patientId) => {
      smartWatchConnections.set(patientId, socket);
    });

    socket.on("connectDashboard", (patientId) => {
      if (!dashboardConnections.has(patientId)) {
        dashboardConnections.set(patientId, [socket]);
      } else {
        const connectedSockets = dashboardConnections.get(patientId);
        if (!connectedSockets.includes(socket)) {
          connectedSockets.push(socket);
        }
      }
    });

    socket.on("disconnectDashboard", (patientId) => {
      if (dashboardConnections.has(patientId)) {
        const connectedSockets = dashboardConnections.get(patientId);
        const index = connectedSockets.indexOf(socket);
        if (index !== -1) {
          connectedSockets.splice(index, 1);
          if (connectedSockets.length === 0) {
            dashboardConnections.delete(patientId);
          }
        }
      }
    });

    socket.on("dvsClientConnections", (virtualNurseId) => {
      console.log(`Connection established with ${virtualNurseId}`);
      dvsClientConnections.set(virtualNurseId, socket);
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
        temperature: vitals["temperature"],
        respRate: vitals["respRate"],
      };

      vitalController.processVitalForPatient(patientId, vitalsData);

      if (dashboardSocket) {
        for (const socket of dashboardSocket) {
          socket.emit("updateVitals", vitals);
        }
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
      const patientSocket = dvsClientConnections.get(String(virtualNurse._id));

      if(patientSocket){
        patientSocket.emit("updatedVitals", {vital: vital, patient: patient});
      }
    })

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

      const alertSocket = dvsClientConnections.get(String(virtualNurse._id));

      await patientController.getAlertsByPatientId(req, res);
      const alertList = res.jsonData;

      if (alertSocket) {
        alertSocket.emit("alertIncoming", {alert: alert, patient: patient});
        alertSocket.emit("patientAlertAdded", {alertList: alertList, patient: patient});
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

      const alertSocket = dvsClientConnections.get(String(virtualNurse._id));

      await patientController.getAlertsByPatientId(req, res);
      const alertList = res.jsonData;

      if (alertSocket) {
        alertSocket.emit("patientAlertDeleted", {
          alertList: alertList,
          patient: patient,
        });
      }
    });

    socket.on("connectVirtualNurseForChatMessaging", (nurseId) => {
      console.log("Virtual Nurse is connected to Socket");
      virtualNurseChatConnections.set(nurseId, socket);
    });

    socket.on("connectBedsideNurseForChatMessaging", (nurseId) => {
      console.log("Bedside Nurse is connected to Socket");
      bedsideNurseChatConnections.set(nurseId, socket);
    });

    socket.on("virtualToBedsideNurseChatUpdate", (chat) => {
      const bedsideNurseSocket = bedsideNurseChatConnections.get(
        chat.bedsideNurse._id
      );
      if (bedsideNurseSocket) {
        bedsideNurseSocket.emit("updateBedsideNurseChat", chat);
      }
    });

    socket.on("bedsideToVirtualNurseChatUpdate", (chat) => {
      const virtualNurseSocket = virtualNurseChatConnections.get(
        chat.virtualNurse._id
      );
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
      const patientSocket = dvsClientConnections.get(String(virtualNurse._id));
      console.log(patientSocket)
      if (patientSocket) {
        console.log("enter")
        patientSocket.emit("updatedSmartbed", smartbed);
        console.log("post emit")
      }

    })

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
      const patientSocket = dvsClientConnections.get(String(virtualNurse._id));
      
      if(patientSocket){
        patientSocket.emit("updatedPatient", patient);
      }

    })

    socket.on("fallRiskUpdate", (data) => {
      const [patient, virtualNurseId] = data;
      const fallRiskSocket = dvsClientConnections.get(virtualNurseId);
      console.log(fallRiskSocket);
      if (fallRiskSocket) {
        fallRiskSocket.emit("newFallRisk", patient.fallRisk);
      }
    });

    socket.on("disconnect", () => {
      smartWatchConnections.delete(socket.id);
      dashboardConnections.delete(socket.id);
      dvsClientConnections.delete(socket.id);
    });
  });
};

module.exports = configureSocket;
