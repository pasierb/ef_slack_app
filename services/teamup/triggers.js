const Teamup = require('./Teamup');
const messages = require('./messages');
const sprintf = require('sprintf-js').sprintf;

module.exports.list = (values) => ({
  action: ({ channelId }) => new Promise((resolve, reject) => {
    Teamup.find({ channelId }, (err, tus) => {
      if (err) return reject(err);

      resolve({
        text: tus.length ? tus.map(tu => tu.toMarkdown()).join('\n') : messages.empty,
      });
    });
  })
});

module.exports.create = (values) => ({
  name: values.join(' '),
  action: ({ name, cron, channelId, imageUrl, message, jobs }) => new Promise((resolve, reject) => {
    Teamup.create({ name, cron, channelId, imageUrl, message }, (err, tu) => {
      if (err) return reject(err);

      jobs[tu.name] = tu.schedule();
      resolve({
        model: tu,
        text: sprintf(messages.created, tu.name),
      })
    });
  })
});

module.exports.attribute = (key) => {
  const delimiters = ['and', ',']

  return (values = []) => {
    const v = [...values];

    if (delimiters.indexOf(v[v.length -1]) !== -1) {
      v.pop();
    }

    return { [key]: v.join(' ') };
  };
}

module.exports.update = (values) => ({
  name: values.join(' '),
  action: ({ name, cron, channelId, imageUrl, message, jobs }) => {
    return new Promise((resolve, reject) => {
      const attrs = { cron, imageUrl, message };

      Object.keys(attrs).forEach(k => attrs[k] === undefined ? delete attrs[k] : null);

      Teamup.findOneAndUpdate({ name }, attrs, { new: true }, (err, tu) => {
        if (err) return reject(err);

        jobs[name] && jobs[name].cancel();
        jobs[name] = tu.schedule()

        resolve({ text: `*${tu.name}* updated` });
      })
    })
  }
})

module.exports.cancel = (values) => ({
  name: values.join(' '),
  action: ({ name, jobs }) => (new Promise((resolve, reject) => {
    Teamup.findOne({ name }, (err, tu) => {
      if (err) return reject(err);

      jobs[tu.name] && jobs[tu.name].cancel();

      resolve({ text: sprintf(messages.canceled, tu.name) });
    });
  }))
});

module.exports.test = (values) => ({
  name: values.join(' '),
  action: ({ name, channelId }) => (new Promise((resolve, reject) => {
    Teamup.findOne({ name }).then(tu => {
      console.log(tu);

      tu && tu.postMessage({
        'response_type': 'ephemeral',
      });

      resolve();
    });
  }))
})

module.exports.destroy = (values) => ({
  name: values.join(' '),
  action: ({ name, jobs }) => (new Promise((resolve, reject) => {
    Teamup.findOneAndRemove({ name: name }, (err, tu) => {
      if (err) return reject(err);

      jobs[tu.name] && jobs[tu.name].cancel();
      resolve({ text: 'delete' });
    });
  })),
});

module.exports.help = () => ({
  action: () => Promise.resolve({
    text: messages.help,
    attachments: [
      {
        'title': 'Crontab syntax help (https://crontab.guru/)',
        'title_link': 'https://crontab.guru/',
      }
    ]
  }),
});