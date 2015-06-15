var crud = require("./crud");
var tripMgt = require("./tripMgt");
var db = require(".././db");

exports.crud = new crud.CRUDModule("location", 
	function(location, req) {
		return buildSqlInsert(location, req);
	},
	function(location_id) {
		return {
			text: "SELECT * FROM location " +
				  " WHERE location_id=$1",
			values: [location_id]
		};
	},
	function(location, req) {
		return {
			text: "UPDATE location SET" +
				  " name=$1, place_id=$2, category=$3, longitude=$4, latitude=$5, start_date=$6, end_date=$7" + 
				  " WHERE location_id=$8" +
				  " RETURNING *",
			values: [location.name, location.place_id, location.category, location.longitude,
					 location.latitude, location.start_date, location.end_date,
					 req.params.location_id]
		};
	},
	function(location_id) {
		return {
			text: "DELETE FROM location WHERE location_id=$1",
			values: [location_id]
		};
	}
);

function buildSqlInsert(location, req) {
	return {
		text: "INSERT INTO location" +
			  " (city_id, name, place_id, category, longitude, latitude, start_date, end_date)" +
			  " VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING location_id",
		values: [req.params.city_id, location.name, location.place_id, location.category, location.longitude,
				 location.latitude, location.start_date, location.end_date]
	};
}

exports.crud.onCreateLocation = function(req, res) {
	if (req.body.locations instanceof Array) {
		//Means multiple locations have been passed in for creation
		var queries = [];
		for (var i = 0; i < req.body.locations.length; i++) {
			var location = req.body.locations[i];
			queries.push(buildSqlInsert(location, req));
		}
		db.query(queries, function(err, result) {
			if (err) {
				console.log("Error creating multiple locations:");
				console.log(err),
				res.status(500).end();
			}
			else {
				res.status(200).end();
			}
		})
	}
	else {
		//Means only one location to be created
		exports.crud.onCreate(req, res);
	}
};

exports.crud.onChangeLocationIndexes = function(req, res) {
	var changedLocations = req.body.locations;
	var queries = [];
	for (var i = 0; i < changedLocations.length; i++) {
		queries.push({
			text: "UPDATE location " + 
			      "   SET index=$1" + 
			      " WHERE location_id=$2",
			values: [parseInt(changedLocations[i].newIndex), parseInt(changedLocations[i].location_id)]
		});
		console.log(queries[i]);
	}
	db.query(queries, function(err, result) {
		if (err) {
			console.log("Error during changing location indexes");
			console.log(err),
			res.status(500).end();
		}
		else {
			res.status(200).end();
		}
	});	
}

exports.crud.onMove = function(req, res) {
	var city_id = req.params.city_id;
	var location_id = req.params.location_id;
	var fromIndex = req.body.fromIndex;
	var toIndex = req.body.toIndex;

	if (fromIndex == toIndex || isNaN(fromIndex) || isNaN(toIndex)) { //Bad request
		res.status(400).end();
		return;
	}

	var sql = {
		text: "SELECT * FROM location WHERE location_id=$1 AND index=$2",
		values: [location_id, fromIndex]
	};
	db.query(sql, function(err, result) {
		if (err) {
			console.log("Error moving location:");
			console.log(err);
			res.status(500).end();
		}
		else if (result.rows.length === 0)  { //Wrong fromIndex
			res.status(400).end();
		}
		else {
			completeMove(city_id, location_id, fromIndex, toIndex, res);
		}
	})
};	


function completeMove(city_id, location_id, fromIndex, toIndex, res) {
	var sql = [];
	if (fromIndex < toIndex) {
		sql.push({
			text: "UPDATE location SET index=index-1 " + 
				  " WHERE city_id=$1 "  +
				  "   AND index>$2" +
				  "   AND index<=$3",
			values: [city_id, fromIndex, toIndex]
		});
	}
	else {
		sql.push({
			text: "UPDATE location SET index=index+1 " +
				  " WHERE city_id=$1 " + 
				  "   AND index>=$2" + 
				  "   AND index<$3",
			values: [city_id, toIndex, fromIndex]
		});
	}

	sql.push({
		text: "UPDATE location SET index=$2 " + 
			  " WHERE location_id=$1 ",
		values: [location_id, toIndex]
	});

	db.query(sql, function(err, result) {
		if (err) {
			res.status(500).end();
			return;
		}

		console.log("Moved location " + location_id + " in city " + city_id + " from " + fromIndex + " to " + toIndex);
		res.status(200).end();
	});
}


exports.crud.onAll = function(req, res, next) {
	var location_id = req.params.location_id;
	if (isNaN(location_id)) {
		res.status(400).end();
		return;
	}

	next();
}