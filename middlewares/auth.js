const jwt = require("jsonwebtoken");
const Auth = require("../models/Auth");
require("dotenv").config();



const authenticateToken = function(req, res, next) {
  const accessToken = req.headers.authorization || req.cookies.accessToken;

  if (!accessToken) {
      res.status(401).json({ msg: "Access token not provided" });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN);
    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid access token" });
  }
};


module.exports = {
    authenticateToken
}