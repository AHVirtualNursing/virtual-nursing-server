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
      } else if (method == "GET") {
        return response.data._id;
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
  mongoose.connect(process.env.MONGODB_LOCAL_URI, {
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
        );
      });
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

    const patientIds = [];
    // create patient
    patients.map(async (patient, index) => {
      const patientId = await callApiRequest(
        `${SERVER_URL}/patient`,
        "POST",
        patient
      );

      patientIds.push([patientId, patient.name]);

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

    console.log("\x1b[34m", patientIds);
  }

  setInterval(() => {
    console.log("\x1b[34m", "****** DB INITIALISED ******");
    console.log("\x1b[0m", "");
    process.exit(1);
  }, 2000);
}

async function populateVitalsForPatient() {
  const SERVER_URL = "http://localhost:3001";
  mongoose.connect(process.env.MONGODB_LOCAL_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: false,
  });

  let idx = 0; // Initialize the loop counter

  while (idx < patients.length) {
    const patientId = await callApiRequest(
      `${SERVER_URL}/patient/nric/${patients[idx].nric}`,
      "GET"
    );
    console.log(patientId);

    //generate array of datetimes every minute in a day for the patient
    admissionDate = new Date();
    admissionDate.setDate(patients[idx].admissionDateTime.getDate());
    datetimes = datetimeInADay(admissionDate);
    console.log(datetimes);

    //generate array of heart rate every minute in a day for a patient
    heartRateArray = generateRandomVital("heartRate");
    console.log(heartRateArray);

    //generate array of sp02 every minute in a day for a patient
    spO2Array = generateRandomVital("spO2");
    console.log(spO2Array);

    //generate array of bloodPressureSys every minute in a day for a patient
    bloodPressureSysArray = generateRandomVital("bloodPressureSys");
    console.log(bloodPressureSysArray);

    //generate array of bloodPressureDia every minute in a day for a patient
    bloodPressureDiaArray = generateRandomVital("bloodPressureDia");
    console.log(bloodPressureDiaArray);

    //generate array of temperature every minute in a day for a patient
    temperatureArray = generateRandomVital("temperature");
    console.log(temperatureArray);

    //generate array of respRate every minute in a day for a patient
    respRateArray = generateRandomVital("respRate");
    console.log(respRateArray);

    for (let i = 0; i < 1440; i++) {
      const req = {
        patient: patientId,
        datetime: datetimes[i],
        respRate: respRateArray[i],
        heartRate: heartRateArray[i],
        bloodPressureSys: bloodPressureSysArray[i],
        bloodPressureDia: bloodPressureDiaArray[i],
        spO2: spO2Array[i],
        temperature: temperatureArray[i],
      };

      const vitalId = await callApiRequest(`${SERVER_URL}/vital`, "POST", req);
    }

    idx++;
  }
  setInterval(() => {
    console.log("\x1b[34m", "****** VITALS INITIALISED ******");
    console.log("\x1b[0m", "");
    process.exit(1);
  }, 2000);
}

function generateRandomVital(type) {
  /* THRESHOLDS */
  // hr: 60-100bpm, rr: 16-20, bp: 90-120/60-80, spo2 >= 95%, temperature: 36.2 - 37.2, respiratoryRate: 12-18 bpm
  let sourceArray;
  switch (type) {
    case "heartRate":
      sourceArray = [66, 76, 85, 90, 102, 115, 100, 95, 70, 55];
      break;
    case "spO2":
      sourceArray = [96, 95, 97, 97, 96, 95, 93, 95, 96, 95, 88, 90];
      break;
    case "bloodPressureSys":
      sourceArray = [90, 100, 114, 120, 126, 120, 110, 89, 75, 73];
      break;
    case "bloodPressureDia":
      sourceArray = [76, 79, 82, 86, 90, 80, 74, 60, 54, 57];
      break;
    case "temperature":
      sourceArray = [
        36.2, 36.5, 36.7, 37.0, 37.2, 37.5, 38.2, 37.3, 36.2, 35.9,
      ];
      break;
    case "respRate":
      sourceArray = [12, 16, 18, 19, 20, 18, 15, 12, 10, 11];
      break;
  }

  const randomArray = [];
  for (let i = 0; i < 1440; i++) {
    const randomIndex = Math.floor(Math.random() * sourceArray.length);
    randomArray.push(sourceArray[randomIndex]);
  }

  return randomArray;
}

function datetimeInADay(date) {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0); // Set the time to midnight

  const endDate = new Date(); // Get the current date and time
  endDate.setDate(endDate.getDate() + 1); // Set the end date to the next day

  const minuteInterval = 1; // Generate datetime values for every minute

  const dateTimes = [];
  for (
    let currentTime = new Date(startDate);
    currentTime < endDate;
    currentTime.setMinutes(currentTime.getMinutes() + minuteInterval)
  ) {
    dateTimes.push(new Date(currentTime));
  }

  return dateTimes;
}

module.exports = {
  initialiseDb,
  populateVitalsForPatient,
};
