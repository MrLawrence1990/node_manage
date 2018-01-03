var express = require('express');
var router = express.Router();
var manageDao = require("../dao/manageDao");
/* GET home page. */

router.get('/', function(req, res, next) {
	res.render('manage', {
		title: "锅炉新闻"
	});
});
router.get('/getcode', function(req, res, next) {
	manageDao.getCode(req,res,next);
});
router.get('/login', function(req, res, next) {
	manageDao.login(req,res,next);
});
module.exports = router;