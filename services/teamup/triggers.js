const Teamup = require('./Teamup');
const messages = require('./messages');
const sprintf = require('sprintf-js').sprintf;

module.exports.list = (values) => ({
  action: () => new Promise((resolve, reject) => {
    Teamup.find().then((tus) => {
      resolve({
        text: tus.length ? tus.map(tu => tu.toMarkdown()).join('\n') : messages.empty,
      })
    }).catch(reject);
  })
});

module.exports.create = (values) => ({
  name: values.join(' '),
  action: ({ name, cron, channelId, imageUrl, message, jobs }) => (new Promise((resolve, reject) => {
    Teamup.create({
      name,
      cron,
      channelId,
      imageUrl,
      message
    }).then(tu => {
      jobs[tu.name] = tu.schedule();

      resolve({
        model: tu,
        text: sprintf(messages.created, tu.name),
      });
    }).catch(reject);
  }))
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

      Teamup.findOneAndUpdate({ name }, attrs, { new: true }).then((tu) => {
        jobs[name] && jobs[name].cancel();
        jobs[name] = tu.schedule()

        resolve({ text: `*${tu.name}* updated` });
      }).catch(reject);
    })
  }
})

module.exports.cancel = (values) => ({
  name: values.join(' '),
  action: ({ name, jobs }) => (new Promise((resolve, reject) => {
    Teamup.findOne({ name }).then((tu) => {
      jobs[tu.name] && jobs[tu.name].cancel();

      resolve({ text: sprintf(messages.canceled, tu.name) });
    }).catch(reject);
  }))
});

module.exports.test = (values) => ({
  name: values.join(' '),
  action: ({ name }) => (new Promise((resolve, reject) => {
    Teamup.findOne({ name }).then(tu => tu.postMessage()).catch(reject);
  }))
})

module.exports.destroy = (values) => ({
  name: values.join(' '),
  action: ({ name, jobs }) => (new Promise((resolve, reject) => {
    Teamup.findOneAndRemove({ name: name }).then((tu) => {
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