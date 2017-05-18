var hyperdrive = require('hyperdrive')
var ram = require('random-access-memory')
var ws = require('websocket-stream')
var createServer = require('browser-server')
var swarm = require('webrtc-swarm')
var signalhub = require('signalhub')

var archive = hyperdrive(ram, '5021b0028e788d4e07acbb69203e431a54ab49ef8b89935c3ba05c08fd4038ef', {sparse: true})
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

archive.metadata.on('download', function (i) {
  // console.log(i)
})

archive.on('ready', function () {
  if (window.location.toString().indexOf('noseed') === -1) {
    console.log('Also connecting to seed')
    var s = ws('ws://hasselhoff.mafintosh.com:30000')
    s.pipe(archive.replicate({live: true, encrypt: false})).pipe(s)
  }

  var sw = swarm(signalhub(archive.discoveryKey.toString('hex'), ['http://hasselhoff.mafintosh.com:40000']))

  sw.on('peer', function (c) {
    c.pipe(archive.replicate({live: true, encrypt: false})).pipe(c)
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
