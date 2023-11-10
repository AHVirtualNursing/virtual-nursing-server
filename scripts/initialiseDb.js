const mongoose = require("mongoose");
require("dotenv").config();
const axios = require("axios");
const Patient = require("../models/patient");
const {
  wards,
  nurses,
  smartbeds,
  patients,
  smartWearables,
} = require("./consts");

/*
DB Initialisation
Users
- 1 virtual nurse
- 1 it admin
- 6 mobile nurses (1 head nurse)
- 10 patients (10 / ward ) 
* 3 on T-2, 4 on T-1, 3 on T-0
* 60*24 = 1440 / day / patient * (3 * 2 + 4 * 1)

DVS
- 2 wards (10 rooms B and C)
- 24 smartbeds
- 24 smart wearables

* vitals are always in 1 min intervals
* all patients stay

Mobile
- 1 closed patient reminder for each patient

** Simulation **

Vitals
both low and high defualt
HR, RR, BP, SPO2, Temp

** T0 **
Patient 1
[]

Patient 2
[]

** T1 **
Patient 1
Abnormal [HR]

Patient 2
[]

** T2 **
Patient 1
Abnormal [HR]

Patient 2
Abnormal [SPO2]




Fall Risk
Low, Medium, High
breach of protocol: bed exit alarm not set, fall risk high
bed alert needs to be generated: bed exit alarm set and patient not on bed

Bed Height
warning sign for bed height: if isLowestPosition false 

Bed Brakes
warning sign for bed brakes: if isBrakeSet false (per patient)

Bed Rails
changing rail colour: change the rails around (4 patients)


*/

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
      console.log("\x1b[32m", `${url} ${method} request successful.`);

      if (method == "POST") {
        return response.data.data._id;
      }
    } else {
      console.error(`Error calling ${url} request: ${response.status}`);
    }
  } catch (error) {
    console.log("\x1b[31m", `Error calling ${url}: ${error.message}`);
  }
}

async function initialiseDb() {
  const SERVER_URL = "http://localhost:3001";
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: false,
  });

  const patient = await Patient.findOne({ name: "Hazel Lim" });
  if (patient) {
    return patient._id.toString();
  } else {
    // create wards
    const wardIds = [];
    wards.map(async (ward) => {
      const wardId = callApiRequest(`${SERVER_URL}/ward`, "POST", ward).then(
        (wardId) => {
          wardIds.push(wardId);
        }
      );
    });

    // create smartbeds
    const smartbedIds = [];
    smartbeds.map(async (smartbed) => {
      const smartbedId = callApiRequest(`${SERVER_URL}/smartbed`, "POST", {
        name: smartbed.name,
      }).then((smartbedId) => {
        smartbedIds.push(smartbedId);
      });
    });

    // create nurses
    const nurseIds = [];
    nurses.map(async (nurse, index) => {
      const nurseId = callApiRequest(
        `${SERVER_URL}/auth/register?default=true`,
        "POST",
        {
          username: nurse.username,
          email: nurse.email,
          name: nurse.name,
          nurseStatus: nurse.nurseStatus,
          wardIndex: wardIds[nurse.wardIndex],
        },
        "mobile"
      ).then(async (nurseId) => {
        nurseIds.push(nurseId);
        await callApiRequest(
          `${SERVER_URL}/smartbed/${smartbedIds[index]}/nurses
      `,
          "PUT",
          {
            newNurses: [nurseId],
          }
        )
      }
      );
    });

    // create smart wearables
    const smartWearableIds = [];
    smartWearables.map(async (smartWearable) => {
      const smartWearableId = callApiRequest(
        `${SERVER_URL}/smartWearable`,
        "POST",
        smartWearable
      ).then((smartWearableId) => smartWearableIds.push(smartWearableId));
    });

    // create patient
    patients.map(async (patient, index) => {
      const patientId = await callApiRequest(
        `${SERVER_URL}/patient`,
        "POST",
        patient
      );

      // create default alert config
      await callApiRequest(`${SERVER_URL}/alertConfig`, "POST", {
        patient: patientId,
      });

      // assign smartbed to ward
      await callApiRequest(
        `${SERVER_URL}/ward/${wardIds[smartbeds[index].wardIndex]}/smartbed/${
          smartbedIds[index]
        }`,
        "PUT",
        {
          roomNum: smartbeds[index].roomNum,
          bedNum: smartbeds[index].bedNum,
        }
      );

      // assign patient to smartbed
      await callApiRequest(
        `${SERVER_URL}/smartbed/${smartbedIds[index]}`,
        "PUT",
        {
          patient: patientId,
        }
      );

      // assign smart wearable to patient
      await callApiRequest(
        `${SERVER_URL}/smartWearable/${smartWearableIds[index]}`,
        "PUT",
        {
          patient: patientId,
        }
      );
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
        wards: wardIds,
      },
      "virtual-nurse"
    );
  }

  setInterval(() => {
    console.log("\x1b[34m", "****** DB INITIALISED ******");
    console.log("\x1b[0m", "");
    process.exit(1);
  }, 2000);
}

module.exports = {
  initialiseDb,
};
