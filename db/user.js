import { Schema, model } from "mongoose";
import { handleMongooseError } from "../helpers/handleMongooseError.js";
import Joi from "joi";

export const emailRegaxp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

export const subscriptionEnum = ["starter", "pro", "business"];

export const userSchema = new Schema(
  {
    password: {
      type: String,
      minlenght: 6,
      required: [true, "Password is required"],
    },
    email: {
      type: String,
      match: emailRegaxp,
      required: [true, "Email is required"],

      // щоб не повторялося
      unique: true,
    },
    subscription: {
      type: String,
      enum: subscriptionEnum,
      default: "starter",
    },
    token: {
      type: String,
      default: null,
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.post("save", handleMongooseError);

export const registerSchema = Joi.object({
  email: Joi.string().pattern(emailRegaxp).required(),
  password: Joi.string().min(6).required(),
  subscription: Joi.string().valid(...subscriptionEnum),
});

export const loginSchema = Joi.object({
  email: Joi.string().email(emailRegaxp).required(),
  password: Joi.string().min(6).required(),
});

export const User = model("user", userSchema);
