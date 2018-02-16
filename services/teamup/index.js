const Teamup = require('./Teamup');
const jobs = {};
const {
  help,
  list,
  attribute,
  create,
  cancel,
  update,
  destroy,
  test,
} = require('./triggers');

const TRIGGERS = {
  help,
  list,
  create,
  update,
  'remove': destroy,
  cancel,
  test,
  scheduled: attribute('cron'),
  message: attribute('message'),
  image: attribute('imageUrl'),
};

Teamup.find().then((teamups) => {
  teamups.forEach(tu => jobs[tu.name] = tu.schedule());
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
