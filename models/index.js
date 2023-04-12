const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const models = {};

models.mongoose = mongoose;

models.User = require('./userModel');
models.Order = require('./orderModel');
models.Product = require('./productModel');
models.Review = require('./reviewModel');

module.exports = models;
