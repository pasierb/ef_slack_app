const Teamup = require('./Teamup');
const jobs = {};
const {
  list,
  attributes,
  create,
  cancel,
  update,
  destroy,
  scheduled,
} = require('./triggers');

const TRIGGERS = {
  'with': attributes,
  create,
  cancel,
  scheduled,
  'remove': destroy,
  update,
  list,
};

Teamup.find().then((teamups) => {
  teamups.forEach((tu) => {
    jobs[tu.name] = tu.schedule();
  });
});

module.exports = function (data) {
  const chunks = [];

  data.text.split(/\s+/).forEach((token) => {
    if (TRIGGERS[token.toLowerCase()]) {
      chunks.push({ trigger: token.toLowerCase(), values: [] });
    } else {
      chunks[chunks.length - 1].values.push(token)
    }
  });

  const attrs = chunks.reduce((acc, chunk) => {
    return Object.assign({}, acc, TRIGGERS[chunk.trigger](chunk.values));
  }, {
    channelId: data['channel_id'],
    jobs: jobs
  });

  return attrs.action(attrs);
};
