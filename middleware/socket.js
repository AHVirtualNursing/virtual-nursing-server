const socket = require("socket.io");
const vitalController = require("../controllers/vitalController");
const patientController = require("../controllers/patientController");

const configureSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:3002",
      methods: ["GET", "POST"],
    },
  });

  const clientConnections = new Map();

  const findClientSocket = (clientConnectionIdentifier) => {
    const clientSocket = clientConnections.get(clientConnectionIdentifier);
    if (clientSocket) {
      return clientSocket;
    } else {
      console.error(
        `No such client connection identifier ${clientConnectionIdentifier} in client connections.`
      );
    }
  };

  io.on("connection", (socket) => {
    socket.on("connectSmartWatch", async (patientId) => {
      clientConnections.set(patientId, socket);
    });

    socket.on("clientConnections", (virtualNurseId) => {
      if (!findClientSocket(virtualNurseId)) {
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
      const clientSocket = findClientSocket(patientId);

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

      if (clientSocket) {
        clientSocket.emit("updateVitals", vitals);
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
      const clientSocket = findClientSocket(virtualNurse._id.toString());

      if (clientSocket) {
        clientSocket.emit("updatedVitals", { vital: vital, patient: patient });
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

      const clientSocket = findClientSocket(virtualNurse._id.toString());

      await patientController.getAlertsByPatientId(req, res);
      const alertList = res.jsonData;

      if (clientSocket) {
        clientSocket.emit("alertIncoming", { alert: alert, patient: patient });
        clientSocket.emit("patientAlertAdded", {
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

      const clientSocket = findClientSocket(virtualNurse._id.toString());

      await patientController.getAlertsByPatientId(req, res);
      const alertList = res.jsonData;

      if (clientSocket) {
        clientSocket.emit("patientAlertDeleted", {
          alertList: alertList,
          patient: patient,
        });
      }
    });

    socket.on("virtualToBedsideNurseChatUpdate", (chat) => {
      const clientSocket = findClientSocket(chat.bedsideNurse._id);

      if (clientSocket) {
        clientSocket.emit("updateBedsideNurseChat", chat);
      }
    });

    socket.on("bedsideToVirtualNurseChatUpdate", (chat) => {
      const clientSocket = findClientSocket(chat.virtualNurse._id);

      if (clientSocket) {
        clientSocket.emit("updateVirtualNurseChat", chat);
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
      const clientSocket = findClientSocket(virtualNurse._id.toString());

      if (clientSocket) {
        clientSocket.emit("updatedSmartbed", smartbed);
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
      const clientSocket = findClientSocket(virtualNurse._id.toString());

      if (clientSocket) {
        clientSocket.emit("updatedPatient", patient);
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


    socket.on("discharge-patient", (patient, virtualNurse) => {
      // const {patientId, vitalId, alertConfigId } = data;
      // generateAndUploadDischargeReport(patientId, vitalId, alertConfigId);

      const clientSocket = clientConnections.get(String(virtualNurse._id));
      if(clientSocket){
        clientSocket.emit("dischargePatient", patient);
      }

      
    });

    socket.on("disconnect", () => {
      clientConnections.delete(socket.id);
    });
  });
};

module.exports = configureSocket;
