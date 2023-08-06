const mongoose = require('mongoose');

const liveUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    gender: {
      type: String,
    },
  },
  { timestamps: true }
);

const LiveUser = mongoose.model('LiveUser', liveUserSchema);

module.exports = LiveUser;
