const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/user.model');

const {
  transporter, 
  getPasswordResetURL, 
  resetPasswordTemplate, 
  createTokenFromHash
} = require('../helpers/emailFunctions')


const emailURL = process.env.NODE_ENV === 'production' ? 'https://zephyr-analytics.com' : 'http://localhost:3000';


router.post('/user/:email', async (req, res) => {
    const {email} = req.params;
    let user;
    try {
      user = await User.findOne({email}).exec();
      const token = createTokenFromHash(user);
      const url = getPasswordResetURL(user, token);
      const emailTemplate = resetPasswordTemplate(user, url);
      const sendEmail = () => {
        transporter.sendMail(emailTemplate, (err, info) => {
          if (err) {
            res.status(500).json(`Error sending email: ${err.message}`);
          } else {
            res.status(200).json(`Email sent successfully: ${info.response}`);
          }
        });
      };
      sendEmail();
    } catch (error) {
      res.status(403).send('No user with this email');
    }
});

router.post('/activate', async (req, res) => {
    try {
      const { email } = req.body;
      console.log(email);
      const user = await User.findOne({ email });
      if (user) {
        const token = user.generateVerificationToken();
  
        // Save the verification token
        await token.save();
  
        const subject = 'Account Verification Token';
        const to = user.email;
        const from = process.env.ELOG;
        const link = `${emailURL}/activate/${to}/${token.token}`;
        const html = `<p>Hi ${user.username || user.email }</p><br><p>Please click on the following <a href="${link}">link</a> to verify your account.</p><br><p>If you did not request this, please ignore this email.</p>`;
  
        const info = await transporter.sendMail({
          to, from, subject, html,
        });
  
  
        res.status(200).json({ message: `A verification email has been sent to ${user.email}.` });
      } else {
        res.status(404).json({ error: 'There is no account registered with that email address. Contact Zephyr Analytics at support@zephyr-analytics.com for assistance.' });
      }
    } catch (error) {
      console.log(error);
      res.status(404).json(error);
    }
});
router.post('/receive_new_password/:userId/:token', (req, res) => {
    const { userId, token } = req.params;
    const { password } = req.body;
  
    User.findOne({ _id: userId })
      .then((user) => {
        console.log('setting new password');
        const secret = `${user.password}-${user.createdAt}`;
        const payload = jwt.decode(token, secret);
        if (payload.id === user.id) {
          bcrypt.genSalt(10, (salterror, salt) => {
            if (salterror) {
              return;
            } else {
              bcrypt.hash(password, salt, (hasherror, hash) => {
              if (hasherror) {
                console.log(hasherror);
                return;
              } else {
                User.findOneAndUpdate(
                  { _id: userId },
                  { password: hash },
                  { new: true },
                )
                  .then(() => {
                    console.log('new password set')
                    res.status(202).json('Password Change Accepted');
                  })
                  .catch((err) => res.status(500).json(err));
              }
              });
            }
          });
        }
      })
      .catch(() => {
        res.status(404).json('Invalid user');
      });
});

module.exports = router;