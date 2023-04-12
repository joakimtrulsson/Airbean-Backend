const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    products: [
      {
        _id: {
          type: mongoose.Schema.ObjectId,
          ref: 'Product',
          required: [true, 'An order must belong to a product.'],
        },
        title: {
          type: String,
        },
        price: {
          type: Number,
          ref: 'Product',
          required: [true, 'A product must have a price.'],
        },
        quantity: {
          type: Number,
          required: [true, 'A product must have a quantity.'],
          min: 1,
          default: 1,
        },
        totalProductPrice: {
          type: Number,
          required: [true, 'A product must have a total price.'],
          min: 1,
        },
      },
    ],
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A order must have a User Id.'],
    },
    paymentId: {
      type: String,
      required: [true, 'A order must have a payment id.'],
    },
    eta: {
      type: Number,
      default: function () {
        return Math.floor(Math.random() * (25 - 5 + 1) + 5);
      },
    },
    totalPrice: {
      type: Number,
      default: 0,
      required: [true, 'A order must have a total price.'],
    },
    paid: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

orderSchema.pre('save', function (next) {
  this.totalPrice = this.products.map((product) => {
    this.totalPrice += product.totalProductPrice;
  });
  next();
});

orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'username',
  });

  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
