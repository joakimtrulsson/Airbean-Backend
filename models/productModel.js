const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A product must have a title.'],
      unique: [true, 'A product must have a unique title.'],
    },
    desc: {
      type: String,
      required: [true, 'A product must have a description.'],
    },
    price: {
      type: Number,
      required: [true, 'A product must have a price.'],
      min: [1, 'Price must be above 1'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.0,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, id: false }
);

productSchema.index({ price: 1, ratingsAverage: -1 });

productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
