var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');

var cache = {};

function send404(response){
	response.writeHead(404, {'Content-Type': 'text/plain'});
	response.write('Error 404: resourse not found.');
	response.end();
}

function sendFile (response, filePath, fileContents) {
	response.writeHead(200, {"content-type":mime.lookup(path.basename(filePath))}
		);
	response.end(fileContents);
}

function serveStatic(response, cache, absPath) {
// Проверка факта кэширования файла в памяти
if (cache[absPath]) {
// Обслуживание файла, находящегося в памяти
sendFile(response, absPath, cache[absPath]);
} else {
// Проверка факта существования файла
fs.exists(absPath, function(exists) {
if (exists) {
// Считывание файла с диска
fs.readFile(absPath, function(err, data) {
if (err) {
send404(response);} else {
cache[absPath] = data;
// Обслуживание файла, считанного с диска
sendFile(response, absPath, data);
}
});
} else {
// Отсылка HTTP-ответа 404
send404(response);
}
});
}
}

var server = http.createServer(function(request, response){
	var filePath = false;
	if(request.url =='/'){
		filePath = 'public/index.html';
	}else{
		filePath = 'public' + request.url;
	}
	var absPath = './' + filePath;
	serveStatic(response, cache, absPath);
});

server.listen(3000, function(){
	console.log('Server listening on the port 3000');
});