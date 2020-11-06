"use strict";
const i18n = require("i18n");
const bcrypt = require("bcryptjs");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Post, { as: "posts", foreignKey: "userId" });
      this.hasMany(models.Follow, {
        as: "followeds",
        onDelete: "cascade",
        foreignKey: "followerId",
      });
      this.hasMany(models.Follow, {
        as: "followers",
        onDelete: "cascade",
        foreignKey: "followedId",
      });
    }
  }
  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          is: {
            args: [/^[A-zÀ-ú0-9]{6,24}$/],
            msg: "Username is invalid",
          },
        },
      },
      email: {
        validate: {
          is: {
            args: [/^\w{3,}@\w{3,}\.\w{2,3}$/],
            msg: "Email is invalid",
          },
        },
        type: DataTypes.STRING,
        allowNull: false,
      },
      bio: { type: DataTypes.STRING, allowNull: true },
      password: {
        validate: {
          is: {
            args: [/^(?!.* )(?=.*\d)(?=.*[A-Z]).{8,24}$/],
            msg: "Password is invalid",
          },
        },
        type: DataTypes.STRING,
        allowNull: false,
      },
      avatarUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  User.beforeCreate(async (user) => {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  });
  User.sync().catch((err) => console.error(err));
  return User;
};
