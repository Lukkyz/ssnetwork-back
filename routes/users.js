var express = require("express");
const User = require("../models").User;
const userCtrl = require("../controllers/user");
var router = express.Router();

/* GET users listing. */
router.post("/", userCtrl.create);
router.post("/login", userCtrl.login);

module.exports = router;
