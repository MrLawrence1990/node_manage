var reserve = {
	getList:'select * from ground',
	getGroundInfoById:'select * from reserve_ground where ground_id=?',
	check:'select * from reserve_date where ground_id=? and ground_type=? and reserve_date=? and reserve_status=0',
	reserve:'insert into reserve_date (reserve_date,ground_id,ground_type,user_id,phone,create_time,reserve_status)values(?,?,?,?,?,?,0)',
	list:'select * from reserve_date where user_id=?',
	cancel:'update reserve_date set reserve_status=1 where id=?'
};
 
module.exports = reserve;