const { catchAsync, AppError, apiFeatures } = require('../utils');

exports.getOne = (Model, populateStr) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateStr) query.populate(populateStr);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document with that ID found.'));
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.getAll = (Model, populateStr) =>
  catchAsync(async (req, res, next) => {
    let filter = {};

    // Om inget params med productId så hämta alla reviews.
    if (req.params.productId) filter = { product: req.params.productId };

    const features = new apiFeatures(Model.find(filter), req.query).filter().sort().limitFields().paginate();

    if (populateStr) features.query = features.query.populate(populateStr);

    const allDocs = await features.query;

    res.status(200).json({
      status: 'success',
      results: allDocs.length,
      data: {
        allDocs,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    console.log(req.body);
    const newDoc = await Model.create(req.body);

    res.status(201).json({ status: 'success', data: newDoc });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedDoc) {
      return next(new AppError('No Document found with that ID.', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        updatedDoc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const deletedDoc = await Model.findByIdAndDelete(req.params.id);

    if (!deletedDoc) {
      return next(new AppError('No document found with that id.', 404));
    }
    res.status(200).json({
      status: 'success',
      message: 'Document deleted',
    });
  });
