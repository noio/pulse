var midi = require('midi');

if (process.argv.length < 3){
	bpm = 123;
} else {
	bpm = parseInt(process.argv[2])
}

// Set up a new input.
var output = new midi.output();
var count = 0;

// Create a virtual input port.
output.openVirtualPort("A Beat!");
output.sendMessage([250]);

// Send a MIDI message.
setInterval(function(){
	output.sendMessage([248]);

	if (count % 48 == 0){ console.log('BOOM!') }
	if (count % 48 == 24){ console.log("CLAP!") }

	count ++;
	if (count >= 24 * 16){
		count = 0;
		output.sendMessage([250]);
	}
}, 60000 / 123 / 24);

// Close the port when done.
output.closePort();



// // Count the available output ports.
// output.getPortCount();

// // Get the name of a specified output port.
// output.getPortName(0);

// // Open the first available output port.
// output.openPort(0);
