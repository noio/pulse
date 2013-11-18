/*!
  * Pulse - beat tracking from MIDI Clock
  * v0.1.2
  * https://github.com/noio/pulse
  * MIT License | (c) Thomas "noio" van den Berg 2013
  */
var pulse = function(module){

	module.MIDI_CLOCK = 248;
	module.MIDI_START = 250;
	module.PPQN = 24;
	module.TAP_TIMEOUT = 20;
	module.MAX_NET_LATENCY = 150;
	module.PING_INTERVAL = 10000;

	function PulseClient(address) {
		this.beats = [];
		this.bpm = 120;
		this.mspb = 600; 
		
		this.socket = null;
		this.address = null;
		this.clocks = 0;
		this.latest = 0;

		this.deviceLatency = 0;
		this.netLatency = 0;	
		this.lastPing = 0;
		this.pingTimer = null;

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
		var passed = (new Date).getTime() - this.beats[this.beats.length-1];
		return this.latest + (passed + this.netLatency + this.deviceLatency) / this.mspb;
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

		if (typeof io !== 'undefined'){
			self.connectSocket(address)
		} else {
			var script = document.createElement('script');
			script.src = address + '/socket.io/socket.io.js';
			
			self = this;
			script.onload = function () {
				self.connectSocket(address);
			};
		}

		document.head.appendChild(script);
	}

	PulseClient.prototype.connectSocket = function(address){
		var self = this;
		this.socket = io.connect(address);
		// Handle connect
		this.socket.on('connect', function(){
		   	this.address = address;
		   	this.pingTimer = setInterval(function(){self.ping()}, module.PING_INTERVAL);
		}.bind(this));
		
		// Handle connection failure
		this.socket.on('connect_failed', function(){
			this.socket = null;
			throw "Failed to connect to MIDI Socket.";
		}.bind(this));

		// Handle incoming midi
		this.socket.on('midi', function (data) {
    		if (data == module.MIDI_CLOCK){
    			this.clock();
    		}
    		else if (data == module.MIDI_START){
    			this.sync();
    		}
		}.bind(this));

		// Set the network latency when a pong is received. 
		this.socket.on('pong', function(data){
			var latency = Math.min(module.MAX_NET_LATENCY, ((new Date).getTime() - this.lastPing) / 2);
			this.netLatency = this.netLatency * 0.8 + latency * 0.2;
			console.log("Latency: " + this.netLatency)
		}.bind(this));
	}

	PulseClient.prototype.ping = function(){
		if (this.socket){
			this.lastPing = (new Date).getTime();
			this.socket.emit('ping');
		}
	}

	/**
	* Disconnect from the pulse address
	*/
	PulseClient.prototype.disconnect = function(){
		if (this.socket){
			this.socket.disconnect();
			this.socket = null;
			this.address = null;
		}
	}

	module.PulseClient = PulseClient;
	return module;

}({})