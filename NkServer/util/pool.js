var mysql = require('mysql');
var $conf = require('../conf/db');
var $util = require('../util/util');

var pool = mysql.createPool($util.extend({}, $conf.mysql));
module.exports = pool;