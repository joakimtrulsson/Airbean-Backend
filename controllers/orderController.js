const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const { Product, Order, User } = require('../models');
const { catchAsync, AppError, calculateNewEta, apiFeatures } = require('../utils');
const factory = require('./handlerFactory');

let newOrderDb;

exports.getCheckoutSession = async (req, res, next) => {
  const validProducts = await Product.find({
    _id: {
      $in: req.body,
    },
  });

  newOrderDb = validProducts.map((product, i) => {
    return {
      _id: product._id,
      title: product.title,
      price: product.price,
      quantity: req.body[i].quantity,
      totalProductPrice: product.price * req.body[i].quantity,
    };
  });

  const stripeOrderData = validProducts.map((product, i) => {
    return {
      price_data: {
        currency: 'sek',
        unit_amount: product.price * 100,
        product_data: {
          name: `${product.title}`,
          description: product.desc,
          images: [
            'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/A_small_cup_of_coffee.JPG/500px-A_small_cup_of_coffee.JPG',
          ],
        },
      },
      quantity: req.body[i].quantity,
    };
  });

  const session = await stripe.checkout.sessions.create({
    line_items: stripeOrderData,
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/#/status?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: 'http://aftonbladet.se',
    cancel_url: `${req.protocol}://${'host'}/#/error`,
    customer_email: req.user.email,
  });

  res.status(200).json({
    status: 'success',
    session,
  });
};

exports.webhookCheckout = async (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.sendStatus(400).end();
  }

  if (event.type === 'checkout.session.completed') {
    console.log(event);
    await createOrderCheckout(event);
  }

  res.status(200).end();
};

const createOrderCheckout = async (session) => {
  const user = await User.findOne({ email: session.data.object.customer_email });
  await Order.create({ user: user._id, paymentId: session.data.object.id, products: newOrderDb });
};

exports.getOrderHistory = async (req, res, next) => {
  const allDocs = await Order.find({ user: req.user._id });

  res.status(200).json({
    status: 'success',
    results: allDocs.length,
    data: {
      allDocs,
    },
  });
};

exports.getOrderStatus = catchAsync(async (req, res, next) => {
  const order = await Order.find({ paymentId: req.params.id });
  if (!order) {
    return next(new AppError('No order found with that ID.', 404));
  }

  const newEta = calculateNewEta(order[0].createdAt, order[0].eta);
  res.status(200).json({
    status: 'success',
    data: {
      orderId: order[0]._id,
      eta: newEta,
    },
  });
});

exports.getSalesDetails = catchAsync(async (req, res, next) => {
  const monthly = await Order.aggregate([
    {
      $group: {
        _id: { $month: '$createdAt' },
        monthTotal: {
          $sum: '$totalPrice',
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const total = await Order.aggregate([
    {
      $group: {
        _id: null,
        total: {
          $sum: '$totalPrice',
        },
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: [{ totalIncome: total }, { monthlyIncome: monthly }],
  });
});

exports.getMostSold = catchAsync(async (req, res, next) => {
  const stats = await Order.aggregate([
    {
      $unwind: {
        path: '$products',
      },
    },
    {
      $group: {
        _id: '$products._id',
        title: {
          $first: '$products.title',
        },
        totalSold: {
          $sum: '$products.quantity',
        },
      },
    },
    {
      $sort: {
        totalSold: -1,
      },
    },
    {
      $limit: 3,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getOrder = factory.getOne(Order);
exports.getAllOrders = factory.getAll(Order);
exports.updateOrder = factory.updateOne(Order);
exports.deleteOrder = factory.deleteOne(Order);
