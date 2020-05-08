var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

// HTTP サーバのポートを指定する
port = process.env.PORT || 8080;
app.listen(port);
console.log("port", port)

function handler(req, res) {
	fs.readFile(__dirname + '/index.html',
		function (err, data) {
			if (err) {
				res.writeHead(500);
				return res.end('Error loading index.html');
			}

			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.end(data);
		});
}

var bomber = io.of('/bomber').on('connection', function (socket) {
	var code_username;
	var myusername = "";
	var battle_code;
	var mode;
	var username = {};

	socket.on('call', function (data) {
		Object.keys(data).forEach(value => {
			bomber.emit(value, data[value])
			code_username = value.substr(0, 17);
			battle_code = value.substr(0, 5);
			mode = value.substr(value.search(/[a-zA-Z]*$/));
			if (mode == "start") {
				myusername = code_username;
			}
			if (mode == "join") {
				for (let i in data[value]) {
					username[socket.id] = i;
				}
			}

		})
	});

	socket.on('disconnect', function () {
		if (mode != undefined) {
			if (mode == "join") {
				bomber.emit(battle_code + "join", { [username[socket.id]]: { users: 0 } })
			} else {
				bomber.emit(myusername + "end", { died: true })
			}
		}
	})

});
