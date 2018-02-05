const mongoose = require('mongoose');

mongoose.connect(`mongodb://db:27017/ef_slack_app_${process.env.NODE_ENV}`);

module.exports = mongoose;
