
var
nodemailer = require("nodemailer"),
conf       = require('./config'),
from       = 'Server Error <errors@docuevid.com>',

smtpTransport = nodemailer.createTransport('SMTP', {
  service : 'Gmail',
  debug   : true,
  auth    : {
    user  : conf.mail.address,
    pass  : conf.mail.password
  }
});

exports.send = function (obj, callback) {
  var mailOptions = {
    from    : obj.from || from,
    to      : obj.to || conf.mail.defaultTo,
    subject : obj.subject || 'Message from Docuvid server',
    text    : obj.text,
    html    : obj.html
  };

  smtpTransport.sendMail(mailOptions, function (err, response){
      if (err) {
        callback(err);
      }
      else {
        callback(null, 'Message sent: ' + response.message);
      }
      smtpTransport.close();
  });
};
