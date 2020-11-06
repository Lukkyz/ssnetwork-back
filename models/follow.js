"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Follow extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, {
        as: "followers",
        foreignKey: "followedId",
      });
      this.belongsTo(models.User, {
        as: "followeds",
        foreignKey: "followerId",
      });
    }
  }
  Follow.init(
    {
      followerId: DataTypes.INTEGER,
      followedId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Follow",
    }
  );
  Follow.sync().catch((err) => console.error(err));
  return Follow;
};
