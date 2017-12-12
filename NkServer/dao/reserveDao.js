var mysql = require('mysql');
var $conf = require('../conf/db');
var $util = require('../util/util');
var $sql = require('./reserveMapper');
var http = require('http');
var Result = require("../entity/result")
	// 使用连接池，提升性能
var pool = mysql.createPool($util.extend({}, $conf.mysql));

module.exports = {
	getList: function(req, res, next) {
		pool.getConnection(function(err, connection) {
			connection.query($sql.getList, null, function(err, result) {
				res.json(new Result(200, result));
				connection.release();
			});
		});
	},
	getGroundInfoById:function(req,res,next){
		const param = req.query || req.params;
		console.log("------------------------------------------------- ",param);
		if(param.groundId==null||param.groundId==undefined){
			res.json(new Result(101, null));
			return;
		}
		console.log("------------------------------------------------ sql");
		pool.getConnection(function(err, connection) {
			connection.query($sql.getGroundInfoById, [param.groundId], function(err, result) {
				res.json(new Result(200, result));
				connection.release();
			});
		});
	}
};