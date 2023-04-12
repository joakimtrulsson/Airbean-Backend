const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

// Skicka ett nytt email => new Email(user, url).sendWelcome .sendPasswordReset
module.exports = class Email {
  constructor(user, url) {
    (this.to = user.email),
      (this.firstName = user.name.split(' ')[0]),
      (this.url = url),
      (this.from = `${process.env.EMAIL_FROM}}`);
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST_DEV,
      port: process.env.EMAIL_PORT_DEV,
      secure: false,
      // logger: true,
      auth: { user: process.env.EMAIL_USERNAME_DEV, pass: process.env.EMAIL_PASSWORD_DEV },
    });
  }

  // Skickar mailet.
  async send(template, subject) {
    // Rendera html baserad på pug template. __dirname = nuvarande script som körs, utils.
    const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    // Definera emailOptions.
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }
  // Transport

  async sendWelcome() {
    // this  efter dom defineras på det akutella objektet.
    await this.send('welcome', 'Välkommen till AirBean!');
  }
  async sendPasswordReset() {
    // this  efter dom defineras på det akutella objektet.
    await this.send('passwordReset', 'Lösenordåterställning, giltigt i 10 minuter.');
  }
};
