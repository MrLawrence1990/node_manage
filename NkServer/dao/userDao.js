var mysql = require('mysql');
var $conf = require('../conf/db');
var $util = require('../util/util');
var $sql = require('./userMapper');
var http = require('http');
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
	add: function(req, res, next) {
		pool.getConnection(function(err, connection) {
			// 获取前台页面传过来的参数
			var param = req.query || req.params;

			// 建立连接，向表中插入值
			// 'INSERT INTO user(id, name, age) VALUES(0,?,?)',
			connection.query($sql.insert, [param.name, param.age], function(err, result) {
				if(result) {
					result = {
						code: 200,
						msg: '增加成功'
					};
				}

				// 以json形式，把操作结果返回给前台页面
				jsonWrite(res, result);

				// 释放连接 
				connection.release();
			});
		});
	},
	getUser: function(req, res, next) {
		pool.getConnection(function(err, connection) {
			connection.query($sql.getUser, null, function(err, result) {
				// 以json形式，把操作结果返回给前台页面
				jsonWrite(res, result);
				// 释放连接 
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
		http.get("http://api.weixin.qq.com/sns/jscode2session?appid=wx11a30002c58bcc40&secret=8797afba30707d049b747457a3a59e05&js_code=071bJUhN1gu1K11gBwkN1OC9iN1bJUhN&grant_type=authorization_code", function(_res) {
			//			jsonWrite(res, debugRes);
			pool.getConnection(function(err, connection) {
				connection.query($sql.checkUser, debugRes.openid, function(err, result) {
					if(result.length == 0) {
						connection.query($sql.addWeChatUser, debugRes.openid, function(err, result) {
							
							connection.release();
						});
					}
					//				if(result.count==1){
					//					jsonWrite(res, result.count);
					//				}else{
					//					
					//				}
					connection.release();
				});
			});
		}).on('error', function(e) {
			console.log("Got error: " + e.message);
		});
	}
};