module.exports = {
	extend: function(target, source, flag) {
		for(var key in source) {
			if(source.hasOwnProperty(key)) flag ? (target[key] = source[key]) : (target[key] === void 0 && (target[key] = source[key]));
		}
		return target;
	},
	isEmpty: function(val) {
		return val ? false : true
	},
	response: function(err, result, response, connection, call) {
		if(err) {
			response.json(new Result(103, err));
			connection.release();
		} else {
			call(result, response, connection);
		}
	}
}