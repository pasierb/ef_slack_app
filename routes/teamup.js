const service = require('../services/teamup');

module.exports = function(app) {
  app.post('/slack/teamup', (req, res) => {
    service(req.body).then(({ text }) => res.send({ text }));
  });
};
