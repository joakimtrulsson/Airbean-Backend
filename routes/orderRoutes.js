const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const orderController = require('../controllers/orderController');

router.use(authController.protect);

router.post('/checkout-session/', orderController.getCheckoutSession);

router.get('/order-history', orderController.getOrderHistory);
router.get('/orderstatus/:id', orderController.getOrderStatus);

router.use(authController.restrictTo('admin'));

router.route('/total-income').get(orderController.getSalesDetails);
router.route('/most-sold-products').get(orderController.getMostSold);

router.route('/').get(orderController.getAllOrders);

router
  .route('/:id')
  .get(orderController.getOrder)
  .patch(orderController.updateOrder)
  .delete(orderController.deleteOrder);

module.exports = router;
