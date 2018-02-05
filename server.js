'use strict';

require('dotenv').config();

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const routes = require('./routes');
const middlewares = require('./middlewares');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

middlewares.forEach(midlleware => midlleware(app));
routes.forEach(route => route(app));

app.listen(3000, '0.0.0.0', () => {
  console.log('Server listening on port 3000...');
});
