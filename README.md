**pulse** is a small node.js server and client that pipes **MIDI Clock** 
messages to your browser through a WebSocket. It also  interpolates the *bpm* and current 
*phase*.

## Installation

The server uses [node.js](https://github.com/joyent/node/wiki/Installation), for which you need Python and C++ compilers (Windows SDK or Visual Studio on Windows, Xcode on mac.). 

Then, you need the node.js [midi](https://npmjs.org/package/midi) and [socket.io](https://npmjs.org/package/socket.io) packages.