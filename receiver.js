var MailParser = require("mailparser").MailParser;
var MongoClient = require('mongodb').MongoClient;
var emailTemplate = require('email-templates');
var nodemailer = require('nodemailer');
var path = require('path');

var config = require('./config.js');

var mailparser = new MailParser({streamAttachments: true});

var transport = nodemailer.createTransport({
	host: config.mailhost,
	port: config.mailport
});

var emailTemplateDir = path.join(__dirname, 'email');

var today = Date.now();
var user;
var useremail;
if (process.argv.length == 3) {
	user = process.argv[2];
	useremail = user + "@" + config.domain;

	MongoClient.connect(config.mongourl, function(err, db) {

		var collection = db.collection('vacation');

		collection.findOne({ name: user}, function(err, doc){
			if (err) {
				console.log(err);
			} else {
				if (doc) {
					var startDate = Date.parse(doc.startDate);
					var endDate = Date.parse(doc.endDate);

					if (today > startDate && today < endDate) {
						mailparser.on('end', function(mail){
							var to = mail.to;
							if (mail.cc) {
								to = to.concat(mail.cc);
							}
							if (mail.bcc) {
								to = to.concat(mail.bcc);
							}
							to = emailAddressList(to);
							if (to.indexOf(useremail) != -1) {
								if (doc.list.indexOf(mail.from[0].address)) {
									//send response
									emailTemplate(emailTemplateDir, function(err, template){
										if(err) {
											console.log(err);
										}
										template('response', {message: doc.message}, function(err, html, text) {
											console.log(html);
											console.log(text);

											var mailOptions = {
											    from: useremail,
											    to: mail.from[0].address,
											    subject: doc.subject,
											    text: text, 
											    html: html 
											}

											transport.sendMail(mailOptions, function(err, resp){
												if (err) {
													console.log(err);
													db.close();
												} else {
													console.log(resp);
													doc.list.push(mail.from[0].address);
													collection.save(doc, function(err, doc) {
														if (err) {
															console.log(err);
														}
														db.close();
													});
												}
											});

										});
									});
									
								} else {
									db.close();
								}
							} else {
								console.log("not in recipient list");
								db.close();
							}
						});


						process.stdin.pipe(mailparser);
					} else {
						db.close();
					}
				} else {
					db.close();
				}
				
			}
		});

		
	});

}

function emailAddressList(toList) {
	var to = [];
	for (var i=0; i<toList.length; i++) {
		to.push(toList[0].address);
	}
	return to;
}


