var $sql = require('./userMapper');
var http = require('http');
var Result = require("../entity/result")
	// 使用连接池，提升性能
var pool = require("../util/pool");

module.exports = {
	regWechatUser: function(req, res, next) {
		var param = req.query || req.params;
		var param = {
			"session_key": "xAdeJTybIBApJe5m7Fl+xg==",
			"openid": "oEawj0YYV6lrXBHfhB9RLnplg2iM"
		};
		const debugRes = {
			"sessionid": req.sessionID
		};
		try {
			http.get("http://api.weixin.qq.com/sns/jscode2session?appid=wx11a30002c58bcc40&secret=8797afba30707d049b747457a3a59e05&js_code=071bJUhN1gu1K11gBwkN1OC9iN1bJUhN&grant_type=authorization_code", function(_res) {
				pool.getConnection(function(err, connection) {
					connection.query($sql.checkUser, param.openid, function(err, result) {
						//记录sessionid对应的value
						let _storage = require("../util/redis")
						_storage.set(debugRes.sessionid, param.session_key + "," + param.openid, 60 * 60, function(serr, sresult) {
							if(serr) {
								res.json(new Result(106, null, "内部服务器错误"));
								return;
							}
						})
						if(err) {
							connection.release();
							res.json(new Result(103, null));
							return;
						}
						if(result.length == 0) {
							/*
							没有用户就添加一个
							返回sessionid 让客户端保存
							*/
							connection.query($sql.addWeChatUser, [debugRes.openid, param.nickName], function(_err, _result) {
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