var midi = require('midi');
var io = require('socket.io').listen(9000);

// Set up a new input.
var input = new midi.input();

var devices = [];
for (var i = 0; i < input.getPortCount(); i ++){
	devices[i] = input.getPortName(i);
}

console.log("Devices: " + devices);

io.sockets.on('connection', function (socket) {

	socket.emit('devices', devices);

	var midiReceived = function(deltaTime, message){
		socket.emit('midi', message);
	}

	socket.on('subscribe', function(deviceID){
		input.openPort(deviceID);
		input.ignoreTypes(false, false, false);
		input.on('message', midiReceived);	
	});

	socket.on('disconnect', function(reason){
		console.log("Disconnected: " + reason);
		input.removeListener('message', midiReceived);
	});

	
});