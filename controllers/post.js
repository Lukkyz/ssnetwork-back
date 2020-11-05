const Post = require("../models").Post;
const User = require("../models").User;
const postUserLike = require("../models").postUserLike;
const Follow = require("../models").Follow;
const userHlpr = require("../helpers/user");
const { Op } = require("sequelize");
exports.create = async (req, res) => {
  try {
    const result = await Post.sequelize.transaction(async (t) => {
      const { body, userId } = req.body;
      let newPost = await Post.create(
        {
          body: body,
          userId: userId,
        },
        { transaction: t }
      );
      return newPost;
    });
    res.status(201).json(result);
  } catch (e) {
    res.status(500).json(e);
  }
};

exports.getAll = async (req, res) => {
  try {
    const posts = await Post.sequelize.transaction(async (t) => {
      let userId = userHlpr.getUserToken(req);
      let followed = await Follow.findAll({
        where: {
          followerId: userId,
        },
        attributes: ["followedId"],
      });
      let arrUserId = followed.map((id) => id.dataValues.followedId);
      console.log(arrUserId);
      let posts = await Post.findAll({
        where: { userId: { [Op.in]: [...arrUserId, userId] } },
        include: ["user"],
      });
      return posts;
    });
    console.log(posts);
    res.status(200).json(posts);
  } catch (e) {
    res.status(500).json(e);
  }
};

exports.delete = async (req, res) => {
  try {
    const result = await Post.sequelize.transaction(async (t) => {
      const postId = req.params.id;
      let post = await Post.findOne(
        {
          where: {
            id: postId,
          },
        },
        { transaction: t }
      );
      await post.destroy();
    });
    res.status(204).json({ msg: "Post deleted" });
  } catch (e) {
    res.status(500).json(e);
  }
};

exports.manageLike = async (req, res, next) => {
  try {
    const result = await Post.sequelize.transaction(async (t) => {
      Post.findOne({
        where: {
          id: req.params.id,
        },
      }).then((post) => {
        switch (req.body.like) {
          case 1:
            postLike
              .create({
                isLiked: 1,
                postId: req.params.id,
                userId: req.body.userId,
              })
              .then(() => {
                post.score += 1;
                post.save();
                res
                  .status(200)
                  .json({ message: "Post liké !" })
                  .catch((err) => res.status(500).json({ err }));
              });
            break;
          case -1:
            postLike
              .findOne({
                where: {
                  postId: req.params.id,
                  userId: req.body.userId,
                },
              })
              .then((postLike) => {
                postLike
                  .destroy()
                  .then(() =>
                    res.status(200).json({ message: "Action annulé" })
                  );
              })
              .catch((err) => res.status(500).json({ err }));
            break;
        }
      });
    });
  } catch (e) {}
};
