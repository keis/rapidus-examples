var config = require('config'),
    logging = require('rapidus'),
    express = require('express'),
    cluster = require('cluster'),
    continuationId = require('connect-continuation-id')(),
    logger = logging.getLogger('app'),
    app = express();

// Export to be used from the config as a processor with
//   type: './example[requestId]'
module.exports.requestId = function (config) {
    return function (record) {
        record.requestId = continuationId.get();
    };
}

require('rapidus-configure')(config.logging, null, module);

function worker() {
    logger.info('worker online', process.pid);

    app.use(continuationId.assign);
    app.use(logging.getLogger('access').middleware);

    app.get('/test', function (req, res, next) {
        logger.info('processing request');
        setTimeout(function () {
            logger.info('request processed');
            res.send(200, 'zoidberg');
        }, 100);
    });

    app.listen(4000);
}

function master() {
    var logger = logging.getLogger('master');

    for (var i = 0; i < 4; i++) {
        cluster.fork();
    }

    cluster.on('exit', function (worker) {
        logger.info('%s has left the building', worker.process.pid);
    });

    // Log some stuff
    logger.debug('some details');
    logger.warn('this feels bad');
    logger.error('abandon ship');

    logging.getLogger('app.other').info('not visible');
    logging.getLogger('app.other').warn('visible');
}

if (cluster.isMaster) {
    master();
} else {
    worker();
}
