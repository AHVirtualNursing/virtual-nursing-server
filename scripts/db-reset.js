db = connect("mongodb://127.0.0.1:27017/dev");

db.wards.insertMany([
  {
    wardNum: 12,
    wardType: "B1",
    numRooms: 6,
    smartBeds: [],
    nurses: []
  },
]);

db.smartbeds.insertMany([
  {
    bedNum: 103,
    roomNum: 1,
    bedStatus: "occupied",
    railStatus: false,
    ward: wardObject,
    patient: patientObj,
    nurses: []
  },
]);

db.nurses.insertMany([
  {
    name: "Rose",
    nurseStatus: "head",
    username: "nurserose",
    email: "nurserose@gmail.com",
    password: "password",
    ward: "",
  },
  {
    username: "virtualnurse2",
    email: "virtualnurse2@gmail.com",
    password: "password",
  },
]);

db.virtual_nurses.insertMany([
  {
    username: "virtualnurse1",
    email: "virtualnurse1@gmail.com",
    password: "password",
  },
  {
    username: "virtualnurse2",
    email: "virtualnurse2@gmail.com",
    password: "password",
  },
]);

db.it_admins.insertMany([
  {
    username: "itadmin1",
    email: "itadmin1@gmail.com",
    password: "password",
  },
  {
    username: "itadmin2",
    email: "itadmin2@gmail.com",
    password: "password",
  },
]);
