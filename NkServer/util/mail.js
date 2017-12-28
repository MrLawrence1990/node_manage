var nodemailer = require('nodemailer')
var smtpTransport = require('nodemailer-smtp-transport');

// send mail with defined transport object

module.exports = {
	send: function(content) {
		var mailOptions = {
			from: '场地预约<13291829199@163.com>', // 发件地址
			to: '512826597@qq.com', // 收件列表
			subject: '场地预约通知', // 标题
			//text和html两者只支持一种
			text: 'Hello world ?', // 标题
			html: content // html 内容
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
			if(error) {
				return console.log(error);
			}
			console.log('Message sent: ' + info.response);
		});

	}
}