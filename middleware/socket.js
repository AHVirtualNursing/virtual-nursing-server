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
    const virtualNurseChatConnections = new Map();
  const bedsideNurseChatConnections = new Map();

  io.on("connection", (socket) => {
    socket.on("connectSmartWatch", async (patientId) => {
      smartWatchConnections.set(patientId, socket);
    });

    socket.on("connectDashboard", (patientId) => {
      dashboardConnections.set(patientId, socket);
    });

    socket.on("alertConnections", (virtualNurseId) => {
      alertConnections.set(virtualNurseId, socket)
    })

    socket.on("watchData", (vitals) => {
      console.log(vitals);
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
      console.log(alert + "send to vn");
      await patientController.getVirtualNurseByPatientId(req, res);
      const virtualNurse = res.jsonData;
      const alertSocket = alertConnections.get(virtualNurse._id)
      console.log(alertSocket);
      if(alertSocket){
        alertSocket.emit("alertIncoming", alert);
      }
      
    });

    socket.on("connectVirtualNurseForChatMessaging", (nurseId) => {
      virtualNurseChatConnections.set(nurseId, socket);
    });

    socket.on("connectBedsideNurseForChatMessaging", (nurseId) => {
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

    socket.on("disconnect", () => {
      smartWatchConnections.delete(socket.id);
      dashboardConnections.delete(socket.id);
      alertConnections.delete(socket.id);
    });
  });
};

module.exports = configureSocket;
