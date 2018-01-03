/* 
测试连接sqlserver的事物机制 
2016年7月22日15:51:52 
 */
var async = require('async');
var dbTransaction = require('./dbTransaction.js');

dbTransaction.getTransaction(function(sql, transaction) {
	//开启事物  
	transaction.begin(function(err) {

		if(err) {
			console.log(err);
			return;
		}
		//定义一个变量,如果自动回滚,则监听回滚事件并修改为true,无须手动回滚  
		var rolledBack = false;

		//监听回滚事件  
		transaction.on('rollback', function(aborted) {
			console.log('监听回滚');
			console.log('aborted值 :', aborted);
			rolledBack = true;
		});

		//监听提交事件  
		transaction.on('commit', function() {
			console.log('监听提交');
			rolledBack = true;
		});

		var request = new sql.Request(transaction);
		var task1 = function(callback) {
			request.query("insert into test (name, age) values ('a1', 20)", function(err, result) {
				if(err) {
					console.log(err);
					callback(err, null);
					return;
				}
				console.log('第一条语句成功');
				callback(null, result)
			})

		};
		var task2 = function(callback) {
			request.query("insert into test (name, age) values ('a2', 22)", function(err, result) {
				if(err) {
					console.log(err);
					callback(err, null);
					return;
				}
				console.log('第二条语句成功');
				callback(null, result)
			})

		};
		var task3 = function(callback) {
			request.query("insert into test (name, age) values ('a3', 'a')", function(err, result) {
				if(err) {
					console.log(err);
					callback(err, null);
					return;
				}
				console.log('第三条语句成功');
				callback(null, result)
			})

		}
		async.series([task1, task2, task3], function(err, result) {
			var err = "11";
			if(err) {
				console.log('出现错误,执行回滚');
				if(!rolledBack) {
					//如果sql语句错误会自动回滚,如果程序错误手动执行回滚,不然事物会一致挂起.  
					transaction.rollback(function(err) {
						if(err) {

							console.log('rollback err :', err);
							return;
						}
						console.log('回滚成功');
					});
				}
			} else {
				console.log('无错误,执行提交');
				//执行提交  
				transaction.commit(function(err) {
					if(err) {

						console.log('commit err :', err);
						return;
					}
					console.log('提交成功');
				});
			}
		})
	});
})