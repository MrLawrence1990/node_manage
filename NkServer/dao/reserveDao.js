var $sql = require('./reserveMapper');
var http = require('http');
var Result = require("../entity/result")
var util = require("../util/util")
	// 使用连接池，提升性能
var pool = require("../util/pool");

module.exports = {
	getList: function(req, res, next) {
		pool.getConnection(function(err, connection) {
			connection.query($sql.getList, null, function(err, result) {
				res.json(new Result(200, result));
				connection.release();
			});
		});
	},
	doreserve: function(req, res, next) {
		const param = req.query || req.params;
		if(param.groundId == null || param.groundId == undefined) {
			res.json(new Result(101, null));
			return;
		}
		if(!param.phone || param.type == null || param.type == undefined || !param.date) {
			res.json(new Result(101, null));
			return;
		}

		var checkCall = function(result, response, connection) {
			if(result && result.length > 0) {
				response.json(new Result(105, null, '该场次已被预约'));
				connection.release();
			} else {
				let sessionid = req.headers["session"];
				let _storage = require("../util/redis");
				_storage.get(sessionid, function(rerr, rresult) {
					if(rerr) {
						response.json({
							msg: 'redis connect error'
						});
					} else {
						if(rresult) {
							connection.query($sql.reserve, [param.date, param.groundId, param.type, rresult.split(",")[1], param.phone], function(_err, _result) {
								util.response(_err, _result, response, connection, reserveCall)
							});
						} else {
							response.json({
								msg: '无权限的访问'
							});
						}
					}
				})
			}
		};

		var reserveCall = function(result, response, connection) {
			response.json(new Result(200, result, '预约成功'));
			var mailSender = require("../util/mail");
			var msg = '有用户预约了"'+param.groundId+'号场地"，预约时间 '+"param.date"+'，'+(param.type==0?'18:00-20:00':'20:00-22:00')+'，预约电话：'+param.phone;
			mailSender.send(msg);
			connection.release();
		};

		pool.getConnection(function(err, connection) {
			connection.query($sql.check, [param.groundId, param.type, param.date], function(err, result) {
				util.response(err, result, res, connection, checkCall)
			});
		});

	}
};