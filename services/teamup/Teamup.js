const mongoose = require('../../config/mongoose');
const schedule = require('node-schedule');
const { WebClient } = require('@slack/client');
const slackClient = new WebClient(process.env.SLACK_TOKEN);

const schema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  imageUrl: { type: String },
  message: { type: String },
  cron: { type: String, required: true },
  channelId: { type: String, required: true },
});
const Teamup = mongoose.model('Teamup', schema);

Teamup.prototype.postMessage = function () {
  slackClient.chat.postMessage(this.channelId, (this.message || this.name), {
    attachments: [
      {
        'text': `*${this.name}*`,
        'image_url': this.imageUrl && this.imageUrl.replace(/(^<|>$)/g, ''),
      }
    ]
  });
};

Teamup.prototype.schedule = function () {
  return schedule.scheduleJob(this.cron, this.postMessage.bind(this));
};

Teamup.prototype.toMarkdown = function () {
  const self = this;
  let base = `*${this.name}* scheduled \`${this.cron}\``;
  const attributes = [
    'imageUrl',
    'message',
  ];

  base += attributes.filter(attr => (
    !!self[attr]
  )).map(attr => (
    ` ${attr} _${self[attr]}_`
  )).join('')
  
  return base
};

module.exports = Teamup;
