var _Constant = require('../constant/constant');
var Result = function(code,data,msg){
	this.code = code;
	this.msg =_Constant[code]?_Constant[code]:msg;
	this.data = data;
};
module.exports = Result;