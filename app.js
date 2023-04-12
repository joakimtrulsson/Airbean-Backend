const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const hpp = require('hpp');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const { AppError } = require('./utils');
const globalErrorHandler = require('./controllers/errorController');
const productRouter = require('./routes/productRoutes');
const userRouter = require('./routes/userRoutes');
const orderRouter = require('./routes/orderRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const orderController = require('./controllers/orderController');

const app = express();

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP. Please try again in a hour.',
});

app.enable('trust proxy');

// Globala Middleware

app.use(
  cors({
    origin: 'http://localhost:8001',
    credentials: true,
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(helmet());

app.use('/api', limiter);

app.post('/webhook-checkout', express.raw({ type: 'application/json' }), orderController.webhookCheckout);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

// Data sanitering mot NoSql injection.
app.use(mongoSanitize());

// Data sanitering mot XSS.
app.use(xss());

// Förhindrar param pollution.
app.use(
  hpp({
    whitelist: ['price', 'ratingsAverage', 'userId', 'createdAt', 'ratingsQuantity'],
  })
);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Routes
app.use('/api/product', productRouter);
app.use('/api/user', userRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/orders', orderRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
