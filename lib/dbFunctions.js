
exports.get = function (dbObj) {

  function create(obj, callback) {
    obj._id = String(Date.now(), 10);
    dbObj.create(obj, function (err, doc) {
      if (err) return callback(err);
      return callback(null, doc);
    });
  }

  function all(callback) {
    dbObj.all(function (err, docs) {
      if (err) return callback(err);
      return callback(null, docs);
    });
  }

  function load(id, callback) {
    dbObj.get(String(id, 10), function (err, doc) {
      if (err) return callback(err);
      return callback(null, doc);
    });
  }

  function update(obj, callback) {
    dbObj.update(obj, function (err, doc) {
      console.log(doc);
      if (err) return callback(err);
      return callback(null, doc);
    });
  }

  function destroy(id, callback) {
    dbObj.destroy(String(id, 10), function (err, doc) {
      if (err) return callback(err);
      return callback(null, doc);
    });
  }

  function where(whereObject, callback) {
    dbObj.find(whereObject, function (err, docs) {
      if (err) return callback(err);
      return callback(null, docs);
    });
  }

  return {
    create  : create,
    all     : all,
    load    : load,
    update  : update,
    destroy : destroy,
    where   : where
  };

};
