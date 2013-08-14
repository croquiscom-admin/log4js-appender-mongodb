var mongodb = require('mongodb')
  , consoleLog = console.log;

function mongodbAppender (config) {
  var host = config.host || 'localhost'
    , port = config.port || 27017
    , server = new mongodb.Server(host, port, {})
    , db = new mongodb.Db(config.database, server, { safe: true })
    , collection;
  db.open(function (error, client) {
    if (error) {
      consoleLog('[log4js] Failed to connect to MongoDB server ' + host + ':' + port + '/' + config.database);
    }
    if (config.user || config.password) {
      db.authenticate(config.user, config.password, function (error, success) {
        if (success) {
          collection = new mongodb.Collection(client, config.collection || 'logs');
          consoleLog('[log4js] Connected to MongoDB server');
        } else {
          consoleLog('[log4js] Failed to authenticate to MongoDB server');
        }
      });
    } else {
      collection = new mongodb.Collection(client, config.collection || 'logs');
      consoleLog('[log4js] Connected to MongoDB server');
    }
  });
  return function(loggingEvent) {
    if (collection) {
      collection.insert({
          time: loggingEvent.startTime
        , level: loggingEvent.level.toString()
        , category: loggingEvent.categoryName
        , data: loggingEvent.data[0]
      }, { safe: false });
    }
  };
}

function configure(config) {
  return mongodbAppender(config);
}

exports.appender = mongodbAppender;
exports.configure = configure;
