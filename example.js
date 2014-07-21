var config = require('config'),
    logging = require('rapidus'),
    logger = logging.getLogger('app');

require('rapidus-configure')(config.logging);

// Log some stuff
logger.debug('some details');
logger.warn('this feels bad');
logger.error('abandon ship');

logging.getLogger('app.other').info('not visible');
logging.getLogger('app.other').warn('visible');
