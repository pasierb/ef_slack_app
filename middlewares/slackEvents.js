const createSlackEventAdapter = require('@slack/events-api').createSlackEventAdapter;
const slackEvents = createSlackEventAdapter(process.env.SLACK_VERIFICATION_TOKEN);

slackEvents.on('error', console.error);

module.exports = function (app, { route }) {
  app.use(route, slackEvents.expressMiddleware());
};
