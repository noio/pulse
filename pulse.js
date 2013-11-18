/*!
  * Pulse - beat tracking from MIDI Clock
  * v0.1.1
  * https://github.com/noio/pulse
  * MIT License | (c) Thomas "noio" van den Berg 2013
  */
var pulse = function(module){

	module.MIDI_CLOCK = 248;
	module.MIDI_START = 250;
	module.PPQN = 24;
	module.TAP_TIMEOUT = 20;

	function PulseClient(address) {
		this.beats = [];
		this.bpm = 120;
		this.mspb = 600; 
		
		this.socket = null;
		this.clocks = 0;
		this.latest = 0;

		this.deviceLatency = 0;
		this.netLatency = 0;	

		if (address){
			this.connect(address);
		}
	}
	
	/**
	 * Handles the incoming MIDI clock messages.
	 */
	PulseClient.prototype.clock = function(){
		if (this.clocks == 0){
			this.tap()
		}
		this.clocks ++;
		if (this.clocks == module.PPQN){
			this.clocks = 0;
		}
	}

	/**
	 * Handles the midi start event,
	 * which basically resets the PPQN counter to 0
	 */
	PulseClient.prototype.sync = function(){
		console.log('MIDI Synced.')
		this.clocks = 0;
		this.latest = 0;
	}


	/**
	 * This is fired every "whole" beat, and updates the BPM
	 */
	PulseClient.prototype.tap = function(){
		var now = (new Date).getTime();
		if (now - this.beats[this.beats.length - 1] > module.TAP_TIMEOUT * this.mspb) {
			this.beats = []
		}
		this.beats.push(now);
		if (this.beats.length > 1){
			if (this.beats.length >= 4){
				this.beats.shift()
			}
			this.mspb = (this.beats[this.beats.length-1] - this.beats[0]) / (this.beats.length-1);
			// convert 'milliseconds per beats to 'beats per minute'
			this.bpm = 60000 / this.mspb;
		}
		this.latest = Math.round(this.latest) + 1;
	}

	/**
	* Get the current beat
	*/
	PulseClient.prototype.beat = function(){
		return this.latest + ((new Date).getTime() - this.beats[this.beats.length-1]) / this.mspb;
	}

	/**
	* Get a pulse on the beat
	*/
	PulseClient.prototype.pulse = function(){
		return Math.exp(-Math.pow( Math.pow(this.beat() % 1, 0.3) - 0.5, 2) / 0.05)
	}

	/**
	* Connect to a pulse server, get the socket.io script
	*/
	PulseClient.prototype.connect = function(address){
		if (this.socket){
			this.disconnect();
		}
		if (!address.indexOf('http') == 0){
			address =  'http://' + address;
		}

		var script = document.createElement('script');
		script.src = address + '/socket.io/socket.io.js';
		
		self = this;
		script.onload = function () {	
    		self.socket = io.connect(address);
    		// TODO Set address when succesfully connected,
    		// and handle failure.
  			self.socket.on('midi', function (data) {
	    		if (data == module.MIDI_CLOCK){
	    			self.clock();
	    		}
	    		else if (data == module.MIDI_START){
	    			self.sync();
	    		}
  			});
		};

		document.head.appendChild(script);
	}

	/**
	* Disconnect from the pulse address
	*/
	PulseClient.prototype.disconnect = function(){
		if (this.socket){
			this.socket.disconnect();
			this.socket = null;
		}
	}

	module.PulseClient = PulseClient;
	return module;

}({})