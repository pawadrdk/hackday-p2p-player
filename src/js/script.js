"use strict";
// hls
const hls = "http://172.20.1.105:8081/master.m3u8";
//const hls = "http://172.20.1.105:8081/master.m3u8";
//const hls = "http://drod10i-vh.akamaihd.net/i/dk/clear/streaming/70/591ca1c06187a60f00830270/Alene-i-vildmarken-USA-II--10-_58fb60ca823542668a34034fa48928a0_,562,.mp4.csmil/master.m3u8";

// encrypted hls
const encryptedHls = "http://drod08h-vh.akamaihd.net/i/dk/encrypted/streaming/75/588246aaa11f9f0c2c197375/The-Tonight-Show-med-Jimmy-Fal_fac673769752436faeda69fb8ba557ed_,1128,562,2394,362,.mp4.csmil/master.m3u8"

// mp4 download
const mp4 = "http://drod07f-vh.akamaihd.net/p/all/clear/download/50/587ba535a11f9f17b4067f50/Alene-i-vildmarken--4-10-_e2ef26679a9245f5bc6aac8b6d37a623_2812.mp4";

// subtitles webvtt
const webvtt1 = "https://www.dr.dk/mu/Asset?Id=58891c496187ae03ec8cce73";
const webvtt2 = "https://www.dr.dk/mu/Asset?Id=587e90e06187a409746e5ada";
const webvtt3 = "https://www.dr.dk/mu/Asset?Id=587555aba11fac0d8c8855f3";

// poster
const poster = "http://www.dr.dk/mu-online/api/1.3/bar/58760448a11fa01578861333?width=322&height=181";

var containerElement = document.getElementById("playerHandle");

// Build the standard video element
var playerElement = document.createElement("video");

playerElement.setAttribute("height", "480");
playerElement.setAttribute("width", "640");
playerElement.setAttribute("id", "videojs_player");
playerElement.setAttribute("class", "video-js vjs-default-skin vjs-big-play-centered poc-player");
playerElement.setAttribute("controls", "");
//playerElement.setAttribute("src", hls);
playerElement.setAttribute("poster", poster);

//build src element
var source = document.createElement("source");
source.setAttribute("src", hls);
source.setAttribute("type", "application/x-mpegURL");

// append source to player
playerElement.appendChild(source);

// append video element to html handle.
containerElement.appendChild(playerElement);

// Initialize videojs on video-element id
var player = videojs('videojs_player', {
    "nativeControlsForTouch": false,
});

// set subtitles
player.addRemoteTextTrack({
  kind: 'subtitles',
  src: webvtt2,
  srclang: 'dk',
  label: 'Foreign'
});


player.addRemoteTextTrack({
  kind: 'subtitles',
  src: webvtt1,
  srclang: 'dk',
  label: 'HardOfHearing'
});

