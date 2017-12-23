var reserve = {
	getList:'select * from ground',
	getGroundInfoById:'select * from reserve_ground where ground_id=?',
	check:'select * from reserve_date where ground_id=? and ground_type=? and reserve_date=?',
	reserve:'insert into reserve_date (reserve_date,ground_id,ground_type,user_id,phone)values(?,?,?,?,?)',
};
 
module.exports = reserve;