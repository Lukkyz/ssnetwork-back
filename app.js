var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const i18n = require("i18n");
require("dotenv").config();

var usersRouter = require("./routes/users");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

i18n.configure({
  directory: path.join(__dirname, "locales"),
  defaultLocale: "en",
});
app.use(i18n.init);

app.use("/users", usersRouter);

module.exports = app;
