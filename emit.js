var midi = require('midi');

var bpm;
if (process.argv.length < 3){
    bpm = 123;
} else {
    bpm = parseInt(process.argv[2], 10);
}

// Set up a new input.
var output = new midi.output();
var count = 0;
var last = new Date().getTime();

// Create a virtual input port.
output.openVirtualPort("A Beat!");
output.sendMessage([250]);

// Send a MIDI message.
function beat(){
    output.sendMessage([248]);

    if (count % 48 == 0){ console.log('BOOM! ' + count/24); }
    if (count % 48 == 24){ console.log("CLAP! " + count/24); }

    count ++;
    if (count >= 24 * 16){
        count = 0;
        output.sendMessage([250]);
    }
    var now = new Date().getTime();
    setTimeout(beat, last + 60000 / bpm / 24 - now);
    last += 60000 / bpm / 24;
}
beat();

// Close the port when done.
output.closePort();



// // Count the available output ports.
// output.getPortCount();

// // Get the name of a specified output port.
// output.getPortName(0);

// // Open the first available output port.
// output.openPort(0);
