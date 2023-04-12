const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.log('Uncaught exception. Shutting down.');
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app');

const { DATABASE_USER, DATABASE_PASSWORD, DATABASE_SERVER, DATABASE_CONNECTION } = process.env;

const DB_URL = `${DATABASE_CONNECTION}${DATABASE_USER}:${DATABASE_PASSWORD}${DATABASE_SERVER}`;
mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection successful');
  })
  .catch((err) => {
    console.error('Connection error', err);
    process.exit();
  });

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled rejection. Shutting down.');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
