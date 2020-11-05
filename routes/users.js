var express = require("express");
const User = require("../models").User;
const userCtrl = require("../controllers/user");
var router = express.Router();

router.post("/", userCtrl.create);
router.post("/login", userCtrl.login);
router.post("/refresh_token", userCtrl.refreshToken);
router.post("/logout", userCtrl.logOut);
router.post("/follow/:userId", userCtrl.manageFollow);

module.exports = router;
