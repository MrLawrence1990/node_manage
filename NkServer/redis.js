var ioRedis = require('ioredis');
var logger = require('log4js').getLogger();
var redis = new ioRedis();
// 默认127.0.0.1:6379
// redis 链接错误
redis.on("error", function (error) {
    logger.error(error);
});
module.exports = redis;