const sprintf = require('sprintf-js').sprintf;
const Teamup = require('./Teamup');

const MESSAGES = {
  created: 'Teamup "%s" (`%s`) created.',
  empty: 'No active teamups.',
};

const ACTIONS = {
  create: async function({ text }) {
    const [matched, action, name, code] = text.match(/^(\w+)\W+(.*)\W+(\w+)$/);
    const teamup = new Teamup({ name, code });

    await teamup.save();

    return {
      text: sprintf(MESSAGES.created, name, code)
    }
  },
  schedule() {},
  list: async function() {
    const teamups = await Teamup.find();
    const text = teamups.length > 0 ? teamups.map(t => `\`${t.code}\` ${t.name}`).join('\n') : MESSAGES.empty;

    return {
      text
    };
  },
  delete() {},
};

module.exports = function (data) {
  const action = data.text.match(/^\w+/)[0];

  return ACTIONS[action](data);
};
