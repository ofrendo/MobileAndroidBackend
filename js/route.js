var userMgt = require("./crud/userMgt");
var tripMgt = require("./crud/tripMgt");
var cityMgt = require("./crud/cityMgt");
var locationMgt = require("./crud/locationMgt");
var sessionMgt = require("./sessionMgt");
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
	new Route("/auth/login", "post", userMgt.onLogin),
	new Route("/auth/logout", "post", userMgt.onLogout),
	new Route("/user", "post", userMgt.onCreateUser),
	new Route("/user/*", "all", sessionMgt.onCheckSession),
	new Route("/user/:user_id", "all", userMgt.crud.onAll),
	new Route("/user/:user_id", "get", userMgt.crud.onRead),
	new Route("/user/:user_id", "put", userMgt.crud.onUpdate),	
	new Route("/user/:user_id/changePassword", "put", userMgt.crud.onChangePassword),
	new Route("/user/:user_id", "delete", userMgt.crud.onDelete),
	new Route("/user/:user_id/trips", "get", tripMgt.crud.onReadUserTrips),
	new Route("/trip", "post", sessionMgt.onCheckSession),
	new Route("/trip", "post", tripMgt.crud.onCreate),
	new Route("/trip/*", "all", sessionMgt.onCheckSession),
	new Route("/trip/:trip_id", "all", tripMgt.crud.onAll),
	new Route("/trip/:trip_id", "get", tripMgt.crud.onRead),
	new Route("/trip/:trip_id", "put", tripMgt.crud.onUpdate),
	new Route("/trip/:trip_id", "delete", tripMgt.crud.onDelete),
	new Route("/trip/:trip_id/*", "all", tripMgt.crud.onAll),
	new Route("/trip/:trip_id/move", "put", tripMgt.crud.onMove),
	new Route("/trip/:trip_id/users", "get", tripMgt.crud.onReadTripUsers),
	new Route("/trip/:trip_id/addUser", "put", tripMgt.crud.onAddUserToTrip),
	new Route("/trip/:trip_id/removeUser", "put", tripMgt.crud.onRemoveUserFromTrip),
	new Route("/trip/:trip_id/cities", "get", tripMgt.crud.onReadTripCities),
	new Route("/trip/:trip_id/city", "post", cityMgt.crud.onCreate),
	new Route("/trip/:trip_id/city/:city_id", "all", cityMgt.crud.onAll),
	new Route("/trip/:trip_id/city/:city_id", "get", cityMgt.crud.onRead),
	new Route("/trip/:trip_id/city/:city_id", "put", cityMgt.crud.onUpdate),
	new Route("/trip/:trip_id/city/:city_id", "delete", cityMgt.crud.onDelete),
	new Route("/trip/:trip_id/city/:city_id/*", "all", cityMgt.crud.onAll),
	new Route("/trip/:trip_id/city/:city_id/move", "put", cityMgt.crud.onMove),
	new Route("/trip/:trip_id/city/:city_id/locations", "get", cityMgt.crud.onReadCityLocations),
	new Route("/trip/:trip_id/city/:city_id/changeLocationIndexes", "put", locationMgt.crud.onChangeLocationIndexes),
	new Route("/trip/:trip_id/city/:city_id/location", "post", locationMgt.crud.onCreateLocation),
	new Route("/trip/:trip_id/city/:city_id/location/:location_id", "all", locationMgt.crud.onAll),
	new Route("/trip/:trip_id/city/:city_id/location/:location_id", "get", locationMgt.crud.onRead),
	new Route("/trip/:trip_id/city/:city_id/location/:location_id", "put", locationMgt.crud.onUpdate),
	new Route("/trip/:trip_id/city/:city_id/location/:location_id", "delete", locationMgt.crud.onDelete),
	new Route("/trip/:trip_id/city/:city_id/location/:location_id/move", "put", locationMgt.crud.onMove)
];

exports.router = router;