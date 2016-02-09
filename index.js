const koa = require("koa");
const auth = require("koa-basic-auth");
const router = require("koa-router")();
const serve = require("koa-static");
const supervisord = require("./supervisord");

const config = require("./config.json");

const app = koa();
const client = supervisord.connect(config.supervisord);

app.use(function *(next){
  try {
    yield next;
  } catch (err) {
    if (401 == err.status) {
      this.status = 401;
      this.set('WWW-Authenticate', 'Basic');
      this.body = 'cant haz that';
    } else {
      throw err;
    }
  }
});

app.use(auth(config.nodevisor.users[0]));

app.use(serve('./static/'));

router.get('/api/readlog', function *(next) {
    this.body = {
        result: yield client.readLog(-1000, 0)
    };
    
    yield next;
});

const instanceMethods = {
    "clearlog": "clearLog",
    "shutdown": "shutdown",
    "restart": "restart",
    "pid": "getPID",
    "state": "getState",
    "version": "getSupervisorVersion",
    "apiVersion": "getAPIVersion",
    "identification": "getIdentification",
    "processinfo": "getAllProcessInfo",
    "startall": "startAllProcesses",
    "stopall": "stopAllProcesses",
    "reload": "reloadConfig"
}

Object.keys(instanceMethods).forEach((method) => {
    const serverMethod = instanceMethods[method];
    
    router.get("/api/" + method, function *(next) {
        this.body = {
            result: yield client[serverMethod](),
            status: true
        };
        
        yield next;
    })
})

const processMethods = {
    "start": "startProcess",
    "stop": "stopProcess",
    "clearlog": "clearProcessLogs",
    "processinfo": "getProcessInfo"
}

Object.keys(processMethods).forEach((method) => {
    const serverMethod = processMethods[method];
    
    router.get("/api/:process/" + method, function *(next) {
        this.body = {
            result: yield client[serverMethod](this.params.process),
            status: true
        };
        
        yield next;
    })
})

app.use(router.routes())
   .use(router.allowedMethods());
app.listen(config.nodevisor.port);
