var path      = require("path");
var url       = require("url");
var util      = require("util");

global.instances = [];
global.vwfRoot = process.env.VWF || '/var/www/vwf';
global.applicationRoot = process.env.LIVELY || '/var/www/LivelyKernel';

var sio = require(path.join(vwfRoot, 'node_modules/socket.io'));
var reflector = require(path.join(vwfRoot, 'lib/nodejs/reflector'));
var vwf = require(path.join(vwfRoot, 'lib/nodejs/vwf'));


global.log = function () { console.log.apply(this, arguments); };
global.logLevel = 999;


console.log('VWFCOMPAT: starting subserver ....');


// -=-=-=-=-=-
// websockets
// -=-=-=-=-=-

// for some reason the lively websocket server gets an UPGRADE request earlier
// than socket.io although socket.io actually does some magic when installing an
// UPGRADE handler itself. Actually socket.io should wrap existing handlers but
// for some reason this don't happen. So in this patch we enable ws lively
// requests that go to /nodejs/SessionTracker
;(function patchWebsocketServer(livelyWsServer) {
    // livelyWsServer = require('./SessionTracker').SessionTracker.servers['/nodejs/SessionTracker/'];
    
    // lv.server.lifeStar.removeAllListeners('upgrade');

    var websocketImpl = livelyWsServer.websocketServer.websocketImpl;
    var conf = websocketImpl.config;

    // websocketImpl.config.httpServer == lv.server.lifeStar
    // lv.server.lifeStar.listeners('upgrade')[0] === websocketImpl._handlers.upgrade

    websocketImpl.unmount();

    websocketImpl.handleUpgrade = function (req, socket, head) {
        console.log('upgrade %s', req.url);
        if (req.url.match(/^\/nodejs\/SessionTracker/)) {
            websocketImpl.constructor.prototype.handleUpgrade.call(websocketImpl, req, socket, head);
        }
        // else {
        //     proxy.ws(req, socket, head, {xfwd: true, target: 'http://127.0.0.1:' + vwfPort});
        // }
    }

    websocketImpl._handlers.upgrade = websocketImpl.handleUpgrade.bind(websocketImpl);
    websocketImpl.mount(websocketImpl.config);

})(require('./SessionTracker').SessionTracker.servers['/nodejs/SessionTracker/']);

var socketManager = (function setupSocketIO(server) {
    var socketManager = sio.listen(server, { 
        log: true,
        resource: {
            exec: function( url ) {
                var match = /\/1\/\?t=\d*/.exec( url ) || /\/1\/websocket/.exec( url );
                if (match) {
                    return [url.substring(0, url.indexOf(match[0]))];
                } else {
                    return null;
                }
            }
        } 
    });
    socketManager.set( 'transports', [ 'websocket' ] );
    socketManager.set('destroy upgrade', false);
    socketManager.sockets.on( 'connection', reflector.OnConnection );
    return socketManager;
})(lv.server.lifeStar);


// -=-=-
// http
// -=-=-

module.exports = function(route, app) {

    var vwfProxyRules = {
        routes: [
            {route: /[\/]+1.*/}, // socket.io
            {route: '/vwf/*'},
            {route: '/admin/*'},
            {route: '/proxy/*'}, // vwf namespaced "documents"
        ],
        resources: [
            "compatibilitycheck.js",
            "socket.io.js",
            "socket.io-sessionid-patch.js",
            "require.js",
            "async.js",
            "closure/base.js",
            "closure/vec/float32array.js",
            "closure/vec/float64array.js",
            "closure/vec/vec.js",
            "closure/vec/vec3.js",
            "closure/vec/vec4.js",
            "closure/vec/mat4.js",
            "closure/vec/quaternion.js",
            "crypto.js",
            "md5.js",
            "alea.js",
            "mash.js",
            "Class.create.js",
            "rAF.js",
            "performance.now-polyfill.js",
            "vwf.js",

            // via require.js
            "pace.min.js",
            "jquery-1.10.2.min.js",
            "jquery-encoder-0.1.0.js",
            "jquery-1.10.2.min.map",
            "domReady.js",
            "rsvp.js",
            "logger.js"
        ]
    };

    function serve(req, res) {
        try {
            vwf.Serve(req, res);
        } catch ( e ) {
            console.error("vwf server error: %s", e);
            res.status(500).end(String(e));
        }
    }

    function serveLivelyVwf(req, res) {
    
        var urlMatcher, json, stuff = [{
            match: /\/?index.vwf/, json: {
              "extends": "http://vwf.example.com/node.vwf",
              "properties": {"p": "test"},
              "children": {
                "morph": {
                  "extends": "http://vwf.example.com/morph.vwf",
                  "properties": {
                    "classname": "lively.morphic.Box",
                    "position": "lively.pt(10,10)",
                    "rotation": 0,
                    "opacity": 1,
                    "extent": "lively.pt(100,50)",
                    "fill": "Color.blue",
                    "borderWidth": 2
                  }
                }
              },
              "scripts": [""]
            }
        }, {match: /\/?morph.vwf/, json: {
              "extends": "http://vwf.example.com/node2.vwf",
              "properties": {
                "classname": "box",
                "extent": [100,100],
                "fill": [0,0,255],
                "borderWidth": 3,
                "position": [10,10],
                "rotation": 0,
                "opacity": 1
              }
        }}];
        
        for (var i = 0; i < stuff.length; i++) {
            if (!req.url.match(stuff[i].match)) continue;
            if (!req.query.callback) res.json(stuff[i].json);
            else res.end(req.query.callback + '(' + JSON.stringify(stuff[i].json) + ');');
            return true;
        }
    
        return false;
    }

    app.get('*', function(req, res, next) {
        if (serveLivelyVwf(req, res)) return;

        // process.pid
        var isVWFRequest = vwfProxyRules.resources.indexOf(req.url.replace(/^[\/]+/, '')) > -1;
        console.log('isVWFRequest: %s, %s', isVWFRequest, req.url);
        if (isVWFRequest) serve(req, res); else next();

    });

    vwfProxyRules.routes.forEach(function(rule) {

        var methods = rule.methods || ['GET'];
        methods.forEach(function(method) {
            app[method.toLowerCase()](rule.route, serve);
        });

    });

    app.get(route, function(req, res) {
        res.end('VWFCompatServer running happily');
    });

}

module.exports.socketManager = socketManager;
