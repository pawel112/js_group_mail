var notifier 		= require('mail-notifier');
var mysql    		= require('mysql');
var mailer   		= require("nodemailer");
var smtpTransport 	= require('nodemailer-smtp-transport');
var config   		= require('./config/config.js');

function listen_mail() {
		var imap = {
		user: 		config.mail_login,
		password: 	config.mail_password,
		host: 		config.mail_host,
		port: 		config.mail_port,
		tls: 		true,
		tlsOptions: { rejectUnauthorized: false }
	};
	
	console.log ("Mail group start");

	notifier(imap).on('mail',function(mail) {
		console.log("Got mail");
		var send_to = null;
		
		get_send_to(mail.to[0].address, function(result) {
			send_to = result;
			
			if (send_to != null) {
				var attachments = null;
				
				if (mail.attachments == undefined) {
					attachments = null;
				} else {
					var attachments = new Array();
					for (var i=0; i<mail.attachments.length; i++) {
						
						var attachment = new Object();
						attachment.filename = mail.attachments[i].fileName;
						attachment.content = mail.attachments[i].content
						attachment.encoding = mail.attachments[i].transferEncoding;
						attachments.push (attachment);
					}
				}
				
				if (mail.html == undefined) {
					send_main(send_to, mail.subject, mail.from[0].address, mail.from[0].name, mail.text, attachments);
				} else {
					send_main(send_to, mail.subject, mail.from[0].address, mail.from[0].name, mail.html, attachments);
				}
			}
		});
	}).start();
};

function validateEmail(email) {
    var re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return re.test(String(email).toLowerCase());
};

function get_send_to(email_from, callback) {
	var connection = mysql.createConnection({
		host     : config.db_host,
		user     : config.db_login,
		password : config.db_password,
		database : config.db_name
	});
	connection.connect(function(error) {
		if (error) {
			console.log ("Error: "+error);
			connection.end();
			throw error;
		} else {
			//query
			var sql = "SELECT `mail_to` FROM `aliases` WHERE `mail_from` = '"+email_from+"' AND `is_on`= 1 LIMIT 1";
			connection.query(sql, function (error, results, fields) {
				if (error) {
					console.log ("Error: "+error);
					connection.end();
					throw error;
				} else {					
					try {
						var result = null;
						result = JSON.stringify(results[0].mail_to);
						result = result.substr(2, result.length-4);
						result = result.split(",");
						
						for (var i=1; i<result.length; i++) {
							result[i] = result[i].substr(1);
						}
						for (var i=0; i<result.length; i++) {
							result[i] = result[i].substr(2, result[i].length-4);
						}
						connection.end();
						callback (result);
					}
					catch(err) {
						connection.end();
						callback (null);
					}
				}
			});
		}
	});
};

function send_main(email_to, email_subject, email_from_email, email_from_name, email_body, email_attachments) {
	var smtpTransport2 = mailer.createTransport(smtpTransport({
		host: config.mail_host,
		port: config.mail_port_stmp,
		auth: {
			user: config.mail_login,
			pass: config.mail_password
	}}));
	
	for (var i=0; i<email_to.length; i++) {	
		
		if (validateEmail(email_from_email) == true) {
			var mail = {
				from: email_from_email,
				to: email_to[i],
				subject: email_subject,
				html: email_body,
				attachments: email_attachments
			}
			
			smtpTransport2.sendMail(mail, function(error, response) {
				if (error) {
					console.log("Error: "+error);
				} else {
					console.log("Message send");
				}
				smtpTransport2.close();
			});
		}
	}
};

listen_mail();