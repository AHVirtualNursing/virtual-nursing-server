const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    const saltRounds = 10;
    user.password = await bcrypt.hash(user.password, saltRounds);
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

const DVSUser = mongoose.model('DVSUser', userSchema, 'dvs_users');
const SDMSUser = mongoose.model('SDMSUser', userSchema, 'sdms_users');
const MobileUser = mongoose.model('MobileUser', userSchema, 'mobile_users');

module.exports = {
  DVSUser,
  SDMSUser,
  MobileUser,
};
