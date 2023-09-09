const { DVSUser, SDMSUser, MobileUser } = require('../models/user');

function getUserModel(userType) {
  let userModel = '';

  switch (userType) {
    case 'dvs':
      userModel = DVSUser;
      break;
    case 'sdms':
      userModel = SDMSUser;
      break;
    case 'mobile':
      userModel = MobileUser;
      break;
    case '':
      return Error;
  }

  return userModel;
}

module.exports = { getUserModel };
