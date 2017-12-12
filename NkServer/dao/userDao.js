var mysql = require('mysql');
var $conf = require('../conf/db');
var $util = require('../util/util');
var $sql = require('./userMapper');
var http = require('http');
var Result = require("../entity/result")
	// 使用连接池，提升性能
var pool = mysql.createPool($util.extend({}, $conf.mysql));

// 向前台返回JSON方法的简单封装
var jsonWrite = function(res, ret) {
	console.log('res jsonWrite', res);
	console.log('ret', ret);
	if(typeof ret === 'undefined') {
		res.json({
			code: '1',
			msg: '操作失败'
		});
	} else {
		res.json(ret);
	}
};

module.exports = {
	getUser: function(req, res, next) {
		pool.getConnection(function(err, connection) {
			connection.query($sql.getUser, null, function(err, result) {
				// 以json形式，把操作结果返回给前台页面
				// 释放连接 
				res.json(new Result(200, result));
				connection.release();
			});
		});
	},
	regWechatUser: function(req, res, next) {
		var param = req.query || req.params;
		var debugRes = {
			"session_key": "xAdeJTybIBApJe5m7Fl+xg==",
			"openid": "oEawj0YYV6lrXBHfhB9RLnplg2iM"
		};
		try {
			http.get("http://api.weixin.qq.com/sns/jscode2session?appid=wx11a30002c58bcc40&secret=8797afba30707d049b747457a3a59e05&js_code=071bJUhN1gu1K11gBwkN1OC9iN1bJUhN&grant_type=authorization_code", function(_res) {
				pool.getConnection(function(err, connection) {
					connection.query($sql.checkUser, debugRes.openid, function(err, result) {
						if(err){
							connection.release();
							res.json(new Result(103, null));
						}
						if(result.length == 0) {
							console.log("addWeChatUser")
							/*
							没有用户就添加一个
							*/
							connection.query($sql.addWeChatUser, [debugRes.openid, param.nickName], function(_err, _result) {
								console.log("_result ",_result)
								console.log("_err ",_err)
								connection.release();
							});
						} else {
							connection.release();
						}
						res.json(new Result(200, debugRes));
					});
				});
			}).on('error', function(e) {
				res.json(new Result(102, null));
			});
		} catch(e) {
			//TODO handle the exception
			res.json(new Result(102, null));
		}
	}
};