var hyperdrive = require('hyperdrive')
var ram = require('random-access-memory')
var ws = require('websocket-stream')
var createServer = require('browser-server')
var swarm = require('webrtc-swarm')
var signalhub = require('signalhub')
var pump = require('pump')

// var key = '5021b0028e788d4e07acbb69203e431a54ab49ef8b89935c3ba05c08fd4038ef'
// var seed = 'ws://hasselhoff.mafintosh.com:30000'

var key = window.localStorage.KEY || 'c7eb61045d0e8ea61156d5fbd5b658e8ae7abe816d3b08f4dee31e3aa4a0d133'
var seed = window.localStorage.SEED || 'ws://localhost:30000'

var archive = hyperdrive(ram, key, {sparse: true})
var speedometer = require('speedometer');
var prettierBytes = require('prettier-bytes');
window.totalConnections = {
  upSpeed: speedometer(20),
  downSpeed: speedometer(20)
}
function initPeer(peerId){
 return {
   id: peerId,
   upSpeed: speedometer(20),
   downSpeed: speedometer(20)
 }
}

window.p2pArchive = archive;
window.peers = {};
archive.on('content', function () {
  archive.content.on('upload', function (i, data, peer) {
    
    // if peerid doesnt exist in list, initPeer or fetchPeer

    // then set upspeed both for total and individual peer
    window.totalConnections.upSpeed(data.length);
  })
  archive.content.on('download', function (i, data, peer) {

    // if peerid doesnt exist in list, initPeer or fetchPeer
    console.log("", peer);
    // then set downspeed both for total and individual peer
    window.totalConnections.downSpeed(data.length);
  })
})

archive.on('ready', function () {
  if (window.location.toString().indexOf('noseed') === -1) {
    console.log('Also connecting to seed')
    var s = ws(seed)
    pump(s, archive.replicate({live: true, encrypt: false}), s)
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
