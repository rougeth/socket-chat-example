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

var users = {};
var colors_used = [];

function random_color() {
    var rgb = []

    for (i=0; i<3; i++) {
        do {
            color = Math.round(Math.random() * 255);
        } while(color < 150);
        rgb[i] = color.toString(16);
    }

    return '#' + rgb.join('');
}

io.on('connection', function(socket) {

    socket.on('join', function(username) {
        var color;
        do {
            color = random_color();
        } while(colors_used.indexOf(color) != -1);

        users[socket.id] = {};
        users[socket.id]['username'] = username;
        users[socket.id]['color'] = random_color();
        console.log('chat :: ' + username + ' has joined to the server.');
        socket.broadcast.emit('status', username + ' has joined to the server.');
        socket.emit('status', 'You have connected to the server.');
        io.sockets.emit('users', users);
    });

    socket.on('chat-message', function(msg) {
        console.log('chat :: ' + users[socket.id]['username'] + ' > ' + msg);
        io.sockets.emit('chat-message', users[socket.id], msg);
    });

    socket.on('disconnect', function() {
        var id = socket.id;
        console.log('chat :: ' + users[id]['username'] + ' has left the server.')
        io.sockets.emit('status', users[id]['username'] + ' has left the server.');
        delete users[id];
        io.sockets.emit('users', users);
    })
});
