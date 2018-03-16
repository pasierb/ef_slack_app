const service = require('../services/teamup');
const request = require('request');

module.exports = function(app) {
  app.post('/slack/teamup', (req, res) => {
    service(req.body).then(result => {
      res.json(result)
    }).catch(err => {
      res.json(err);
    });
  });
};
