const xlsx = require("xlsx");
const { io } = require("socket.io-client");
const SERVER_URL = "http://localhost:3001";

const handler = async (event) => {
  const socket = io(SERVER_URL);

  try {
    const excelDataBuffer = Buffer.from(event.body, "base64");
    const workbook = xlsx.read(excelDataBuffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    const response = {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    socket.emit("connectSmartWatch", patientId);

    const vitals = response.filter((vital) => vital["FLWSHT_TYPE"] === dataType);

    let index = 0;
    const vitalType = vitals[0]["FLWSHT_TYPE"].split("_")[1];

    setInterval(() => {
      const vital = {
        datetime: getCurrentFormattedDatetime(),
        patientId: patientId,
        [vitalType]: parseInt(vitals[index]["FLWSHT_VALUE"]),
      };
      socket.emit("watchData", vital);
      index++;
    }, 2000);
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "An error occurred" }),
    };
  }
};

function getCurrentFormattedDatetime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

module.exports = {
  handler,
};
