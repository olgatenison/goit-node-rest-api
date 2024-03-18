// ../controllers/auth.js

// for macking token
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();
const { SECRET_KEY, BASE_URL } = process.env;

import gravatar from "gravatar";
import fs from "fs/promises";
import path from "path";
import Jimp from "jimp";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";

import Joi from "joi";
import { User } from "../db/user.js";
import { ctrlWrapper } from "../helpers/ctrlWrapper.js";
import sendEmail from "../helpers/sendEmail.js";
import HttpError from "../helpers/HttpError.js";
import { verify } from "crypto";

// import { HttpError } from "../helpers/HttpError.js";

// const avatarsDir = path.join(_dirname, "../", "public", "avatars");

// Обработчик регистрации пользователя
const register = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email already is use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const verificationToken = nanoid();

  //   const compareResult = await bcrypt.compare(password, hashPassword );
  // беремо захешований пароль і його зберігаємо
  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${verificationToken}">Click verify email</a>`,
  };

  await sendEmail(verifyEmail);

  res.status(201).json(newUser);
};

// робимо розсилку на верифікацію пошти
const verifyEmail = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });

  if (!user) {
    throw HttpError(404, "User not found");
  }
  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: "",
  });

  res.json("Verification successful");
};

const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  try {
    const validationResult = emailSchema.validate(req.body);
    if (validationResult.error) {
      return res.status(400).json({ message: validationResult.error.message });
    }

    if (!user) {
      return res.status(401).json({ message: "Email not found" });
    }

    if (user.verify) {
      return res.status(401).json({ message: "Email already verify" });
    }

    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${verificationToken}">Click verify email</a>`,
    };

    await sendEmail(verifyEmail);

    res.json({
      message: "Verify email send success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  // перевіряємо мейл
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password invalid");
  }
  if (!user.verify) {
    throw HttpError(401, "Email not verify");
  }
  // перевіряємо пароль на співпадіння
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password invalid");
  }
  //   відправляємо з токеном
  const payload = {
    id: user._id,
  };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token });
  res.json({
    token,
  });

  //   it is possibe to decode token
  //   const decodeToken =jws.decode(token)
  //   how to check is token valid in authenticate.js
};

const getCurrent = async (req, res) => {
  const { email, name } = req.body;

  res.json({
    email,
    name,
  });
};

const logout = async (req, res) => {
  const { _id } = req.body;
  await User.findByIdAndUpdate(_id, { token: "" });

  res.json({
    message: "Logout success",
  });
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tmpUpload, originalname } = req.file;
  const filename = `${_id}_${originalname}`;
  const resultUpload = `./public/avatars/${filename}`;
  await fs.rename(tmpUpload, resultUpload);

  const img = await Jimp.read(resultUpload);

  await img.resize(250, 250).write(resultUpload);

  const avatarURL = path.join(resultUpload, filename);
  await User.findByIdAndUpdate(_id, { avatarURL });
  res.json({
    avatarURL,
  });
};

export default {
  register: ctrlWrapper(register),
  verifyEmail: ctrlWrapper(verifyEmail),
  resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateAvatar: ctrlWrapper(updateAvatar),
};
