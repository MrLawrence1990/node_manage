var _storage = require("../util/redis");
var _module = {
	update: function(session) {
		_storage.get(session, function(err, result) {
			if(err) {
				throw err;
			} else {
				_storage.set(session, result, 60 * 60, function(err, result) {
					if(err) {
						throw err;
					}
				})
			}
		});
	}
};
module.exports = _module;