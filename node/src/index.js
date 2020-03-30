'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const Sentry = require('@sentry/node');
const Prometheus = require('prom-client');
const path = require('path');
const cors = require('cors');
const config = require('./config');
const kue = require('kue');
const scraper = require('./controller/scraper.controller');

Sentry.init({ dsn: process.env.SENTRY_DSN });

const app = express();
const queue = kue.createQueue({
    redis: {
        port: process.env.REDIS_PORT || config.redis.port,
        host: process.env.REDIS_HOST || config.redis.host
    }
});

const PORT = process.env.SERVER_PORT || config.server.port;
const HOST = process.env.SERVER_HOST || config.server.host;

const metricsInterval = Prometheus.collectDefaultMetrics;
metricsInterval({ timeout: 1000 });

const httpRequestDurationMicroseconds = new Prometheus.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'code'],
    buckets: [0.10, 5, 15, 50, 100, 200, 300, 400, 500]
});

app.use(cors());
app.options('*', cors());

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

app.use('/files', express.static(path.join(__dirname, '../public')));

app.use('/queues', kue.app);
app.post('/sendFile', (req, res) => {
    let now = new Date();
    let job = queue
        .create('scrap', {
            title: 'Job registered at Queue at: ' + now.toLocaleString(),
            link: req.body.linkFile,
            email: req.body.email
        })
        .attempts(3)
        .save((err) => {
            if (!err) console.log(job.id);
        });

    res.sendStatus(200);
});

queue.process('scrap', async (job, done) => {
    const { link, email } = job.data;
    await scraper.sendFile(link, email);
    await done();
});

app.get('/debug-sentry', function mainHandler(req, res) {
    throw new Error('Sentry error!');
});


// Metrics
app.use((req, res, next) => {
    res.locals.startEpoch = Date.now();
    next();
});

app.get('/metrics', (req, res) => {
    res.set('Content-Type', Prometheus.register.contentType);
    res.end(Prometheus.register.metrics());
});

app.use((req, res, next) => {
    const responseTimeInMs = Date.now() - res.locals.startEpoch;
    httpRequestDurationMicroseconds
        .labels(req.method, req.route.path, res.statusCode)
        .observe(responseTimeInMs);
    next();
});

// Error handler
app.use(Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
        return error.status === 404 || error.status === 500;
    }
}));

app.use(function onError(err, req, res, next) {
    res.statusCode = 500;
    res.end(res.sentry + "\n");
});

app.listen(PORT,HOST);
console.log(`Running on http://${HOST}:${PORT}`);
