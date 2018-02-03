const challenge = require('../services/challenge');

module.exports = function(app) {
  app.post('/slack/challenge', async function (req, res) {
    const result = await challenge(req.body);

    res.send(result.response);
  });
};
