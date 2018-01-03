var $sql = require('./reserveMapper');
var http = require('http');
var Result = require("../entity/result")
var util = require("../util/util")
	// 使用连接池，提升性能
var pool = require("../util/pool");
Date.prototype.Format = function(fmt) { //author: meizz 
	var o = {
		"M+": this.getMonth() + 1, //月份 
		"d+": this.getDate(), //日 
		"h+": this.getHours(), //小时 
		"m+": this.getMinutes(), //分 
		"s+": this.getSeconds(), //秒 
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
		"S": this.getMilliseconds() //毫秒 
	};
	if(/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for(var k in o)
		if(new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
};
var getGroundName = function(index) {
	switch(index.toString()) {
		case "0":
			return "全场";
			break;
		case "1":
			return "1#半场";
			break;
		case "2":
			return "2#半场";
			break;
		default:
			break;
	}
};
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
						response.json(new Result(110, result));
					} else {
						if(rresult) {
							connection.query($sql.reserve, [param.date, param.groundId, param.type, rresult.split(",")[1], param.phone, new Date()], function(_err, _result) {
								util.response(_err, _result, response, connection, reserveCall)
							});
						} else {
							response.json(new Result(104, null));
						}
					}
				});
			}
		};

		var reserveCall = function(result, response, connection) {
			response.json(new Result(200, result, '预约成功'));
			var mailSender = require("../util/mail");
			var msg = '有用户预约了' + getGroundName(param.groundId) + '，预约时间 ' + param.date + '，' + (param.type == 0 ? '18:30-20:30' : '20:30-22:30') + '，用户联系电话：' + param.phone;
			connection.query('select email from admin', null, function(err, result) {
				var emails = [];
				if(err) {
					emails = ["tracy0953@qq.com"];
				}
				for(var i = 0; i < result.length; i++) {
					emails.push(result[i].email);
				}
				mailSender.send({
					"fromText": "预约通知",
					"from": "13291829199@163.com",
					"to": 'tracy0953@qq.com,1635089708@qq.com',
					"subject": "预约通知",
					//							"text": "",
					"html": msg
				}, function(err, info) {
					if(!err) {
						response.json(new Result(200, result, '预约成功'));
					}
				})
				connection.release();
			})

		};

		pool.getConnection(function(err, connection) {
			connection.query($sql.check, [param.groundId, param.type, param.date], function(err, result) {
				util.response(err, result, res, connection, checkCall)
			});
		});
	},
	getReserveList: function(req, res, next) {
		let sessionid = req.headers["session"];
		let _storage = require("../util/redis");
		_storage.get(sessionid, function(rerr, rresult) {
			if(rerr) {
				res.json(new Result(104, null));
			} else {
				if(rresult) {
					pool.getConnection(function(err, connection) {
						connection.query($sql.list, [rresult.split(",")[1]], function(_err, _result) {
							util.response(_err, _result, res, connection, succCall);
						});
					});
				} else {
					res.json(new Result(104, null));
				}
			}
		});
		var getReserveStatus = function(status, date, time, _class) {
			if(status) {
				return _class ? "cancel" : "已取消";
			}
			var now = new Date();
			var reTime = new Date(date + " " + time);
			var scale = reTime.getTime() - now.getTime();
			if(scale > (60 * 1000 * 60 * 3)) {
				//大于两小时
				return _class ? "before" : "未开始";
			} else if((scale < (2 * 60 * 60 * 1000)) && (scale > (-2 * 60 * 60 * 1000))) {
				return _class ? "ing" : "进行中";
			} else {
				return _class ? "done" : "已结束";
			}
		};
		var succCall = function(result, response, connection) {
			var r = [];
			console.log(result)
			for(var i = 0; i < result.length; i++) {
				r[i] = {
					id: result[i].id,
					time: (result[i].reserve_date + " " + (result[i].ground_type == 0 ? '18:30-20:30' : '20:30-22:30')),
					ground: getGroundName(result[i].ground_id),
					createTime: result[i].create_time.Format("yyyy-MM-dd"),
					phone: result[i].phone,
					orderStatus: getReserveStatus(result[i].reserve_status, result[i].reserve_date, (result[i].ground_type == 0 ? '18:30:00' : '20:30:00')),
					orderClass: getReserveStatus(result[i].reserve_status, result[i].reserve_date, (result[i].ground_type == 0 ? '18:30:00' : '20:30:00'), true)
				}
			}
			res.json(new Result(200, r));
		};
	},
	cancel: function(req, res, next) {
		const param = req.query || req.params;
		if(param.id == null || param.id == undefined) {
			res.json(new Result(101, null));
			return;
		}
		pool.getConnection(function(err, connection) {
			connection.query($sql.cancel, [param.id], function(_err, _result) {
				util.response(_err, _result, res, connection, succCall);
			});
		});
		var succCall = function(result, response, connection) {
			var mailSender = require("../util/mail");
			var msg = '用户取消"' + param.date + '的' + param.ground + '，用户联系电话：' + param.phone;
			pool.getConnection(function(err, connection) {
				connection.query('select email from admin', null, function(err, result) {
					var emails = [];
					if(err) {
						emails = ["tracy0953@qq.com"];
					}
					for(var i = 0; i < result.length; i++) {
						emails.push(result[i].email);
					}
					mailSender.send({
						"fromText": "取消预约",
						"from": "13291829199@163.com",
						"to": emails.toString(),
						"subject": "取消预约",
						//							"text": "",
						"html": msg
					}, function(err, info) {
						if(!err) {
							response.json(new Result(200, result, '取消成功'));
						}
					})
					connection.release();
				})
			})

		};
	}
};