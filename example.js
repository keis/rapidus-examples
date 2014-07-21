var config = require('config'),
    logging = require('rapidus'),
    express = require('express'),
    logger = logging.getLogger('app'),
    app = express();

require('rapidus-configure')(config.logging);

app.use(logging.getLogger('access').middleware);

app.get('/test', function (req, res, next) {
    logger.info('processing request');
    setTimeout(function () {
        logger.info('request processed');
        res.send(200, 'zoidberg');
    }, 100);
});

app.listen(4000);

// Log some stuff
logger.debug('some details');
logger.warn('this feels bad');
logger.error('abandon ship');

logging.getLogger('app.other').info('not visible');
logging.getLogger('app.other').warn('visible');
