const nurse = require("../models/nurse");
const virtualNurse = require("../models/virtualNurse");
const itAdmin = require("../models/itAdmin");

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
