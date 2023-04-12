const express = require('express');

const router = express.Router({ mergeParams: true });

const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const { checkUserId } = require('../utils');

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setProductUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(authController.protect, checkUserId, reviewController.updateReview)
  .delete(authController.protect, checkUserId, reviewController.deleteReview);

module.exports = router;
