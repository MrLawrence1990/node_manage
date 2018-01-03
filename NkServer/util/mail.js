var nodemailer = require('nodemailer')
var smtpTransport = require('nodemailer-smtp-transport');

// send mail with defined transport object

module.exports = {
	send: function(cnf, call) {
		/*
			cnf:{
				"fromText":"",
				"from":"",
				"to":"",
				"subject":"",
				"text":"",
				"html":"",
			}
		*/
		var mailOptions = {
			from: cnf.fromText + '<' + cnf.from + '>', // 发件地址
			to: cnf.to, // 收件列表
			subject: cnf.subject, // 标题
			//text和html两者只支持一种
			text: cnf.text, // 标题
			html: cnf.html // html 内容
		};
		var transport = nodemailer.createTransport(smtpTransport({
			host: "smtp.163.com",
			//			secure: true, // 使用 SSL
			//			secureConnection: true, // 使用 SSL
			port: 25,
			auth: {
				user: "13291829199@163.com",
				pass: "xxx510100"
			}
		}));

		transport.sendMail(mailOptions, function(error, info) {
			if(call) {
				call(error, info);
			}
		});

	}
}