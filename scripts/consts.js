const wards = [
  { wardNum: 1, wardType: "B2", numRooms: 2 },
  { wardNum: 2, wardType: "C", numRooms: 3 },
];

const nurses = [
  {
    username: "nurseolaf",
    email: "nurseolaf@gmail.com",
    name: "Olaf",
    nurseStatus: "head",
    smartbeds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    wardIndex: 0,
  },
  {
    username: "nursemoana",
    email: "nursemoana@gmail.com",
    name: "Moana",
    nurseStatus: "head",
    smartbeds: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    wardIndex: 1,
  },
  {
    username: "nurseanna",
    email: "nurseanna@gmail.com",
    name: "Anna",
    nurseStatus: "normal",
    smartbeds: [0, 1, 2, 3, 4],
    wardIndex: 0,
  },
  {
    username: "nursemaui",
    email: "nursemaui@gmail.com",
    name: "Maui",
    nurseStatus: "normal",
    smartbeds: [10, 11, 12, 13, 14],
    wardIndex: 1,
  },
  {
    username: "nurseelsa",
    email: "nurseelsa@gmail.com",
    name: "Elsa",
    nurseStatus: "normal",
    smartbeds: [5, 6, 7, 8, 9],
    wardIndex: 0,
  },
  {
    username: "nursefiona",
    email: "nursefiona@gmail.com",
    name: "Fiona",
    nurseStatus: "normal",
    smartbeds: [15, 16, 17, 18, 19],
    wardIndex: 1,
  },
];

const getDate = (offsetDays) => {
  const date = new Date();
  date.setDate(date.getDate() - offsetDays);
  return date;
};

const patients = [
  {
    name: "Mickey Lim",
    nric: "S9900001A",
    condition: "Heart Disease",
    admissionDateTime: getDate(2),
  },
  {
    name: "Donald Tan",
    nric: "S9900001B",
    condition: "Lung Cancer",
    admissionDateTime: getDate(1),
  },
  {
    name: "Goofy Cheng",
    nric: "S9900001C",
    condition: "Broken Elbow",
    admissionDateTime: getDate(2),
  },
  {
    name: "Pooh Heng",
    nric: "S9900001D",
    condition: "Brain Disease",
    admissionDateTime: getDate(0),
  },
  {
    name: "Chip Mun",
    nric: "S9900001E",
    condition: "Nose Infection",
    admissionDateTime: getDate(0),
  },
  {
    name: "Dale Lam",
    nric: "S9900001F",
    condition: "Torn ACL",
    admissionDateTime: getDate(2),
  },
  {
    name: "Aladdin Syed",
    nric: "S9900001G",
    condition: "Groin Disease",
    admissionDateTime: getDate(1),
  },
  {
    name: "Jasmine Boey",
    nric: "S9900001H",
    condition: "Broken Wrist",
    admissionDateTime: getDate(2),
  },
  {
    name: "Jaffar Mohammed",
    nric: "S9900001I",
    condition: "Cataract",
    admissionDateTime: getDate(0),
  },
  {
    name: "Mario Lim",
    nric: "S9900001J",
    condition: "Piles",
    admissionDateTime: getDate(2),
  },
  {
    name: "Coco Lim",
    nric: "S9900001K",
    condition: "Conjunctivitis",
    admissionDateTime: getDate(1),
  },
  {
    name: "Tarzan Tan",
    nric: "S9900001L",
    condition: "Eye Sty",
    admissionDateTime: getDate(0),
  },
  {
    name: "Jane Cheng",
    nric: "S9900001M",
    condition: "Diarrhea",
    admissionDateTime: getDate(0),
  },
  {
    name: "Shrek Heng",
    nric: "S9900001N",
    condition: "Cold",
    admissionDateTime: getDate(2),
  },
  {
    name: "Genie Wang",
    nric: "S9900001O",
    condition: "Twisted Hip",
    admissionDateTime: getDate(1),
  },
  {
    name: "Buzz Light",
    nric: "S9900001P",
    condition: "Slipped Disc",
    admissionDateTime: getDate(2),
  },
  {
    name: "Woody Pecker",
    nric: "S9900001Q",
    condition: "Migraine",
    admissionDateTime: getDate(0),
  },
  {
    name: "BoPeep Shen",
    nric: "S9900001R",
    condition: "Headache",
    admissionDateTime: getDate(2),
  },
  {
    name: "Slingy Doug",
    nric: "S9900001S",
    condition: "Appendicitis",
    admissionDateTime: getDate(0),
  },
  {
    name: "Hamm Tang",
    nric: "S9900001T",
    condition: "Severe Obesity",
    admissionDateTime: getDate(0),
  },
];

const smartbeds = [
  { name: "smart bed 1", wardIndex: 0, roomNum: 1, bedNum: 1 },
  { name: "smart bed 2", wardIndex: 0, roomNum: 1, bedNum: 2 },
  { name: "smart bed 3", wardIndex: 0, roomNum: 1, bedNum: 3 },
  { name: "smart bed 4", wardIndex: 0, roomNum: 1, bedNum: 4 },
  { name: "smart bed 5", wardIndex: 0, roomNum: 1, bedNum: 5 },
  { name: "smart bed 6", wardIndex: 0, roomNum: 2, bedNum: 6 },
  { name: "smart bed 7", wardIndex: 0, roomNum: 2, bedNum: 7 },
  { name: "smart bed 8", wardIndex: 0, roomNum: 2, bedNum: 8 },
  { name: "smart bed 9", wardIndex: 0, roomNum: 2, bedNum: 9 },
  { name: "smart bed 10", wardIndex: 0, roomNum: 2, bedNum: 10 },
  { name: "smart bed 13", wardIndex: 1, roomNum: 1, bedNum: 1 },
  { name: "smart bed 14", wardIndex: 1, roomNum: 1, bedNum: 2 },
  { name: "smart bed 15", wardIndex: 1, roomNum: 1, bedNum: 3 },
  { name: "smart bed 16", wardIndex: 1, roomNum: 1, bedNum: 4 },
  { name: "smart bed 17", wardIndex: 1, roomNum: 1, bedNum: 5 },
  { name: "smart bed 18", wardIndex: 1, roomNum: 2, bedNum: 6 },
  { name: "smart bed 19", wardIndex: 1, roomNum: 2, bedNum: 7 },
  { name: "smart bed 20", wardIndex: 1, roomNum: 2, bedNum: 8 },
  { name: "smart bed 21", wardIndex: 1, roomNum: 2, bedNum: 9 },
  { name: "smart bed 22", wardIndex: 1, roomNum: 2, bedNum: 10 },
  { name: "smart bed 11", wardIndex: 0, roomNum: 3, bedNum: 11 },
  { name: "smart bed 12", wardIndex: 0, roomNum: 3, bedNum: 12 },
  { name: "smart bed 23", wardIndex: 1, roomNum: 3, bedNum: 11 },
  { name: "smart bed 24", wardIndex: 1, roomNum: 3, bedNum: 12 },
  { name: "smart bed 25", wardIndex: 1, roomNum: 3, bedNum: 13 },

];

const smartWearables = [
  { name: "Smart Wearable 1", serialNumber: "ABC-123A" },
  { name: "Smart Wearable 2", serialNumber: "ABC-123B" },
  { name: "Smart Wearable 3", serialNumber: "ABC-123C" },
  { name: "Smart Wearable 4", serialNumber: "ABC-123D" },
  { name: "Smart Wearable 5", serialNumber: "ABC-123E" },
  { name: "Smart Wearable 6", serialNumber: "ABC-123F" },
  { name: "Smart Wearable 7", serialNumber: "ABC-123G" },
  { name: "Smart Wearable 8", serialNumber: "ABC-123H" },
  { name: "Smart Wearable 9", serialNumber: "ABC-123I" },
  { name: "Smart Wearable 10", serialNumber: "ABC-123J" },
  { name: "Smart Wearable 11", serialNumber: "ABC-123K" },
  { name: "Smart Wearable 12", serialNumber: "ABC-123L" },
  { name: "Smart Wearable 13", serialNumber: "ABC-123M" },
  { name: "Smart Wearable 14", serialNumber: "ABC-123N" },
  { name: "Smart Wearable 15", serialNumber: "ABC-123O" },
  { name: "Smart Wearable 16", serialNumber: "ABC-123P" },
  { name: "Smart Wearable 17", serialNumber: "ABC-123Q" },
  { name: "Smart Wearable 18", serialNumber: "ABC-123R" },
  { name: "Smart Wearable 19", serialNumber: "ABC-123S" },
  { name: "Smart Wearable 20", serialNumber: "ABC-123T" },
  { name: "Smart Wearable 21", serialNumber: "ABC-123U" },
  { name: "Smart Wearable 22", serialNumber: "ABC-123V" },
  { name: "Smart Wearable 23", serialNumber: "ABC-123W" },
  { name: "Smart Wearable 24", serialNumber: "ABC-123X" },
];

module.exports = {
  wards,
  nurses,
  patients,
  smartbeds,
  smartWearables,
};
