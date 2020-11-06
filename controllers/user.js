const User = require("../models").User;
const Post = require("../models").Post;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Follow = require("../models").Follow;
const userHlpr = require("../helpers/user");

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

// Return user with followers and followeds
exports.getFollow = async (req, res) => {
  try {
    const result = await User.sequelize.transaction(async (t) => {
      const user = await User.findOne({
        where: { email: req.body.email },
        include: [
          { model: Follow, as: "followers", foreignKey: "followedId" },
          { model: Follow, as: "followeds", foreignKey: "followerId" },
        ],
      });
      return user;
    });
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json(e);
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { email: req.body.email },
      include: [
        { model: Follow, as: "followers", foreignKey: "followedId" },
        { model: Follow, as: "followeds", foreignKey: "followerId" },
      ],
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
          avatarUrl: user.avatarUrl,
        });
      }
    }
  } catch {
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Check refreshToken in cookie, if is valid send a new accessToken
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshtoken;
    if (!token) throw new Error("No token");
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
        avatarUrl: user.avatarUrl,
      });
    }
  } catch (e) {
    res.status(500).json(e);
  }
};

exports.changeAvatar = async (req, res) => {
  try {
    let userId = await userHlpr.getUserToken(req);
    const user = await User.findOne({
      where: {
        id: userId,
      },
    });
    const file = `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`;
    if (user) {
      user.update({ avatarUrl: file });
    }

    res.status(200).json(file);
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

// /follow/:id_user if action in body = 1 : Follow, else Unfollow
exports.manageFollow = async (req, res, next) => {
  try {
    const result = await User.sequelize.transaction(async (t) => {
      let user = await User.findOne(
        {
          where: {
            id: req.params.userId,
          },
        },
        { transaction: t }
      );
      if (user) {
        const userId = userHlpr.getUserToken(req);
        switch (req.body.action) {
          case 1:
            try {
              const follow = await Follow.create(
                {
                  followerId: userId,
                  followedId: parseInt(req.params.userId),
                },
                { transaction: t }
              );

              console.log(follow);
              res.status(200).json({ msg: "ok" });
            } catch (e) {
              res.status(500).json(e);
            }
            break;
          case -1:
            Follow.findOne({
              where: {
                follower: userId,
                followed: req.params.userId,
              },
            })
              .then((follow) => {
                follow
                  .destroy()
                  .then(() =>
                    res.status(200).json({ message: "User unfollowed" })
                  );
              })
              .catch((err) => res.status(500).json({ err }));
            break;
        }
      }
    });
    return result;
  } catch (e) {
    res.status(500).json(e);
  }
};
