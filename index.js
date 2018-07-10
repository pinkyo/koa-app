const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const session = require('koa-generic-session');
const convert = require('koa-convert');
const CSRF = require('koa-csrf');
const static = require('koa-static-server');
const cors = require('koa-cors');
// user defined
const search = require('./search');

const app = new Koa();
const router = new Router();

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
app.use(router.routes()).use(router.allowedMethods());;

router.get('/search/:key', async (ctx, next) => {
    const key = ctx.params.key;
    console.log(ctx);
    ctx.body = await search(key);
    if (!ctx.body) {
        ctx.body = "Not found."
    }
    ctx.status = 200;
    return;
});

app.on('error', (err, ctx) => {
    ctx.body = "Internal Error";
    ctx.status = 500;
    console.log('server error', err, ctx);
});

// start server
const port = 3000;
app.callback()
app.listen(3000, () => {
    console.info(`Koa App, port: ${port}`);
});
