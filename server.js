var connect = require('connect'),
    socketio = require('socket.io'),
    midi = require('midi.io');

var server = connect.createServer(),
    io = socketio.listen(server);

server.use(midi(io));
server.listen(9000);