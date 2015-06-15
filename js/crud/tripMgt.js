var db = require(".././db");
var crud = require("./crud");
var utils = require(".././utils");
var userMgt = require("./userMgt");

exports.crud = new crud.CRUDModule("trip",
	function(trip, req) {
		return {
			text: "INSERT INTO trip (name, created_by, start_date, end_date) " +
				  " VALUES ($1, $2, $3, $4) RETURNING trip_id",
			values: [trip.name, req.session.user.user_id, trip.start_date, trip.end_date]
		};
	},
	function(trip_id) {
		return {
			text: "SELECT * FROM trip WHERE trip_id=$1",
			values: [trip_id]
		}
	},
	function(trip, req) {
		return {
			text: "UPDATE trip SET name=$1, start_date=$2, end_date=$3 " +
				  " WHERE trip_id=$4" +
				  " RETURNING *",
			values: [trip.name, trip.start_date, trip.end_date, req.params.trip_id]
		};
	},
	function(trip_id, req) {
		return [{
			text: "DELETE FROM user_trip WHERE user_id=$1 AND trip_id=$2",
			values: [req.session.user.user_id, trip_id]
		},
		{
			text: "DELETE FROM trip WHERE trip_id=$1",
			values: [trip_id]
		}];
	}
);

exports.crud.beforeSendCreate = function(req, res, trip) {
	var sql = {
		text: "INSERT INTO user_trip (user_id, trip_id) VALUES ($1, $2)",
		values: [req.session.user.user_id, trip.trip_id]
	};
	db.query(sql);
};

exports.crud.onAll = function(req, res, next) {
	var trip_id = req.params.trip_id;
	if (isNaN(trip_id)) {
		res.status(400).end();
		return;
	}

	//Check if user is allowed to read/update/delete trip
	exports.isUserAllowed(req.session.user.user_id, trip_id, function(result, status) {
		if (result === false) {
			res.status(status).end();
		}
		else {
			next();
		}
	})
};

exports.isUserAllowed = function(user_id, trip_id, callback) {
	var sql = {
		text: "SELECT * FROM user_trip WHERE user_id=$1 AND trip_id=$2",
		values: [user_id, trip_id]
	}
	db.query(sql, function(err, result) {
		if (err) {
			console.log("Error operating on certain trip:");
			console.log(err);
			callback(false, 500);
		}
		else {
			if (result.rows.length === 1) {
				callback(true);
			}
			else {
				console.log("User tried to retrieve forbidden trip:");
				console.log(sql.values);
				callback(false, 403);
			}
		}
	});
}

exports.crud.onReadUserTrips = function(req, res) {
	var sql = {
		text: "SELECT *, " +
			  "  (SELECT COUNT(*) FROM user_trip WHERE user_trip.trip_id = trip.trip_id) AS no_participants, " +
			  "  (SELECT COUNT(*) FROM city where city.trip_id = trip.trip_id) AS no_cities " + 	
			  "    FROM user_trip, trip " +
			  "    WHERE user_trip.user_id=$1 " +
			  "      AND user_trip.trip_id = trip.trip_id " +
			  "  ORDER BY user_trip.index",
		values: [req.session.user.user_id] 
	};
	db.query(sql, function(err, result) {
		if (err) {
			console.log("Error reading user trips:");
			console.log(err);
			res.status(500).end();
		}
		else {
			res.status(200).send(result.rows);
		}
	});
};

exports.crud.onMove = function(req, res) {
	var user_id = req.session.user.user_id;
	var trip_id = req.params.trip_id;
	var fromIndex = req.body.fromIndex;
	var toIndex = req.body.toIndex;

	if (fromIndex == toIndex || isNaN(fromIndex) || isNaN(toIndex)) { //Bad request
		console.log("Invalid fromIndex/toIndex");
		res.status(400).end();
		return;
	}

	var sql = { //Check if valid fromIndex to make sure frontend has non-stale data
		text: "SELECT * FROM user_trip " +
			  " WHERE user_id=$1" +
			  "   AND trip_id=$2" +
			  "   AND index=$3",
		values: [user_id, trip_id, fromIndex]
	};
	db.query(sql, function(err, result) {
		if (err) {
			res.status(500).end();
		}
		else if (result.rows.length === 0)  { //Wrong fromIndex
			console.log("Wrong fromIndex, no db entry found");
			res.status(400).end();
		}
		else {
			completeMove(user_id, trip_id, fromIndex, toIndex, res);
		}
	})
};	

function completeMove(user_id, trip_id, fromIndex, toIndex, res) {
	var sql = [];
	if (fromIndex < toIndex) {
		sql.push({
			text: "UPDATE user_trip SET index=index-1 " + 
				  " WHERE user_id=$1 "  +
				  "   AND index>$2" +
				  "   AND index<=$3",
			values: [user_id, fromIndex, toIndex]
		});
	}
	else {
		sql.push({
			text: "UPDATE user_trip SET index=index+1 " +
				  " WHERE user_id=$1 " + 
				  "   AND index>=$2" + 
				  "   AND index<$3",
			values: [user_id, toIndex, fromIndex]
		});
	}

	sql.push({
		text: "UPDATE user_trip SET index=$3 " + 
			  " WHERE user_id=$1 " + 
			  "   AND trip_id=$2",
		values: [user_id, trip_id, toIndex]
	});

	db.query(sql, function(err, result) {
		if (err) {
			res.status(500).end();
			return;
		}

		console.log("Moved trip " + trip_id + " for user " + user_id + " from " + fromIndex + " to " + toIndex);
		res.status(200).end();
	});
}


exports.crud.onReadTripUsers = function(req, res) {
	var trip_id = req.params.trip_id;
	var sql = {
		text: "SELECT users.user_id, users.username, users.name, users.email, users.confirmed" +
			  "  FROM users, user_trip, trip" +
			  " WHERE trip.trip_id=$1" + 
			  "   AND trip.trip_id=user_trip.trip_id" + 
			  "   AND user_trip.user_id=users.user_id",
		values: [trip_id]
	};
	db.query(sql, function(err, result) {
		if (err) {
			console.log("Error reading trip users: trip_id=" + trip_id);
			console.log(err);
			res.status(500).end();
		}
		else {
			for (var i =  0; i < result.rows.length; i++) {
				utils.setAvatar(result.rows[i], utils.md5(result.rows[i].email));
			}
			res.status(200).send(result.rows);
		}
	});
};

exports.crud.onAddUserToTrip = function(req, res) {
	var trip_id = req.params.trip_id;
	var user = req.body.user;
	userMgt.crud.handleAddUser(user, function(user_id) {
		if (user_id === false) {
			res.status(500).end();
			return;
		}

		var sql = {
			text: "INSERT INTO user_trip (user_id, trip_id) " + 
				  " VALUES ($1, $2)",
			values: [user_id, trip_id]
		};
		db.query(sql, function(err, result) {
			if (err) {
				console.log("Error adding user to trip");
				console.log(err);
				res.status(500).end();
			}
			else {
				res.status(200).end();
			}
		});
	});
};

exports.crud.onRemoveUserFromTrip = function(req, res) {
	var user_id = req.body.user.user_id;
	var trip_id = req.params.trip_id;
	var sql = {
		text: "DELETE FROM user_trip " + 
			  " WHERE user_id=$1" + 
			  "   AND trip_id=$2",
		values: [user_id, trip_id]
	};
	db.query(sql, function(err, result) {
		if (err) {
			console.log("Error removing user from trip");
			console.log(err);
			res.status(500).end();
		}
		else {
			res.status(200).end();
		}
	});
}

exports.crud.onReadTripCities = function(req, res) {
	var trip_id = req.params.trip_id;
	var sql = {
		text: "SELECT *, (SELECT COUNT(*) FROM location WHERE location.city_id = city.city_id) AS no_locations" + 
			  " FROM trip, city" + 
			  " WHERE trip.trip_id=$1" + 
			  "   AND trip.trip_id=city.trip_id" + 
			  " ORDER BY city.index",
		values: [trip_id]
	};
	db.query(sql, function(err, result) {
		if (err) {
			console.log("Error reading trip cities: trip_id=" + trip_id);
			console.log(err);
			res.status(500).end();
		}
		else {
			res.status(200).send(result.rows);
		}
	});
};