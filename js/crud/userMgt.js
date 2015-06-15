var emailValidator = require("email-validator");

var db = require(".././db");
var crud = require("./crud");
var sessionMgt = require(".././sessionMgt");

exports.crud = new crud.CRUDModule("user",
	function(user) {
		console.log("OnCreate user password:");
		console.log(user.password);
		return {
			text: "INSERT INTO users (email, phone, username, password, name) " +
				  " VALUES($1, $2, $3, crypt($4, gen_salt('bf', 8)), $5) " + 
				  " RETURNING user_id, email, phone, username, name",
			values: [user.email, user.phone, user.username, user.password, user.name]
		};
	},
	function(user_id) {
		return {
			text: "SELECT * FROM users WHERE user_id=$1",
			values: [user_id]
		};
	},
	function(user, req, user_id) {
		return {
			text: "UPDATE users SET email=$1, phone=$2, name=$3 " +
				  " WHERE user_id=$4" + 
				  " RETURNING user_id, email, phone, username, name",
			values: [user.email, user.phone, user.name, req.session.user.user_id]
		};
	},
	function(user_id) {
		return {
			text: "DELETE FROM users WHERE user_id=$1",
			values: [user_id]
		};
	}
);

exports.onCreateUser = function(req, res) { //called on register
	var user = req.body.user;

	//Need to check if user exists already
	doesUserExist(user, function(result) {
		if (result === false) {
			res.status(500).end();
			return;
		}

		if (!result.user_id) { //User does not exist
			exports.crud.onCreate(req, res);
		}
		else if (result.confirmed == false) { //User exists already and has not been confirmed
			var sql = {
				text: "UPDATE users SET email=$1, phone=$2, username=$3, password=crypt($4, gen_salt('bf', 8)), name=$5, confirmed=true " +
					  " WHERE user_id=$6" + 
					  " RETURNING user_id, email, phone, username, name",
				values: [user.email, user.phone, user.username, user.password, user.name, result.user_id]
			};
			db.query(sql, function(err, result) {
				if (err) {
					console.log("Error during confirming a user");
					console.log(err);
					res.status(500).end();
				}
				else if (result.rows.length == 0) {
					res.status(400).end();
				}
				else {
					user.user_id = result.rows[0].user_id;
					sessionMgt.setUser(req, user);
					res.send({"user_id": result.rows[0].user_id});
				}
			})
		}
		else {
			res.status(403).end();
		}
	});
}

exports.crud.beforeSQLCheckCreate = function(req, res, user) {
	return emailValidator.validate(user.email);
}

exports.crud.beforeSendCreate = function(req, res, user) {
	sessionMgt.setUser(req, user);
}
exports.crud.beforeSendRead = function(req, res, user) {
	delete user["password"];
}
exports.crud.beforeSQLCheckUpdate = function(req, res, user) {
	return req.session.user.user_id == user.user_id && user.password !== "";
}
exports.crud.beforeSendDelete = function(req, res) {
	sessionMgt.doLogout(req, res);
}

exports.crud.onAll = function(req, res, next) {
	var user_id = req.params.user_id;
	if (isNaN(user_id)) {
		res.status(400).send("");
		return;
	}
	if (req.params.user_id != req.session.user.user_id) {
		res.status(403).send("");
		return;
	}
	next();
};

exports.crud.handleAddUser = function(user, callback) {
	//Need to check if user exists first
	//User must include at least one of the following: 
	//email, phone, username
	if (!user.phone && !user.email && !user.username) {
		callback(false);
		return;
	}

	doesUserExist(user, function(result) {
		if (result.user_id) {
			callback(result.user_id);
		}
		else {
			addPreUser(user, callback);
		}
	});
};

function doesUserExist(user, callback) {
	var sql = {
		text: "SELECT * FROM users " +
			  " WHERE email=$1" + 
			  "    OR phone=$2" + 
			  "    OR username=$3" +
			  " LIMIT 1",
		values: [user.email, user.phone, user.username]
	};

	db.query(sql, function(err, result) {
		if (err) {
			console.log("Error checking for user exist");
			console.log(err);
			callback(false);
		}
		else {
			if (result.rows.length === 1) {
				//User exists already
				callback(result.rows[0]);
			}
			else{
				//User does not exist: Need to add a new user with what data we have
				callback({});
			}
		}
	})
}

function addPreUser(user, callback) {
	var sql = {
		text: "INSERT INTO users " +
			  " (email, phone, username, name, confirmed) " + 
			  " VALUES ($1, $2, $3, $4, false)" +
			  " RETURNING user_id",
		values: [user.email, user.phone, user.username, user.name]
	};
	db.query(sql, function(err, result) {
		if (err) {
			console.log("Error adding pre user");
			console.log(err);
			callback(false);
		}
		else {
			callback(result.rows[0].user_id);
		}
	});
}

function doLogin(username, password, callback) {
	var sql = {
		text: "SELECT * FROM users WHERE username=$1 " + 
			  " AND password=crypt($2, password)",
		values: [username, password]
	};
	db.query(sql, callback);
}
exports.onLogin = function(req, res) { //login
	if (sessionMgt.isLoggedIn(req) && !req.body.username && !req.body.password) {
		//Already logged in
		console.log("User already logged in.");
		res.status(200).send(req.session.user);
	}
	else {
		var username = req.body.username;
		var password = req.body.password;
		doLogin(username, password, function(err, result) {
			if (err || result.rows.length === 0) {
				res.status(400).send("");
			}
			else {
				console.log("Logging user in:");
				console.log(result.rows[0]);
				sessionMgt.setUser(req, result.rows[0]);
				res.status(200).send(req.session.user);
			}
		});
	}
};

exports.crud.onChangePassword = function(req, res) {
	var newPassword = req.body.password;
	console.log("Changing user password: " + newPassword);

	var sql = {
		text: "UPDATE users SET password=crypt($1, gen_salt('bf', 8)) " + 
			  " WHERE user_id=$2",
		values: [newPassword, req.session.user.user_id]
	};
	db.query(sql, function(err, result) {
		if (err) {
			console.log("Error changing user password");
			console.log(err);
			res.status(500).end();
		}
		else {
			res.status(200).end();
		}
	});
}

exports.onLogout = function(req, res) { //logout
	sessionMgt.doLogout(req);
	res.status(200).send("");
}

/*
var userMgt = exports;

userMgt.createUser = function(user, callback) {
	var sql = {
		text: "INSERT INTO users (email, username, password, name) " +
			  " VALUES($1, $2, crypt($3, gen_salt('bf', 8)), $4) " + 
			  " RETURNING user_id",
		values: [user.email, user.username, user.password, user.name]	
	};
	db.query(sql, callback);
}

userMgt.getUser = function(user_id, callback) {
	var sql = {
		text: "SELECT * FROM users WHERE user_id=$1",
		values: [user_id]
	}
	db.query(sql, callback);
}

userMgt.updateUser = function(user, callback) {
	var sql = {
		text: "UPDATE users SET email=$1, username=$2, password=crypt($3, password), name=$4 WHERE user_id=$5",
		values: [user.email, user.username, user.password, user.name, user.user_id]
	};
	db.query(sql, callback);
}

userMgt.deleteUser = function(user_id, callback) {
	var sql = {
		text: "DELETE FROM users WHERE user_id=$1",
		values: [user_id]
	}
	db.query(sql, callback);
}

userMgt.doLogin = function(username, password, callback) {
	var sql = {
		text: "SELECT * FROM users WHERE username=$1 " + 
			  " AND password=crypt($2, password)",
		values: [username, password]
	};
	db.query(sql, callback);
}
userMgt.onLogin = function(req, res) { //login
	if (sessionMgt.isLoggedIn(req)) {
		//Already logged in
		console.log("User already logged in.");
		res.status(200).send(req.session.user);
	}
	else {
		var username = req.body.username;
		var password = req.body.password;
		userMgt.doLogin(username, password, function(err, result) {
			if (err || result.rows.length === 0) {
				res.status(400).send("");
			}
			else {
				console.log("Logging user in:");
				console.log(result.rows[0]);
				sessionMgt.setUser(req, result.rows[0]);
				res.status(200).send(req.session.user);
			}
		});
	}
};

userMgt.onLogout = function(req, res) { //logout
	sessionMgt.doLogout(req);
	res.status(200).send("");
}

userMgt.onCreateUser = function(req, res) { 
	//create a user, send back the ID it was created with
	userMgt.createUser(req.body.user, function(err, result) {
		if (err) {
			res.status(500).send(JSON.stringify({message: "Error during user creation."}));
			console.log("Error during user creation:");
			console.log(err);
		}
		else {
			console.log("Created user:");
			console.log(result.rows[0]);
			var user = req.body.user;
			user.user_id = result.rows[0].user_id;
			sessionMgt.setUser(req, user);
			res.send(user.user_id);
		}
	});
}

userMgt.onUserCRUD = function(req, res, next) {
	var user_id = req.params.user_id;
	if (isNaN(user_id)) {
		res.status(400).send("");
		return;
	}
	if (req.params.user_id != req.session.user.user_id) {
		res.status(403).send("");
		return;
	}
	next();
}

userMgt.onGetUser = function(req, res) { //get information about a certain user
	var user_id = req.params.user_id;
	console.log(req.url);
	console.log("Retrieving user info for ID: " + user_id);
	userMgt.getUser(user_id, function(err, result) {
		if (result.rows.length === 1) {
			var userData = result.rows[0];
			delete userData["password"];
			res.send(userData);
		}
		else {
			res.status(404).send("");
		}
		
	});
}

userMgt.onUpdateUser = function(req, res) {
	var newUser = req.body.user;
	if (newUser.user_id != req.session.user.user_id) { //need to check if user  being sent is actually the own user
		res.status(403).send("");
		return;
	}

	userMgt.updateUser(newUser, function(err, result) {
		if (err) {
			res.status(500).send("");
		}
		else {
			res.send(newUser);
		}
	});
}

userMgt.onDeleteUser = function(req, res) {
	var user_id = req.session.user.user_id;
	userMgt.deleteUser(user_id, function(err, result) {
		console.log("Result user delete:");
		console.log(result);
		if (result.rowCount === 1) {
			sessionMgt.doLogout(req);
			res.status(200).send("");
		}
		else {
			res.status(500).send("");
		}
	});
}

exports.userMgt = userMgt;
*/



