var pulse = function(module){

	module.MIDI_CLOCK = 248;
	module.PPQN = 24;
	
	module.beats = [];
	module.bpm = 120;
	module.mspb = 2000; 

	var socket = null;
	var clocks = 0;
	var latest = 0;

	function clock(){
		if (clocks == 0){
			module.tap()
		}
		clocks ++;
		if (clocks == module.PPQN){
			clocks = 0;
		}
	}

	module.tap = function(){
		module.beats.push((new Date).getTime());
		if (module.beats.length > 5){
			module.beats.shift()
			module.mspb = (module.beats[4] - module.beats[0]) / 4;
			// convert 'milliseconds per beats to 'beats per minute'
			module.bpm = 60000 / module.mspb;
		}
	}

	/**
	* Connect to a pulse server, get the socket.io script
	* and list its devices.
	*/
	module.connect = function(server, callback){
		var script = document.createElement('script');
		script.src = server + '/socket.io/socket.io.js';
		console.log(script)
		
		script.onload = function () {	
    		socket = io.connect(server);
  			socket.on('devices', function (devices) {
    			if (callback){
    				callback(devices);
    			}
  			});
		};

		document.head.appendChild(script);
	}

	/**
	* Subscribe to a specific device
	*/
	module.subscribe = function(id){
		socket.emit('subscribe', 0);
		socket.on('midi', function (data) {
    		if (data == module.MIDI_CLOCK){
    			clock();
    		}
    		
  		});
	}

	/**
	* Disconnect from the pulse server
	*/
	module.disconnect = function(){
		socket.disconnect();
	}

	return module;

}({})