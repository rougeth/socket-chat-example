var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(request, response) {
    response.sendfile('chat.html');
});

io.on('connection', function(socket) {
    console.log('New user connected');
    socket.on('disconnect', function() {
        console.log('User disconnected');
    });
    socket.on('new message', function(msg) {
        io.emit('new message', msg);
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});
