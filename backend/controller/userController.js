const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
//Register a User;

exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: "this is a sample id",
        url: "profilepicUrl",
      },
    });

    sendToken(user, 201, res);
  } catch (error) {
    res.status(500).json(error);
  }
};
//login user

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //checking if user has given password and email both

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please Enter email and password",
      });
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid Email or Password",
      });
    }
    sendToken(user, 201, res);
  } catch (error) {
    res.status(500).json(error);
  }
};

//Logout user
exports.logout = async (req, res, next) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });
    res.status(200).json({
      success: true,
      message: "Logged Out",
    });
  } catch (error) {
    res.status(401).json(error);
  }
};

//resetPassword url

exports.forgetPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not Found",
      });
    }
    //Get Reset Password Token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetPasswordUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/password/reset/${resetToken}`;
    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If You have not requested this email then please ignore it.`;
    try {
      await sendEmail({
        email: user.email,
        subject: `Ecommerce password recovery`,
        message,
      });
      res.status(200).json({
        status: true,
        message: `Email sent to ${user.email} successfully`,
      });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: error.message, success: false });
    }
  } catch (error) {
    res.status(401).json(error);
  }
};

//Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    //creating token hash
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (req.body.password != req.body.confirmPassword) {
      return res
        .status(401)
        .json({ message: "Password does not match", status: false });
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    sendToken(user, 200, res);
  } catch (error) {
    res.status(400).json(error);
  }
};

//get User Details
exports.getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(401).json(error);
  }
};

//Update User Password

exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("+password");
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
    if (!isPasswordMatched) {
      return res
        .status(400)
        .json({ message: "Old password is incorrect", success: false });
    }
    if (req.body.newPassword !== req.body.confirmPassword) {
      return res
        .status(400)
        .json({ message: "Password does not match", success: false });
    }

    user.password = req.body.newPassword;
    await user.save();
    sendToken(user, 200, res);
  } catch (error) {
    res.status(401).json(error);
  }
};

//Update User Profile

exports.updateProfile = async (req, res, next) => {
  try {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
    };
    //  we will add cloudinary later
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
      new: true,
      runValdiators: true,
      useFindAndModify: false,
    });
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(401).json(error);
  }
};

//Get all users (admin)
exports.getAllUser = async (req, res, next) => {
  try {
    const users = await User.find();

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(401).json(error);
  }
};

//Get Single User (admin)
exports.getSingleUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(400).json({
        message: `User does not exist with id ${req.params.id}`,
        success: false,
      });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(401).json(error);
  }
};

//Update User Role --Admin
exports.updateUserRole = async (req, res, next) => {
  try {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    };

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
      new: true,
      runValdiators: true,
      useFindAndModify: false,
    });
    if (!user) {
      return res.status(400).json({
        message: `User does not exist with ID: ${req.params.id}`,
        success: false,
      });
    }
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(401).json(error);
  }
};

//Delete user --admin

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    //we will remove cloudinary later
    if (!user) {
      return res.status(400).json({
        message: `User does not exist with ID: ${req.params.id}`,
        success: false,
      });
    }

    await user.remove();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(401).json(error);
  }
};
