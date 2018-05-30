const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const session = require('koa-generic-session');
const convert = require('koa-convert');
const CSRF = require('koa-csrf');
const static = require('koa-static-server');
const cors = require('koa-cors');

const app = new Koa();

// serve static file
app.use(static({rootDir: 'static', rootPath: "/static", log: true}));

//cors controll
app.use(cors()); // default is defaults = {origin: true, methods: 'GET,HEAD,PUT,POST,DELETE'}

// set the session keys
app.keys = [ 'a', 'b' ];

// add session support
app.use(convert(session()));

// add body parsing
app.use(bodyParser());

// add the CSRF middleware
app.use(new CSRF({
  invalidSessionSecretMessage: 'Invalid session secret',
  invalidSessionSecretStatusCode: 403,
  invalidTokenMessage: 'Invalid CSRF token',
  invalidTokenStatusCode: 403,
  excludedMethods: [ 'GET', 'HEAD', 'OPTIONS' ],
  disableQuery: false
}));


// x-response-time
app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
});

// logger
app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// response
app.use(async ctx => {
    if (ctx.csrf) ctx.body = ctx.csrf;
    ctx.body = 'Hello World';
});

app.on('error', (err, ctx) => {
    log.error('server error', err, ctx)
});

// start server
const port = 3000;
app.callback()
app.listen(3000, () => {
    console.info(`Koa App, port: ${port}`);
});
