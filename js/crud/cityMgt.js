var db = require(".././db");
var crud = require("./crud");
var tripMgt = require("./tripMgt");

exports.crud = new crud.CRUDModule("city", 
	function(city, req) {
		return {
			text: "INSERT INTO city" +
				  " (trip_id, name, place_id, longitude, latitude, start_date, end_date)" + 
				  " VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING city_id",
			values: [req.params.trip_id, city.name, city.place_id, city.longitude, city.latitude, city.start_date, city.end_date]
		};
	},
	function(city_id) {
		return {
			text: "SELECT * FROM city " +
				  " WHERE city_id=$1",
			values: [city_id]
		};
	},
	function(city, req) {
		return {
			text: "UPDATE city SET" +
				  " name=$1, place_id=$2, longitude=$3, latitude=$4, start_date=$5, end_date=$6" +
				  " WHERE city_id=$7" +
				  " RETURNING city_id, trip_id, name, place_id, longitude, latitude, start_date, end_date",
			values: [city.name, city.place_id, city.longitude, city.latitude, city.start_date, city.end_date, req.params.city_id]
		};
	},
	function(city_id) {
		return {
			text: "DELETE FROM city WHERE city_id=$1",
			values: [city_id]
		};
	}
);

exports.crud.onMove = function(req, res) {
	var trip_id = req.params.trip_id;
	var city_id = req.params.city_id;
	var fromIndex = req.body.fromIndex;
	var toIndex = req.body.toIndex;

	if (fromIndex == toIndex || isNaN(fromIndex) || isNaN(toIndex)) { //Bad request
		res.status(400).end();
		return;
	}

	var sql = {
		text: "SELECT * FROM city WHERE city_id=$1 AND index=$2",
		values: [city_id, fromIndex]
	};
	db.query(sql, function(err, result) {
		if (err) {
			res.status(500).end();
		}
		else if (result.rows.length === 0)  { //Wrong fromIndex
			res.status(400).end();
		}
		else {
			completeMove(trip_id, city_id, fromIndex, toIndex, res);
		}
	})
};	

function completeMove(trip_id, city_id, fromIndex, toIndex, res) {
	var sql = [];
	if (fromIndex < toIndex) {
		sql.push({
			text: "UPDATE city SET index=index-1 " + 
				  " WHERE trip_id=$1 "  +
				  "   AND index>$2" +
				  "   AND index<=$3",
			values: [trip_id, fromIndex, toIndex]
		});
	}
	else {
		sql.push({
			text: "UPDATE city SET index=index+1 " +
				  " WHERE trip_id=$1 " + 
				  "   AND index>=$2" + 
				  "   AND index<$3",
			values: [trip_id, toIndex, fromIndex]
		});
	}

	sql.push({
		text: "UPDATE city SET index=$2 " + 
			  " WHERE city_id=$1 ",
		values: [city_id, toIndex]
	});

	db.query(sql, function(err, result) {
		if (err) {
			res.status(500).end();
			return;
		}

		console.log("Moved city " + city_id + " in trip " + trip_id + " from " + fromIndex + " to " + toIndex);
		res.status(200).end();
	});
}

exports.crud.onAll = function(req, res, next) {
	var city_id = req.params.city_id;
	if (isNaN(city_id)) {
		res.status(400).end();
		return;
	}

	next();
};

exports.crud.onReadCityLocations = function(req, res) {
	var city_id = req.params.city_id;
	var sql = {
		text: "SELECT * FROM city, location" +
			  " WHERE city.city_id=$1" + 
			  "   AND city.city_id=location.city_id" + 
			  " ORDER BY location.index",
		values: [city_id]
	};
	db.query(sql, function(err, result) {
		if (err) {
			console.log("Error reading city locations: city_id=" + city_id);
			console.log(err);
			res.status(500).end();
		}
		else {
			res.status(200).send(result.rows);
		}
	})
}