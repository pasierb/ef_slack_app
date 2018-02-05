// const STORE = [];
const mongoose = require('../../config/mongoose');

const schema = new mongoose.Schema({
  name: 'string',
});

const Challenge = mongoose.model('Challenge', schema);

module.exports = Challenge;
