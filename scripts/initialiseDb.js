const mongoose = require("mongoose");
require("dotenv").config();
const axios = require("axios");
const Patient = require("../models/patient");

const SERVER_URL = "http://localhost:3001";
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: false,
});

async function callApiRequest(url, method, data, clientType) {
  const config = {
    method: method,
    url: url,
    headers: {
      "Content-Type": "application/json",
      "X-UserType": clientType ? clientType : "",
    },
    data: "",
  };

  config.data = data;

  try {
    const response = await axios(config);

    if (response.status == 200 || 201) {
      console.log(`${url} ${method} request successful.`);
      console.log(response.data);

      if (method == "POST") {
        return response.data.data._id;
      }
    } else {
      console.error(`Error calling ${url} request: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error calling request: ${error.message}`);
  }
}

async function initialiseDb() {
  const patient = await Patient.findOne({ name: "Hazel Lim" });
  if (patient) {
    return patient._id;
  } else {
    /* create patient */
    const patientId = await callApiRequest(`${SERVER_URL}/patient`, "POST", {
      name: "Hazel Lim",
      nric: "999A",
      condition: "Cancer",
    });

    /* create ward and nurse */
    const wardId = await callApiRequest(`${SERVER_URL}/ward`, "POST", {
      wardNum: 1,
      wardType: "A1",
      numRooms: 2,
    });

    const nurseId = await callApiRequest(
      `${SERVER_URL}/auth/register?default=true`,
      "POST",
      {
        username: "nurse",
        email: "nurse@gmail.com",
        name: "nurse",
        nurseStatus: "head",
        ward: wardId,
      },
      "mobile"
    );

    /* create and assign smart bed to ward and patient */
    const smartBedId = await callApiRequest(`${SERVER_URL}/smartbed`, "POST", {
      name: "smart bed 1",
    });

    callApiRequest(
      `${SERVER_URL}/ward/${wardId}/smartbed/${smartBedId}`,
      "PUT",
      {
        roomNum: 1,
        bedNum: 1,
      }
    );

    callApiRequest(`${SERVER_URL}/smartbed/${smartBedId}`, "PUT", {
      patient: patientId,
    });

    /* assign smartbed to nurse */
    await callApiRequest(
      `${SERVER_URL}/smartbed/${smartBedId}/nurses
    `,
      "PUT",
      {
        newNurses: [nurseId],
      }
    );

    /* create smart wearable and assign to patient */
    const smartWearableId = await callApiRequest(
      `${SERVER_URL}/smartWearable`,
      "POST",
      {
        name: "Smart Wearable 1",
        serialNumber: "ABC-123",
      }
    );

    await callApiRequest(
      `${SERVER_URL}/smartWearable/${smartWearableId}
    `,
      "PUT",
      {
        patient: patientId,
      }
    );

    /* create alert config for patient */
    await callApiRequest(`${SERVER_URL}/alertConfig`, "POST", {
      patient: patientId,
    });

    /* create it admin and virtual nurse */
    await callApiRequest(
      `${SERVER_URL}/auth/register?default=true`,
      "POST",
      {
        name: "itadmin",
        username: "itadmin",
        email: "itadmin@gmail.com",
      },
      "it-admin"
    );

    await callApiRequest(
      `${SERVER_URL}/auth/register?default=true`,
      "POST",
      {
        name: "virtualnurse",
        username: "virtualnurse",
        email: "virtualnurse@gmail.com",
        wards: [wardId],
      },
      "virtual-nurse"
    );

    return patientId;
  }
}

module.exports = {
  initialiseDb,
};
