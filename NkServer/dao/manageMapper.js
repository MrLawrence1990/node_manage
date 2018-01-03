var reserve = {
	test1: 'insert into test (name,age)values(?,?)',
	getAdminUser: 'select * from admin where email=?',
	login: 'select * from admin where email=? and password=?'
};

module.exports = reserve;