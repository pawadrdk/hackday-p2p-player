"use strict";
// hls

const mSeedPeer = "http://172.20.1.105:8081/master.m3u8";
const hqDR2 = "https://drevent-lh.akamaihd.net/i/event12_0@427365/master.m3u8";
const DR2 = "https://dr02-lh.akamaihd.net/i/dr02_0@147055/master.m3u8"

// poster
const poster = "http://www.dr.dk/mu-online/api/1.3/bar/52d3f5e66187a2077cbac70e?width=322&height=181";

var containerElement = document.getElementById("playerHandle");

// Build the standard video element
var playerElement = document.createElement("video");

playerElement.setAttribute("height", "480");
playerElement.setAttribute("width", "640");
playerElement.setAttribute("id", "videojs_player");
playerElement.setAttribute("class", "video-js vjs-default-skin vjs-big-play-centered poc-player");
playerElement.setAttribute("controls", "");
playerElement.setAttribute("poster", poster);

//build src element
var source = document.createElement("source");
source.setAttribute("src", DR2);
source.setAttribute("type", "application/x-mpegURL");

// append source to player
playerElement.appendChild(source);

// append video element to html handle.
containerElement.appendChild(playerElement);

// Initialize videojs on video-element id
var player = videojs('videojs_player', {
    "nativeControlsForTouch": false
});

// var vjsButton = videojs.getComponent('button');
var Button = videojs.getComponent('Button');

// Subclass the component (see 'extend' doc for more info)
// list of components to extend http://docs.videojs.com/docs/guides/components.html
var hqBtn = videojs.extend(Button, {
  constructor: function () {
    Button.apply(this, arguments);
    /* initialize your button */
    // Add component specific styling
    this.addClass("hq-btn");
    this.el().innerHTML= "HQ";
  },
  handleClick: function () {
    /* do something on click */
    console.log("clicked hq");
  }
});

// Register the new component with videojs
Button.registerComponent('hqBtn', hqBtn);

// Add the bingmenu component to the player
player.getChild('controlBar').addChild('hqBtn');

