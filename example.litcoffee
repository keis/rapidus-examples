# rapidus-examples

This is an example on how to use rapidus and associated modules to create a
sweet logging setup.

It's written in [Literate CoffeeScript](http://coffeescript.org/#literate).

## Require dependencies

This example makes use of `express` and `cluster` to create a dummy application
that can do some logging, `node-config` is used to let us store the
configuration of the logging system in a YAML and `connect-continuation-id` is
used to keep a id for each request`. And then of course the various `rapidus`
components are used to the actual logging.

    config = require 'config'
    logging = require 'rapidus'
    express = require 'express'
    cluster = require 'cluster'
    continuationId = require('connect-continuation-id')()
    logger = logging.getLogger 'app'
    app = express()

## Export custom log record processor

Define a custom log record processor that attaches the generated unique id of
the request being processed. This function needs to be exported because it will be
loaded by `rapidus-configure` from a directive in the configuration.

    module.exports.requestId = (config) ->
        (record) ->
            record.requestId = continuationId.get()

## Configure

Configure the logging stack from the YAML loaded into `config` using
`rapidus-configure`. The current `module` is passed in the provide a proper
scope for relative `require()` calls triggered from the config

    require('rapidus-configure') config.logging, null, module

## Worker function

The worker function that runs in the child processes started by `cluster`. It
runs a small express app that has a single route that does some pretend
asynchronous work while logging some dummy messages.


    worker = ->
        logger.info 'hello from worker', process.pid

        app.use continuationId.assign
        app.use logging.getLogger('access').middleware

        app.get '/test', (req, res, next) ->
            logger.info 'processing request'
            setTimeout (->
                logger.info 'request processed'
                res
                    .status 200
                    .send 'zoidberg'
            ), 100

        app.listen 4000

## Master function

The master function takes care of spawning the workers of the cluster.

    master = ->
        logger = logging.getLogger 'master'

        i = 4
        cluster.fork() while i-=1

        cluster.on 'exit', (worker) ->
            logger.info '%s has left the building', worker.process.pid

## Start it

    if cluster.isMaster then master() else worker()
