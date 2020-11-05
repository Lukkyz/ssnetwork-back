const jwt = require("jsonwebtoken");
exports.getUserToken = (req) => {
  const token = req.headers["authorization"].split(" ")[1];
  const decodedTkn = jwt.verify(token, process.env.JWT_ACCESS);
  const userId = decodedTkn.userId;
  return userId;
};
