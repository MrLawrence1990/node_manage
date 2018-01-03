var $sql = require('./manageMapper');
var http = require('http');
var Result = require("../entity/result")
var util = require("../util/util")
	// 使用连接池，提升性能
var async = require("async");
var pool = require("../util/pool");
var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

function generateMixed(n) {
	var res = "";
	for(var i = 0; i < n; i++) {
		var id = Math.ceil(Math.random() * 35);
		res += chars[id];
	}
	return res;
}
module.exports = {
	getCode: function(req, res, next) {
		const param = req.query || req.params;
		if(!param.email) {
			res.json(new Result(101, null));
			return;
		}

		var getUser = function(callback) {
			pool.getConnection(function(err, connection) {
				if(err) {
					callback(err, null);
					res.json(new Result(106, null, "内部服务器错误"));
					return;
				}
				connection.query($sql.getAdminUser, [param.email], function(err, result) {
					connection.release();
					console.log(param.email);
					console.log(result);
					if(err) {
						callback(err, null)
						return;
					}
					if(result.length == 0) {
						res.json(new Result(101, "用户不是管理员"));
						return;
					} else {
						callback(null, result)
					}
				});
			});
		};

		var sendEmail = function(callback) {
			let _storage = require("../util/redis");
			_storage.get(param.email, function(err, result) {
				if(err) {
					res.json(new Result(110, null));
				} else {
					if(!result) {
						var code = generateMixed(4);
						var mailSender = require("../util/mail");
						mailSender.send({
							"fromText": "登录验证码",
							"from": "13291829199@163.com",
							"to": param.email,
							"subject": "登录验证码",
							//							"text": "",
							"html": "您的登录验证码是：" + code + " ，有效期2分钟"
						}, function(err, info) {
							if(err) {
								res.json(new Result(203, "验证码发送失败"));
							} else {
								_storage.set(param.email, code, 60 * 1.5, function(serr, sresult) {
									if(serr) {
										res.json(new Result(106, null, "内部服务器错误"));
										return;
									} else {
										res.json(new Result(200, "验证码发送成功"));
									}
								})
							}
						})
					} else {
						res.json(new Result(203, "验证码已发送"));
					}
				}
			})
		};

		async.series([getUser, sendEmail], function(err, result) {
			console.log(err)
		})
	},
	login: function(req, res, next) {
		const param = req.query || req.params;
		if(!param.email || !param.password || !param.code) {
			res.json(new Result(101, null));
			return;
		}
		var login = function(callback) {
			pool.getConnection(function(err, connection) {
				if(err) {
					callback(err, null);
					res.json(new Result(106, null, "内部服务器错误"));
					return;
				}
				connection.query($sql.login, [param.email, param.password], function(err, result) {
					connection.release();
					if(err) {
						callback(err, null)
						return;
					}
					if(result.length == 0) {
						res.json(new Result(106, null, "用户名或密码错误"));
						callback("用户名或密码错误", null);
						return;
					} else {
						callback(null, result)
					}
				});
			});
		};
		var checkCode = function(callback) {
			let _storage = require("../util/redis");
			_storage.get(param.email, function(err, result) {
				if(err) {
					res.json(new Result(110, err));
					callback(err, null)
				} else {
					if(!result || result.length == 0) {
						res.json(new Result(107, "错误的验证码"));
					} else {
						if(result == param.code) {
							_storage.set(req.sessionID, param.email, 60 * 60, function(err, result) {
								if(err) {
									res.json(new Result(105, null));
								} else {
									res.json(new Result(200, "登录成功"));
								}
							});
						} else {
							res.json(new Result(107, "错误的验证码"));
						}
					}
					callback(null, result)
				}
			})
		};
		async.series([login, checkCode], function(err, result) {
			console.log(err)
		})
	}
};