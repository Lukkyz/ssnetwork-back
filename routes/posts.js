var express = require("express");
var router = express.Router();
const postCtrl = require("../controllers/post");

router.post("/", postCtrl.create);
router.delete("/:id", postCtrl.delete);

module.exports = router;
