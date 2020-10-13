const User = require("../models").User;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.create = (req, res) => {
  const { username, bio, email, password } = req.body;
  User.create({
    username,
    bio,
    email,
    password,
  })
    .then((user) => res.status(201).json(user))
    .catch((err) => res.status(500).json(err));
};

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { email: req.body.email },
    });
    if (!user || !req.body.password) {
      res.status(401).json({ error: "Something went wrong" });
    } else {
      const validPass = bcrypt.compare(req.body.password, user.password);
      if (!validPass) {
        res.status(401).json({ error: "Incorrect password" });
      } else {
        // Create and send http cookie with refresh token
        const refreshTkn = jwt.sign(
          {
            userId: user.id,
          },
          process.env.JWT_REFRESH,
          {
            expiresIn: "7d",
          }
        );
        res.cookie("refreshtoken", refreshTkn, {
          httpOnly: true,
          path: "users/refresh_token",
        });

        // Create and send access token
        const accessTkn = jwt.sign(
          { userId: user.id },
          process.env.JWT_ACCESS,
          {
            expiresIn: "15m",
          }
        );
        res.status(200).json({
          userId: user.id,
          username: user.username,
          token: accessTkn,
        });
      }
    }
  } catch {
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshtoken;
    if (!token) return res.send({ token: "" });
    const payload = jwt.verify(token, process.env.JWT_REFRESH);
    const user = await User.findOne({
      where: {
        id: payload.userId,
      },
    });
    if (user) {
      const newAccessTkn = jwt.sign(
        { userId: user.id },
        process.env.JWT_ACCESS,
        { expiresIn: "15m" }
      );
      res.status(200).json({
        userId: user.id,
        username: user.username,
        token: newAccessTkn,
      });
      console.log("OK");
    }
  } catch (e) {
    res.status(500).json(e);
  }
};

exports.logOut = (req, res) => {
  try {
    res.clearCookie("refreshtoken", { path: "users/refresh_token" });
    res.status(200);
  } catch {
    res.status(500);
  }
};
