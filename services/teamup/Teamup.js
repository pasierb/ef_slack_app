const mongoose = require('../../config/mongoose');

const schema = new mongoose.Schema({ name: 'string', code: 'string' })
const Teamup = mongoose.model('Teamup', schema);

module.exports = Teamup;
