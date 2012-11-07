
exports.index = function (req, res) {
  res.render('index',{
    pageId : 'index',
    title  : 'Index',
    user   : req.session.user
  });
};

exports.login = function (req, res) {
  res.render('login', {
    pageId : 'index',
    title  : 'Login',
    loadJs : false,
    user   : req.session.user
  });
};

