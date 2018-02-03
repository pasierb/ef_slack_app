const slackEvents = require('./slackEvents');

module.exports = [
  (app) => { slackEvents(app, { route: '/slack/events' }) },
];
