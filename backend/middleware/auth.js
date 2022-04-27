const User = require("../models/userModel");

const jwt = require("jsonwebtoken");

exports.isAuthenticatedUser = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please Login to access this resourse",
      });
    }
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedData.id);
    next();
  } catch (error) {
    console.log(error);
  }
};

exports.authorizedRoles = (...roles) => {
  return (req, res, next) => {
    // console.log(req);
    if (!roles.includes(req.user.role)) {
      console.log(req.user.role);
      return res.status(403).json({
        status: false,
        message: `Role: ${req.user.role} is not allowed to access this resource`,
      });
    }
    next();
  };
};
