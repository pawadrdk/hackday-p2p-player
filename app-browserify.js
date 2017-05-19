var hyperdrive = require('hyperdrive')
var ram = require('random-access-memory')
var ws = require('websocket-stream')
var createServer = require('browser-server')
var swarm = require('webrtc-swarm')
var signalhub = require('signalhub')
var pump = require('pump')

var HIGH_Q = window.location.toString().indexOf('high') > -1

var key = HIGH_Q ? '49036de8c59a846892d5d6366031d723adca46440da15716db50d9c344d71391' : 'ad3998d84ebaf4fea8318b2d41d5b990913531ffdc4b288e4818a5f49642eeb7'
var seed = 'ws://localhost:30000'

var archive = hyperdrive(ram, key, {sparse: true})
var speedometer = require('speedometer');
var prettierBytes = require('prettier-bytes');

archive.on('content', function () {
  var upSpeed = speedometer();
  var downSpeed = speedometer();
  archive.content.on('upload', function (i, data, peer) {
    // upspsed
    console.log("up", prettierBytes(upSpeed(data.length))+ "/s");
    // downspeed
    console.log("down", prettierBytes(downSpeed()));
    // nr of connections
    console.log("nr of peers", archive.content.peers.length);
  })
  archive.content.on('download', function (i, data, peer) {
    // downspeed
    console.log("down", prettierBytes(downSpeed(data.length)));
    // upspseed
    console.log("up", prettierBytes(upSpeed()));
    // nr of total connections
    console.log("nr of peers", archive.content.peers.length);
  })
})

archive.metadata.on('download', function (i, b, p) {
  // console.log(p)
})


archive.on('ready', function () {
  if (window.location.toString().indexOf('noseed') === -1) {
    console.log('Also connecting to seed')
    var s = ws(seed)
    var w = archive.replicate({live: true, encrypt: false})
    pump(s, w, s)

    if (HIGH_Q) {
      var s = ws('wss://hasselhoff.mafintosh.com:30000')
      pump(s, archive.replicate({live: true, encrypt: false}), s)
    }
  }

  var sw = swarm(signalhub(archive.discoveryKey.toString('hex'), ['https://signalhub.mafintosh.com']))

  sw.on('peer', function (c) {
    pump(c, archive.replicate({live: true, encrypt: false}), c)
  })
})

var server = createServer()

server.on('request', function (req, res) {
  var name = req.path.replace('/browser-server', '')
  console.log('serving', name)
  archive.stat(name, function (err, st) {
    if (err) return res.end()

    var r = req.headers.range && range(st.size, req.headers.range)[0]

    res.statusCode = 200
    res.setHeader('Accept-Ranges', 'bytes')
    res.setHeader('Content-Type', 'video/mp4')

    if (r) {
      res.statusCode = 206
      res.setHeader('Content-Range', 'bytes ' + r.start + '-' + r.end + '/' + st.size)
      res.setHeader('Content-Length', r.end - r.start + 1)
    } else {
      res.setHeader('Content-Length', st.size)
    }

    var stream = archive.createReadStream(name, r)

    stream.pipe(res)
  })
})

server.on('ready', function () {
  fetch('/browser-server/test.js')
})

server.on('reload', function () {
  location.reload()
})
