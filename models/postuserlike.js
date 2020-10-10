"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PostUserLike extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: "userId", as: "user" });
      this.belongsTo(models.Post, {
        foreignKey: "postId",
        as: "post",
      });
    }
  }
  PostUserLike.init(
    {
      like: { type: DataTypes.BOOLEAN, allowNull: false },
      postId: { type: DataTypes.INTEGER, allowNull: false },
      userId: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: "PostUserLike",
    }
  );
  PostUserLike.sync().catch((err) => console.error(err));
  return PostUserLike;
};
