var http = require('http').createServer(handler);
var url = require('url');
var fs = require('fs');
var io = require('socket.io')(http);


http.listen(3000);


function handler (request, response) {
    console.log(request.headers['host'] + ': ' + request.method + ' ' + request.url);

    var path = url.parse(request.url).pathname;

    switch(path) {
        case '/':
            fs.readFile('./chat.html', function (error, data) {
                response.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                response.write(data, 'utf-8');
                response.end();
            });
            break;
        default:
            response.writeHead(404);
            response.write('This page does not exists!');
            response.end();
            break;
    }
};


io.on('connection', function(socket) {
    socket.broadcast.emit('chat-new-user', 'new user connected');

    socket.on('chat-message', function(msg) {
        console.log(socket.username + ': ' + msg);
        io.emit('chat-message', {
            'user': socket.username,
            'message': msg
        });
    });
    socket.on('set-username', function(username) {
        socket.username = username;
    });
});



/*
io.on('connection', function(socket) {
    console.log('New user connected');
    socket.on('disconnect', function() {
        console.log('User disconnected');
    });
    socket.on('new message', function(msg) {
        io.emit('new message', msg);
        console.log('message: ' + msg);
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});
*/
