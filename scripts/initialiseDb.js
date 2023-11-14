require("dotenv").config();
const axios = require("axios");
const {
  wards,
  nurses,
  smartbeds,
  patients,
  smartWearables,
} = require("./consts");
const { Patient } = require("../models/patient");
const { mongooseConnect } = require("../middleware/mongoose");

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

console log statemnets in send mock patient vitals file => "setting bed exit alarm to false"

Triggers
1. breach of protocol: bed exit alarm not set, fall risk high
Attributes: isBedExitAlarmOn == false AND patient.fallRisk == high
Behaviour: 
- red colour warning sign, input box and confirm button will pop out
- when nurse confirm the button, input disable, button disappear, red colour warning sign turn to orange (if fall risk is still high, else no more warning sign)

2. create bed alert
Attributes: isBedExitAlarmOn == true, isPatientOnBed == false
Behaviour:
- bed alert seen on dvs and mobile

3. bed exit alarm on OR fall risk != high
Attributes: isBedExitAlarmOn == true || patient.fallRisk != high
Behaviour: 
- no warning sign

4. patient physically on bed
Attributes: isPatientOnBed
Behaviour:
- true => coloured bed picture on patient overview
- false => greyed out bed picture on patient overview

5. bed isLowestPosition false
Attributes: isLowestPosition == false
Behaviour:
- show orange warning beside the word "bed height"

6. change in bed rails
Attributes: isRightUpperRail, isRightLowerRail, isLeftUpperRail, isLeftLowerRail
Behaviours:
- bed rails on patient overview tile view page will update accordingly

7. bed brakes
Attributes: isBrakeSet
Behaviour:
- orange warning sign if brakes not set in bed status tab or tile view


*/
let patientIds = [];

async function callApiRequest(url, method, data, clientType) {
  const config = {
    method: method,
    url: url,
    headers: {
      "Content-Type": "application/json",
      "X-UserType": clientType ? clientType : "",
    },
    data: data,
  };

  try {
    const response = await axios(config);

    if (response.status == 200 || response.status == 201) {
      console.log("\x1b[32m", `${url} ${method} request successful.`);

      if (method == "POST") {
        return response.data.data._id;
      } else if (method == "GET") {
        return response.data;
      }
    } else {
      console.error(`Error calling ${url} request: ${response.status}`);
    }
  } catch (error) {
    console.log("\x1b[31m", `Error calling ${url}: ${error.message}`);
    throw error;
  }
}

async function initialiseDb() {
  const SERVER_URL = "http://localhost:3001";
  await mongooseConnect();

  const patient = await Patient.findOne({ name: "Hazel Lim" });
  if (patient) {
    return patient._id.toString();
  }

  // create wards
  const wardIds = await Promise.all(
    wards.map(async (ward) => {
      const wardId = await callApiRequest(`${SERVER_URL}/ward`, "POST", ward);
      return wardId;
    })
  );

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

  // create smartbeds
  const smartbedIds = await Promise.all(
    smartbeds.map(async (smartbed) => {
      const smartbedId = await callApiRequest(
        `${SERVER_URL}/smartbed`,
        "POST",
        {
          name: smartbed.name,
        }
      );
      return smartbedId;
    })
  );

  // assign smartbed to ward
  await Promise.all(
    smartbeds.map(async (smartbed, index) => {
      await callApiRequest(
        `${SERVER_URL}/ward/${wardIds[smartbed.wardIndex]}/smartbed/${
          smartbedIds[index]
        }`,
        "PUT",
        {
          roomNum: smartbed.roomNum,
          bedNum: smartbed.bedNum,
        }
      );
    })
  );

  // create nurses
  const nurseIds = [];
  const headNurseIds = [];
  await Promise.all(
    nurses.map(async (nurse, index) => {
      const nurseId = await callApiRequest(
        `${SERVER_URL}/auth/register?default=true`,
        "POST",
        {
          username: nurse.username,
          email: nurse.email,
          name: nurse.name,
          nurseStatus: nurse.nurseStatus,
          ward: String(wardIds[nurse.wardIndex]),
        },
        "mobile"
      );

      if (nurse.nurseStatus == "head") {
        headNurseIds.push(nurseId);
      } else {
        nurseIds.push(nurseId);
      }

      if (nurse.wardIndex == 0) {
        await callApiRequest(
          `${SERVER_URL}/smartbed/${smartbedIds[20]}/nurses`,
          "PUT",
          {
            newNurses: [nurseId],
          }
        );

        await callApiRequest(
          `${SERVER_URL}/smartbed/${smartbedIds[21]}/nurses`,
          "PUT",
          {
            newNurses: [nurseId],
          }
        );
      } else {
        await callApiRequest(
          `${SERVER_URL}/smartbed/${smartbedIds[22]}/nurses`,
          "PUT",
          {
            newNurses: [nurseId],
          }
        );
        await callApiRequest(
          `${SERVER_URL}/smartbed/${smartbedIds[23]}/nurses`,
          "PUT",
          {
            newNurses: [nurseId],
          }
        );
        await callApiRequest(
          `${SERVER_URL}/smartbed/${smartbedIds[24]}/nurses`,
          "PUT",
          {
            newNurses: [nurseId],
          }
        );
      }

      await callApiRequest(
        `${SERVER_URL}/smartbed/${smartbedIds[index]}/nurses`,
        "PUT",
        {
          newNurses: [nurseId],
        }
      );
    })
  );

  // assign nurses to head nurse
  await Promise.all(
    nurseIds.map(async (nurseId, index) => {
      await callApiRequest(
        `${SERVER_URL}/nurse/${nurseId}`,
        "PUT",
        {
          headNurse: headNurseIds[index % 2],
        },
        "mobile"
      );
    })
  );

  // create smart wearables
  const smartWearableIds = await Promise.all(
    smartWearables.map(async (smartWearable) => {
      const smartWearableId = await callApiRequest(
        `${SERVER_URL}/smartWearable`,
        "POST",
        smartWearable
      );
      return smartWearableId;
    })
  );

  // create patient
  patientIds = await Promise.all(
    patients.map(async (patient, index) => {
      // create patient
      patient.smartbed = smartbedIds[index];

      const patientId = await callApiRequest(
        `${SERVER_URL}/patient`,
        "POST",
        patient
      );

      // create default alert config
      await callApiRequest(`${SERVER_URL}/alertConfig`, "POST", {
        patient: patientId,
      });

      // assign patient to smartbed
      await callApiRequest(
        `${SERVER_URL}/smartbed/${smartbedIds[index]}`,
        "PUT",
        {
          patient: patientId,
          bedStatus: "occupied",
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
      return patientId;
    })
  );

  // create abnormal vitals for a patient to trigger alert
  await callApiRequest(`${SERVER_URL}/vital`, "POST", {
    patient: patientIds[0],
    heartRate: 140,
    respRate: 15,
    bloodPressureSys: 67,
    bloodPressureDia: 80,
    spO2: 96,
    temperature: 36,
    datetime: "2023-11-14T14:30:00",
  });

  // set alert status to complete
  let alert = await callApiRequest(`${SERVER_URL}/alert`, "GET");
  await callApiRequest(`${SERVER_URL}/alert/${alert.data[0]._id}`, "PUT", {
    status: "complete",
  });

  await callApiRequest(`${SERVER_URL}/vital`, "POST", {
    patient: patientIds[0],
    heartRate: 80,
    respRate: 15,
    bloodPressureSys: 67,
    bloodPressureDia: 80,
    spO2: 96,
    temperature: 40,
    datetime: "2023-11-14T17:34:25",
  });

  alert = await callApiRequest(`${SERVER_URL}/alert`, "GET");
  await callApiRequest(`${SERVER_URL}/alert/${alert.data[1]._id}`, "PUT", {
    status: "complete",
  });

  console.log("\x1b[34m", "****** DB INITIALISED ******");
  console.log("\x1b[0m", "");
}

async function populateVitalsForPatient() {
  const SERVER_URL = "http://localhost:3001";
  mongooseConnect();

  let idx = 0; // Initialize the loop counter

  while (idx < patients.length) {
    //generate array of datetimes every minute in a day for the patient
    admissionDate = new Date();
    admissionDate.setDate(patients[idx].admissionDateTime.getDate());
    datetimes = datetimeInADay(admissionDate);

    //generate array of heart rate every minute in a day for a patient
    heartRateArray = generateRandomVital("heartRate");

    //generate array of sp02 every minute in a day for a patient
    spO2Array = generateRandomVital("spO2");

    //generate array of bloodPressureSys every minute in a day for a patient
    bloodPressureSysArray = generateRandomVital("bloodPressureSys");

    //generate array of bloodPressureDia every minute in a day for a patient
    bloodPressureDiaArray = generateRandomVital("bloodPressureDia");

    //generate array of temperature every minute in a day for a patient
    temperatureArray = generateRandomVital("temperature");

    //generate array of respRate every minute in a day for a patient
    respRateArray = generateRandomVital("respRate");

    for (let i = 0; i < 1440; i++) {
      const req = {
        patient: patientIds[idx],
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

  console.log("\x1b[34m", "****** VITALS INITIALISED ******");
  console.log("\x1b[0m", "");
  process.exit(1);
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
