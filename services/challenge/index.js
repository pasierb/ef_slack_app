const sprintf = require('sprintf-js').sprintf;
const Challenge = require('./Challenge');

const ACTIONS = {
  list: async function({ attributes }) {
    const challenges = await Challenge.list();
    let text = MESSAGES['noActiveChallenges'];

    if (challenges.length > 0) {
      text = "";

      challenges.forEach((c) => {
        text += `${c.name}\n`;
      })
    }

    return { text };
  },
  create({ attributes }) {
    const challenge = new Challenge(attributes);

    return challenge.save();
  },
  unknown({ action }) {
    return Promise.resolve(sprintf(MESSAGES['unknownAction'], action));
  }
}

const MESSAGES = {
  unknownAction: 'Action "%s" does not exists.',
  noActiveChallenges: 'No active challenges',
};

function parseText(text) {
  const actionMatch = text.match(/^(\w+)/);
  const dataMatch = text.match(/\w+=(\w+|".+"|'.+')/g)
  const action = actionMatch && actionMatch[0];
  const attributes = {};

  if (dataMatch) {
    dataMatch.forEach((token) => {
      let [key, value] = token.split('=');

      try {
        attributes[key] = JSON.parse(value)
      } catch (e) {
        attributes[key] = value;
      }
    });
  }

  return {
    attributes,
    action,
  };
}

module.exports = async function (event, actions=ACTIONS) {
  const { action, attributes } = parseText(event.text);
  const response = await (actions[action] || actions['unknown'])({ attributes, action });

  return {
    action,
    attributes,
    response,
  };
}
