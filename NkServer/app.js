var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var index = require('./routes/index');
var manage = require('./routes/manage');
var user = require('./routes/user');
var auth = require('./conf/auth');
var reserve = require('./routes/reserve');
//var redis = require('./redis.js').reids;
var app = express();
// view engine setup

app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');//替换为html模板

app.set('view engine', 'html');
app.engine('.html', require('ejs').renderFile);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(cookieParser());
app.use(session({
	secret: 'sessiontest',
	name: 'admin',//后端管理用session验证，小程序用openid和组合验证
	//	store: store,
	cookie: {
		maxAge: 80000
	},
	resave: false,
	saveUninitialized: true
}));
var authMetch = function(url) {
	var res = false;
	for(var i = 0; i < auth.length; i++) {
		if(url.indexOf(auth[i]) > -1) {
			return true;
		}
	}
	return res;
};
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
	//	if(req.originalUrl == "/manage") {
	//		res.sendfile("views/manage.html");
	//		return;
	//	}
	let url = req.originalUrl;
	if(url.indexOf('/user/regWechatUser') == -1 && authMetch(url)) {
		let sessionid = req.headers["session"];
		let _storage = require("./util/redis")
		if(!sessionid) {
			res.json({
				msg: '无权限的访问'
			});
			return;
		}
		_storage.get(sessionid, function(err, result) {
			if(err) {
				res.json({
					msg: 'redis connect error'
				});
			} else {
				if(result) {
					next();
				} else {
					res.json({
						msg: '无权限的访问'
					});
				}
			}
		})
	} else {
		next();
	}
});

app.use('/', index);
app.use('/manage', manage);
app.use('/user', user);
app.use('/reserve', reserve);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	// render the error page
	res.status(err.status || 500);
	res.render('error');
});
module.exports = app;