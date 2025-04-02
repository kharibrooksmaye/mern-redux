import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/user.model";
import {
  transporter,
  getPasswordResetURL,
  resetPasswordTemplate,
} from "../helpers/emailFunctions";
import tokenModel from "../models/token.model";
import { IUser } from "../models/types";

const emailURL =
  process.env.NODE_ENV === "production"
    ? "https://zephyr-analytics.com"
    : "http://localhost:3000";

const createTokenFromHash = ({
  password: passwordHash,
  _id: userId,
  createdAt,
}) => {
  const secret = `${passwordHash}-${createdAt}`;
  const token = jwt.sign({ userId }, secret, {
    expiresIn: 3600,
  });
  return token;
};

interface SendPasswordResetEmailRequestParams {
  email: string;
}

interface SendPasswordResetEmailResponse {
  status: (code: number) => {
    json: (body: string | object) => void;
    send: (body: string) => void;
  };
}

const sendPasswordResetEmail = async (
  req: { params: SendPasswordResetEmailRequestParams },
  res: SendPasswordResetEmailResponse
) => {
  const { email } = req.params;
  let user: IUser;
  try {
    user = await User.findOne({ email }).exec();
    const token = createTokenFromHash(user);
    const url = getPasswordResetURL(user, token);
    const emailTemplate = resetPasswordTemplate(user, url);

    const sendEmail = () => {
      try {
        const info = transporter.sendMail(emailTemplate);
        console.log("** Email sent ** ", info.response);
      } catch (error) {
        res.status(500).json({ message: "Error sending email", error });
      }
    };
    sendEmail();
  } catch (error) {
    res.status(403).send("No user with this email");
  }
};

interface ReceiveNewPasswordRequestParams {
  userId: string;
  token: string;
}

interface ReceiveNewPasswordRequestBody {
  password: string;
}

const receiveNewPassword = (
  req: {
    params: ReceiveNewPasswordRequestParams;
    body: ReceiveNewPasswordRequestBody;
  },
  res: {
    status: (code: number) => {
      json: (body: string | object) => void;
    };
  }
) => {
  const { userId, token } = req.params;
  const { password } = req.body;

  User.findOne({ _id: userId })
    .then((user) => {
      const secret = `${user.password}-${user.createdAt}`;
      const payload = jwt.verify(token, secret) as JwtPayload;
      if (payload.userId === user.id) {
        bcrypt.genSalt(10, (salterror, salt) => {
          if (salterror) return;
          bcrypt.hash(password, salt, (hasherror, hash) => {
            console.log(password, hash);
            if (hasherror) return;
            User.findOneAndUpdate(
              { _id: userId },
              { password: hash },
              { new: true }
            )
              .then(() => {
                res.status(202).json("Password Change Accepted");
              })
              .catch((err) => res.status(500).json(err));
          });
        });
      }
    })
    .catch(() => {
      res.status(404).json("Invalid user");
    });
};

interface SendVerificationEmailRequestBody {
  email: string;
}

interface SendVerificationEmailResponse {
  status: (code: number) => {
    json: (body: string | object) => void;
  };
}

const sendVerificationEmail = async (
  req: { body: SendVerificationEmailRequestBody },
  res: SendVerificationEmailResponse
) => {
  try {
    const { email } = req.body;
    console.log(email);
    const user = await User.findOne({ email });
    if (user) {
      console.log(user);
      const token = new tokenModel(user.generateVerificationToken());

      // Save the verification token
      await token.save();

      console.log(token.token);
      console.log(emailURL);
      const subject = "Account Verification Token";
      const to = user.email;
      const from = process.env.ELOG;
      const link = `${emailURL}/activate/${to}/${token.token}`;
      const html = `<p>Hi ${
        user.username || user.email
      }</p><br><p>Please click on the following <a href="${link}">link</a> to verify your account.</p><br><p>If you did not request this, please ignore this email.</p>`;

      const info = await transporter.sendMail({
        to,
        from,
        subject,
        html,
      });

      console.log(info);

      res.status(200).json({
        message: `A verification email has been sent to ${user.email}.`,
      });
    } else {
      res.status(404).json({
        error:
          "There is no account registered with that email address. Contact Zephyr Analytics at support@zephyr-analytics.com for assistance.",
      });
    }
  } catch (error) {
    console.log(error);
    console.log("goddamn");
    res.status(404).json(error);
  }
};

export { sendPasswordResetEmail, receiveNewPassword, sendVerificationEmail };
