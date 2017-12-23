var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var index = require('./routes/index');
var user = require('./routes/user');
var reserve = require('./routes/reserve');
//var redis = require('./redis.js').reids;
var app = express();
const RedisStore = require('connect-redis')(session);
// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(cookieParser());
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
const store = new RedisStore({
	host: 'localhost',
	port: 6379,
	//	client: redis,
	prefix: 'hgk'
});
app.use(session({
	secret: 'sessiontest',
	name: 'nknknk',
	//	store: store,
	cookie: {
		maxAge: 80000
	},
	resave: false,
	saveUninitialized: false
}));

app.use(function(req, res, next) {
	let sessionid = req.headers["session"];
	let _storage = require("./util/redis")
	let url = req.originalUrl;
	if(url.indexOf('/user/regWechatUser') == -1) {
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
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
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