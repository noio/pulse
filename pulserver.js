var midi = require('midi');
var socketio = require('socket.io');

var MIDI_PPQN = 24;
var SOCKET_PPQN = 4;
var MIDI_CLOCK = 248;
var MIDI_START = 251;
var MIDI_CONTINUE = 252;
var clockCount = 0;


// Set up a new input.
var input = new midi.input();

var devices = [];
for (var i = 0; i < input.getPortCount(); i ++){
    devices[i] = input.getPortName(i);
}

if (process.argv.length < 4){
    console.log('Run the server using "node pulserver.js [device_id] [port]"');
    console.log('    e.g. "node pulserver.js 0 9000"');

    console.log("The following MIDI devices were detected:");
    if (devices.length == 0){
        console.log("...NO DEVICES DETECTED...");
    } else {
        for (var i = 0; i < devices.length; i ++){
            console.log( "id: " + i + "\t" + devices[i]);
        }
    }
    process.exit(0);
} else {
    var deviceID = parseInt(process.argv[2])
    var port = parseInt(process.argv[3])

    if (deviceID >= devices.length){
        throw "Device " + deviceID + " unknown."
    }
    console.log("Listening to device " + deviceID + ": " + devices[deviceID])

    io = socketio.listen(port);
    io.sockets.on('connection', function (socket) {
        console.log("Client connected.");

        socket.on('disconnect', function(reason){
            console.log("Disconnected: " + reason);
        });

        socket.on('ping', function(){
            socket.emit('pong');
        });
    });


    var midiReceived = function(deltaTime, message){
        // Throttle the number of clock messages sent.
        // The midi standard of 24 pulses-per-quarter-note
        // (e.g. 120*24 = 2880 messages per second @ 12bpm) is a
        // little high to pump through a web socket.
        if (message == MIDI_CLOCK){
            if (clockCount % (MIDI_PPQN/SOCKET_PPQN) == 0){
                io.sockets.emit('midi', message);
                clockCount = 0;
            }
            clockCount ++;
        } else {
            io.sockets.emit('midi', message);
            if (message == MIDI_START || message == MIDI_CONTINUE){
                clockCount = 0;
            }
        }
    }

    input.openPort(deviceID);
    input.ignoreTypes(false, false, false);
    input.on('message', midiReceived);

}
