var midi = require('midi');
var io = require('socket.io');


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

	io = io.listen(port);
	io.sockets.on('connection', function (socket) {
		console.log("Client connected.");

		var midiReceived = function(deltaTime, message){
			socket.emit('midi', message);
		}

		input.openPort(deviceID);
		input.ignoreTypes(false, false, false);
		input.on('message', midiReceived);	

		socket.on('disconnect', function(reason){
			console.log("Disconnected: " + reason);
			input.removeListener('message', midiReceived);
		});

		socket.on('ping', function(){
			socket.emit('pong');
		});
	});

}
