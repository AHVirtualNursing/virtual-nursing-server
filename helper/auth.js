const nurse = require("../models/nurse");
const { virtualNurse, itAdmin } = require("../models/webUser");

function getUserModel(userType) {
  let userModel = "";

  switch (userType) {
    case "virtual-nurse":
      return virtualNurse;
    case "it-admin":
      return itAdmin;
    case "mobile":
      return nurse;
    case "":
      return Error;
  }

  return userModel;
}

module.exports = { getUserModel };
