var express = require('express');
var router = express.Router();
var reserveDao = require('../dao/reserveDao');
/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('respond with a resource');
});
router.get("/list", function(req, res, next) {
	reserveDao.getList(req, res, next)
});
router.get("/info", function(req, res, next) {
	reserveDao.getGroundInfoById(req, res, next)
});
router.get("/doreserve", function(req, res, next) {
	reserveDao.doreserve(req, res, next);
});
router.get("/myreserve", function(req, res, next) {
	reserveDao.getReserveList(req, res, next);
});
router.get("/cancel", function(req, res, next) {
	reserveDao.cancel(req, res, next);
});
module.exports = router;