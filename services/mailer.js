const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify().then(() => {
  console.log('Mailer ready');
}).catch(err => {
  console.warn('Mailer verify failed:', err.message || err);
});

async function sendMail({ to, subject, html, text, from = process.env.EMAIL_FROM }) {
  const info = await transporter.sendMail({ from, to, subject, text, html });
  return info;
}

module.exports = { sendMail };
