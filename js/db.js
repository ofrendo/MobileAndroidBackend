var pg = require("pg");

var db = exports;

var dbUrl = (process.env.PORT) ? //if port is defined its on heroku server
			process.env.DATABASE_URL :
			"postgres://postgres:root@localhost:5432/localDB";

console.log("Using database: ");
console.log(dbUrl);

var query = function(sqlQuery, cb) {
	pg.connect(dbUrl, function(err, client, done) {
		if (err) {
			console.log("Error during connect:");
			console.log(err);
		}

		if (sqlQuery instanceof Array) { //Batch processing
			processBatch(client, sqlQuery, 0, done, cb);
		}
		else { //Single query
			client.query(sqlQuery, function(err, result) {
				done();
				if (typeof(cb) == "function") cb(err, result);
			});
		}
	});
}
db.query = query;

//Processes a batch of sql queries sequentially
function processBatch(client, array, i, done, cb) {
	if (i === array.length-1) {
		client.query(array[i], function(err, result) {
			done();
			if (typeof(cb) == "function") cb(err, result);
		});
		return;
	}
	client.query(array[i], function(err, result) {
		if (err) {
			done();
			if (typeof(cb) == "function") cb(err, result);
		}
		else {
			processBatch(client, array, i+1, done, cb);
		}
	});
}

db.createTestTable = function(callback) {
	query("CREATE TABLE test (num SERIAL, name varchar(20))", function(error, result) {
		if (typeof(callback) == "function") callback();
	});
};

db.insertTestTable = function (callback) {
	query("INSERT INTO test (name) VALUES('Hello world!')", function(error, result) {
		console.log("TEST insert:");
		console.log(result);
		if (typeof(callback) == "function") callback();
	});
};

db.readTestTable = function(callback) {
	query("SELECT MAX(num) FROM test", function(error, result) {
		console.log("TEST read:");
		console.log(result);
		if (typeof(callback) == "function") callback(result);
	});
	//returns something like this:
	//{"command":"SELECT","rowCount":1,"oid":null,"rows":[{"max":8}],
	//"fields":[{"name":"max","tableID":0,"columnID":0,"dataTypeID":23,
	//"dataTypeSize":4,"dataTypeModifier":-1,"format":"text"}],"_parsers":[null],"rowAsArray":false}
}	

exports.db = db;