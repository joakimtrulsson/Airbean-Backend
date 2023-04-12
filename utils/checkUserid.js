const catchAsync = require('./catchAsync');
const AppError = require('./appError');
const { Review } = require('../models');

const checkUserId = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (req.user.id !== review.user.id) return next(new AppError('You are not allowed to do that', 401));
  next();
});

module.exports = checkUserId;
