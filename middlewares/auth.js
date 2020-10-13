const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const tkn = req.headers["authorization"].split(" ")[1];
    const decodedTkn = jwt.verify(tkn, process.env.JWT_ACCESS);
    const userId = decodedTkn.userId;
    if (!userId) {
      throw "Invalid user";
    } else {
      next();
    }
  } catch (e) {
    res.status(401).json({
      error: "Unauthorized",
    });
  }
};
