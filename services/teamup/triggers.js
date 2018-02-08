const Teamup = require('./Teamup');
const messages = require('./messages');
const sprintf = require('sprintf-js').sprintf;

module.exports.list = (values) => ({
  action: () => new Promise((resolve, reject) => {
    Teamup.find().then((tus) => (resolve({
      // text: tus.map(tu => sprintf('*%s* scheduled at `%s`', tu.name, tu.cron)).join('\n'),
      text: tus.map(tu => tu.toMarkdown()).join('\n'),
    }))).catch(reject);
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

module.exports.attributes = (values) => {
  const delimiters = [',', 'and'];
  const fieldsMap = {
    cron: 'cron',
    message: 'message',
    image: 'imageUrl'
  };
  const result = {};
  let key;
  let stack = [];

  values.forEach((value) => {
    const normalized = value.toLowerCase()

    if (fieldsMap[normalized]) {
      stack.length = 0;

      key = fieldsMap[normalized];
      return;
    }

    if (delimiters.indexOf(normalized) !== -1) {
      stack.push(value)
      return;
    }

    if (stack.length) {
      result[key] += ` ${stack.splice(0).join(' ')}`;
    }

    if (result[key]) {
      result[key] += ` ${value}`;
    } else {
      result[key] = value;
    }
  });

  return result;
};

module.exports.scheduled = (values) => ({ cron: values.join(' ') });

module.exports.update = (values) => ({
  name: values.join(' '),
  action: ({ name, cron, channelId, imageUrl, message }) => {
    return new Promise((resolve, reject) => {
      Teamup.updateOne({ name }, { cron, imageUrl, message }).then(tu => resolve({
        text: `*${tu.name}* updated`,
      })).catch(reject);
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
  }),
});