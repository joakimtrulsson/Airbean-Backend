const multer = require('multer');
const sharp = require('sharp');
const { Order, User } = require('../models');
const { catchAsync, AppError } = require('../utils');
const factory = require('./handlerFactory');

// Sparar bilden i memory buffer. Då är bilden tillgänglig i req.file.buffer
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  // Kollar om det är en bild. Skickar true eller false till cb ovanför. Null = no error
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Please only upload a image.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // Tar ett tredje arg(option) i resize
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`../public_html/public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};

  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.createOrder = catchAsync(async (req, res, next) => {
  const newOrder = await Order.create({ userId: req.user._id, products: req.body });

  res.status(201).json({
    status: 'success',
    details: {
      order: newOrder,
    },
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // Fel om användaren försöker uppdatera lösenord.
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This route is not to update password.'), 400);
  }

  // Uppdatera User. Save() fungerar inte eftersom då krävs att password skickas med. new: true = skickar tillbaka den nya Usern.
  // body.role = "admin" ej tillåtet. filtreras bort.
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({ status: 'success', message: 'User deactivated.' });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined Please use signup instead.',
  });
};

exports.getUser = factory.getOne(User, { path: 'reviews' });
exports.getAllUsers = factory.getAll(User, { path: 'reviews' });
exports.deleteUser = factory.deleteOne(User);
// Inte för uppdatering av lösenord!
exports.updateUser = factory.updateOne(User);
