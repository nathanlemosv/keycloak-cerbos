const path = require('path');
const gateway = require('express-gateway');

const dotenv = require('dotenv');
dotenv.config();

gateway()
  .load('./config')
  .run();
