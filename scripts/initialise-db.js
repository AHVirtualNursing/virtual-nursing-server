const axios = require("axios");
const Patient = require("../models/patient");

const SERVER_URL = "http://localhost:3001";

async function callApiRequest(url, method, data) {
  const config = {
    method: method,
    url: url,
    headers: {
      "Content-Type": "application/json",
      "X-UserType": "mobile",
    },
    data: "",
  };

  config.data = data;

  try {
    const response = await axios(config);

    if (response.status == 200 || 201) {
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

    const nurseId = await callApiRequest(`${SERVER_URL}/auth/register`, "POST", {
      username: "nurse",
      email: "nurse@gmail.com",
      name: "nurse",
      nurseStatus: "head",
      ward: wardId,
    });

    /* create and assign smart bed to patient */
    const smartBedId = await callApiRequest(`${SERVER_URL}/smartbed`, "POST", {
      name: "smart bed 1",
    });

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
    return patientId;
  }
}

module.exports = {
  initialiseDb,
};
