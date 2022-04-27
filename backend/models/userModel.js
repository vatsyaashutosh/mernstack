const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const userSchema = new mongoose.Schema({
  role: {
    type: String,
    default: "user",
  },
  name: {
    type: String,
    required: [true, "Please Enter your name"],
    maxlength: [30, "Name cannot exceed 30 characters"],
    minlength: [2, "Name should have more than 2 characters"],
  },
  email: {
    type: String,
    required: [true, "Pleas Enter your email"],
    unique: true,
    validate: [validator.isEmail, "Please Enter a valid Email"],
  },
  password: {
    type: String,
    select: false,
    required: [true, "Please Enter your password"],
    minlength: [8, "Password must be more than 8 characters"],
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) next();
  this.password = await bcrypt.hash(this.password, 10);
});

//JWT TOKEN

userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

//COMPARE PASSWORD

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//Generating password Reset Token
userSchema.methods.getResetPasswordToken = function () {
  //Generating Token
  const resetToken = crypto.randomBytes(20).toString("hex");
  //Hashing and adding resetPasswordToken to userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

module.exports = new mongoose.model("User", userSchema);
