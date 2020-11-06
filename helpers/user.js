const jwt = require("jsonwebtoken");
const User = require("../models").User;

exports.getUserToken = async (req) => {
  const token = req.headers["authorization"].split(" ")[1];
  const decodedTkn = jwt.verify(token, process.env.JWT_ACCESS);
  const userId = decodedTkn.userId;
  return userId;
};
