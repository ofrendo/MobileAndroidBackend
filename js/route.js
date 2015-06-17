var fenceGroupMgt = require("./crud/fenceGroupMgt");
var fenceMgt = require("./crud/fenceMgt");
/*
path: path with which to make an API call
method: get, post, put, delete
callback: function to call
*/
function Route(path, method, callback) {
	this.path = path;
	this.method = method;
	this.callback = callback;
}

//These are available elsewhere as router.routes
var router = exports;
router.routes = [
	new Route("/", "get", function(req, res) { //Server status service
		res.send("Server is running.");
	}),
	new Route("/test", "get", function(req, res) {res.redirect("/test/index.html")}),
	new Route("/test/*", "get", function(req, res) { //unit tests for rest api
		var fs = require('fs');
		var path = require('path');

		var filePath = '.' + req.url;
		var extname = path.extname(filePath);
		var contentType = 'text/html';
		switch (extname) {
			case '.js':
				contentType = 'text/javascript';
				break;
			case '.css':
				contentType = 'text/css';
				break;
		}

		fs.readFile(filePath, function(error, content) {
			if (error) {
				res.writeHead(500);
				res.end();
			}
			else {
				res.writeHead(200, { 'Content-Type': contentType });
				res.end(content, 'utf-8');
			}
		});

	}),
	new Route("/fence_group/getAll", "get", fenceGroupMgt.crud.onReadAllFenceGroups),
	new Route("/fence_group", "post", fenceGroupMgt.crud.onCreate),
	new Route("/fence_group/:fence_group_id", "get", fenceGroupMgt.crud.onRead),
	new Route("/fence_group/:fence_group_id/getFences", "get", fenceGroupMgt.crud.onReadFenceGroupComplete),
	new Route("/fence_group/:fence_group_id", "put", fenceGroupMgt.crud.onUpdate),
	new Route("/fence_group/:fence_group_id", "delete", fenceGroupMgt.crud.onDelete),
	new Route("/fence_group/:fence_group_id/fence", "post", fenceMgt.crud.onCreate),
	new Route("/fence_group/:fence_group_id/fence/:fence_id", "get", fenceMgt.crud.onRead),
	new Route("/fence_group/:fence_group_id/fence/:fence_id", "put", fenceMgt.crud.onUpdate),
	new Route("/fence_group/:fence_group_id/fence/:fence_id", "delete", fenceMgt.crud.onDelete),
];

exports.router = router;