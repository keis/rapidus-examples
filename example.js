// Generated by CoffeeScript 1.9.2
var accessLog, app, cluster, config, continuationId, express, logger, logging, master, worker;

config = require('config');

logging = require('rapidus');

express = require('express');

cluster = require('cluster');

accessLog = require('rapidus-connect-logger');

continuationId = require('connect-continuation-id')();

logger = logging.getLogger('app');

app = express();

module.exports.requestId = function(config) {
  return function(record) {
    return record.requestId = continuationId.get();
  };
};

require('rapidus-configure')(config.logging, null, module);

worker = function() {
  logger.info('hello from worker', process.pid);
  app.use(continuationId.assign);
  app.use(accessLog('access'));
  app.get('/test', function(req, res, next) {
    logger.info('processing request');
    return setTimeout((function() {
      logger.info('request processed');
      return res.status(200).send('zoidberg');
    }), 100);
  });
  return app.listen(4000);
};

master = function() {
  var i;
  logger = logging.getLogger('master');
  i = 4;
  while (i -= 1) {
    cluster.fork();
  }
  return cluster.on('exit', function(worker) {
    return logger.info('%s has left the building', worker.process.pid);
  });
};

if (cluster.isMaster) {
  master();
} else {
  worker();
}
