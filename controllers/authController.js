const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const { User } = require('../models');
const { catchAsync, AppError } = require('../utils');

const Email = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.SECRET, { expiresIn: process.env.JWTEXPIRATION });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(Date.now() + process.env.TOKEN_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;

  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new AppError('Please provide username and password.', 400));
  }

  const user = await User.findOne({ username }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect username or password.', 401));
  }

  // Om är ok!
  createSendToken(user, 200, req, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + process.env.TOKEN_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
  res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.replace('Bearer', '').replace(' ', '');
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in.', 401));
  }

  // Validera token.
  const decoded = await promisify(jwt.verify)(token, process.env.SECRET);
  if (!decoded) console.log('fadsf');

  // Kolla om användaren fortfarande finns.
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError('The user belonging to the token does not longer exist.', 401));
  }
  // Kolla om användare bytat lösenord efter att token var utfärdat.
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User changed password. Please log in again.', 401));
  }

  req.user = freshUser;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with email.', 404));
  }

  // Generera reset token. ResetToken är inte krypterat men den som finns i databasen är krypterad.
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Skicka det till userns email
  try {
    const resetURL = `${req.protocol}://${req.get('host')}/#/userform?reset_token=${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    (user.createPasswordResetToken = undefined), (user.passwordResetExpires = undefined);
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Error with sending email.', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Hämta användaren baserat på token från params.
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // Om token inte har expired och användaren finns då set lösen.
  if (!user) {
    return next(new AppError('Token is invalid or has expired.', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // Hämta användare
  const user = await User.findById(req.user.id).select('+password');

  // Kolla om post lösenord är korrekt req.body.password
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // Om det är korrekt, uppdatera lösenordet User.findByIdAndUpdate()
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // Logga in användaren med nya token.
  createSendToken(user, 200, req, res);
});
