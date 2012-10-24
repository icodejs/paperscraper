
var user = require('../lib/user');

exports.create = function(req, res){
  var o = JSON.parse(req.query.obj);
  user.create({
    username : o.username,
    email    : o.email,
    docs     : []
  }, function (err, obj) {
    if (err) {
      return res.json(500, JSON.stringify(err));
    }
    res.json(JSON.stringify(obj));
  });
};

exports.load = function (req, res) {
  user.where({email: req.route.params.email}, function (err, results) {
    if (err) {
      return res.json(500, JSON.stringify(err));
    }
    res.json(JSON.stringify(results[0]));
  });
};


exports.current = function (req, res) {
  var user = req.user;
  if (user) {
    res.json(JSON.stringify({
      id   : user.id,
      name : user.username
    }));
  }
  else {
    res.json(500, JSON.stringify({
        err: 'no user in session'
      })
    );
  }
};
