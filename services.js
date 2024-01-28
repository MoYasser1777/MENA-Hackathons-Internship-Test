const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

const transporter = nodemailer.createTransport(
  smtpTransport({
    service: "gmail",
    auth: {
      user: "mohammadyasser646@gmail.com", 
      pass: "rpnnsdgycyvnyacr", 
    },
  })
);

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetLink = `http://localhost:3000/reset/${resetToken}`;
  const mailOptions = {
    from: "mohammadyasser646@gmail.com",
    to: email,
    subject: "Password Reset",
    text: `Click the following link to reset your password: ${resetLink}`,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        reject(error);
      } else {
        console.log("Email sent: " + info.response);
        resolve(info);
      }
    });
  });
};

module.exports = {
  sendPasswordResetEmail,
};
