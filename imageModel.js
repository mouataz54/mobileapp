const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  path: {
    type: String,
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
