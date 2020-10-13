const Post = require("../models").Post;
const User = require("../models/user");

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
