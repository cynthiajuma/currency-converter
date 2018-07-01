// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({344:[function(require,module,exports) {
var __dirname = "/Users/cynthiajumawelinga/Desktop/currency_converter";
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var maxMessages = 30;
var compressor = compression({
  flush: zlib.Z_PARTIAL_FLUSH
});

var appServerPath = os.platform() == 'win32' ? '\\\\.\\pipe\\offlinefirst' + Date.now() + '.sock' : 'offlinefirst.sock';

var connectionProperties = {
  perfect: { bps: 100000000, delay: 0 },
  slow: { bps: 4000, delay: 3000 },
  'lie-fi': { bps: 1, delay: 10000 }
};

var imgSizeToFlickrSuffix = {
  '1024px': 'b',
  '800px': 'c',
  '640px': 'z',
  '320px': 'n'
};

function findIndex(arr, func) {
  for (var i = 0; i < arr.length; i++) {
    if (func(arr[i], i, arr)) return i;
  }
  return -1;
}

var Server = function () {
  function Server(port) {
    var _this = this;

    _classCallCheck(this, Server);

    this._app = express();
    this._messages = [];
    this._sockets = [];
    this._serverUp = false;
    this._appServerUp = false;
    this._port = port;
    this._connectionType = '';
    this._connections = [];

    this._appServer = http.createServer(this._app);
    this._exposedServer = net.createServer();

    this._wss = new WebSocketServer({
      server: this._appServer,
      path: '/updates'
    });

    var staticOptions = {
      maxAge: 0
    };

    this._exposedServer.on('connection', function (socket) {
      return _this._onServerConnection(socket);
    });
    this._wss.on('connection', function (ws) {
      return _this._onWsConnection(ws);
    });

    this._app.use(compressor);
    this._app.use('/js', express.static('../public/js', staticOptions));
    this._app.use('/css', express.static('../public/css', staticOptions));
    this._app.use('/sw.js', function (req, res) {
      return res.sendFile(path.resolve('../public/sw.js'), staticOptions);
    });
    this._app.use('/manifest.json', function (req, res) {
      return res.sendFile(path.resolve('../public/manifest.json'), staticOptions);
    });

    this._app.get('/', function (req, res) {
      res.send(indexTemplate({
        scripts: '<script src="/js/main.js" defer></script>',
        content: postsTemplate({
          content: _this._messages.map(function (item) {
            return postTemplate(item);
          }).join('')
        })
      }));
    });

    this._app.get('/skeleton', function (req, res) {
      res.send(indexTemplate({
        scripts: '<script src="/js/main.js" defer></script>',
        content: postsTemplate()
      }));
    });

    this._app.get('/photos/:farm-:server-:id-:secret-:type.jpg', function (req, res) {
      var flickrUrl = 'http://farm' + req.params.farm + '.staticflickr.com/' + req.params.server + '/' + req.params.id + '_' + req.params.secret + '_' + imgSizeToFlickrSuffix[req.params.type] + '.jpg';
      var flickrRequest = http.request(flickrUrl, function (flickrRes) {
        flickrRes.pipe(res);
      });

      flickrRequest.on('error', function (err) {
        // TODO: use a real flickr image as a fallback
        res.sendFile('imgs/icon.png', {
          root: __dirname + '/../public/'
        });
      });

      flickrRequest.end();
    });

    this._app.get('/ping', function (req, res) {
      res.set('Access-Control-Allow-Origin', '*');
      res.status(200).send({ ok: true });
    });

    this._app.get('/remote', function (req, res) {
      res.send(remoteExecutorTemplate());
    });

    this._app.get('/idb-test/', function (req, res) {
      res.send(idbTestTemplate());
    });

    generateReady.then(function (_) {
      // generate initial messages
      var time = new Date();

      for (var i = 0; i < maxMessages; i++) {
        var msg = generateMessage();
        var timeDiff = random(5000, 15000);
        time = new Date(time - timeDiff);
        msg.time = time.toISOString();
        _this._messages.push(msg);
      }

      _this._generateDelayedMessages();
    });
  }

  _createClass(Server, [{
    key: '_generateDelayedMessages',
    value: function _generateDelayedMessages() {
      var _this2 = this;

      setTimeout(function (_) {
        _this2._addMessage();
        _this2._generateDelayedMessages();
      }, random(5000, 15000));
    }
  }, {
    key: '_broadcast',
    value: function _broadcast(obj) {
      var msg = JSON.stringify(obj);
      this._sockets.forEach(function (socket) {
        socket.send(msg, function (err) {
          if (err) console.error(err);
        });
      });
    }
  }, {
    key: '_onServerConnection',
    value: function _onServerConnection(socket) {
      var _this3 = this;

      var closed = false;
      this._connections.push(socket);

      socket.on('close', function (_) {
        closed = true;
        _this3._connections.splice(_this3._connections.indexOf(socket), 1);
      });

      socket.on('error', function (err) {
        return console.log(err);
      });

      var connection = connectionProperties[this._connectionType];
      var makeConnection = function makeConnection(_) {
        if (closed) return;
        var appSocket = net.connect(appServerPath);
        appSocket.on('error', function (err) {
          return console.log(err);
        });
        socket.pipe(new Throttle(connection.bps)).pipe(appSocket);
        appSocket.pipe(new Throttle(connection.bps)).pipe(socket);
      };

      if (connection.delay) {
        setTimeout(makeConnection, connection.delay);
        return;
      }
      makeConnection();
    }
  }, {
    key: '_onWsConnection',
    value: function _onWsConnection(socket) {
      var _this4 = this;

      var requestUrl = url.parse(socket.upgradeReq.url, true);

      if ('no-socket' in requestUrl.query) return;

      this._sockets.push(socket);

      socket.on('close', function (_) {
        _this4._sockets.splice(_this4._sockets.indexOf(socket), 1);
      });

      var sendNow = [];

      if (requestUrl.query.since) {
        var sinceDate = new Date(Number(requestUrl.query.since));
        var missedMessages = findIndex(this._messages, function (msg) {
          return new Date(msg.time) <= sinceDate;
        });
        if (missedMessages == -1) missedMessages = this._messages.length;
        sendNow = this._messages.slice(0, missedMessages);
      } else {
        sendNow = this._messages.slice();
      }

      if (sendNow.length) {
        socket.send(JSON.stringify(sendNow));
      }
    }
  }, {
    key: '_addMessage',
    value: function _addMessage() {
      var message = generateMessage();
      this._messages.unshift(message);
      this._messages.pop();
      this._broadcast([message]);
    }
  }, {
    key: '_listen',
    value: function _listen() {
      var _this5 = this;

      this._serverUp = true;
      this._exposedServer.listen(this._port, function (_) {
        console.log("Server listening at localhost:" + _this5._port);
      });

      if (!this._appServerUp) {
        if (fs.existsSync(appServerPath)) fs.unlinkSync(appServerPath);
        this._appServer.listen(appServerPath);
        this._appServerUp = true;
      }
    }
  }, {
    key: '_destroyConnections',
    value: function _destroyConnections() {
      this._connections.forEach(function (c) {
        return c.destroy();
      });
    }
  }, {
    key: 'setConnectionType',
    value: function setConnectionType(type) {
      if (type === this._connectionType) return;
      this._connectionType = type;
      this._destroyConnections();

      if (type === 'offline') {
        if (!this._serverUp) return;
        this._exposedServer.close();
        this._serverUp = false;
        return;
      }

      if (!this._serverUp) {
        this._listen();
      }
    }
  }]);

  return Server;
}();

exports.default = Server;
},{}],347:[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';

var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };

  module.bundle.hotData = null;
}

module.bundle.Module = Module;

var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = '' || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + '51353' + '/');
  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      console.clear();

      data.assets.forEach(function (asset) {
        hmrApply(global.parcelRequire, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.parcelRequire, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');

      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);

      removeErrorOverlay();

      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);
  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;

  // html encode message and stack trace
  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;

  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';

  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(+k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  bundle.hotData = {};
  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAccept(global.parcelRequire, id);
  });
}
},{}]},{},[347,344], null)
//# sourceMappingURL=/server.1742ba86.map