var express = require('express');
var router = express.Router();
var userDao = require('../dao/userDao');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get("/addUser",function(req,res,next){

});
router.get("/getUser",function(req,res,next){
	userDao.getUser(req,res,next)
});
router.get("/regWechatUser",function(req,res,next){
	userDao.regWechatUser(req,res,next)
});
module.exports = router;
