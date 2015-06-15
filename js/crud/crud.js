var db = require(".././db");

exports.CRUDModule = function(objectName, getSqlCreate, getSqlRead, getSqlUpdate, getSqlDelete) {
	var self = this;
	this.objectName = objectName;
	this.objectIDName = objectName + "_id";

	function doCreate(object, req, callback) {
		doQuery(getSqlCreate(object, req), callback);
	}	
	function doRead(object_id, callback) {
		doQuery(getSqlRead(object_id), callback);
	}
	function doUpdate(object, req, callback) {
		doQuery(getSqlUpdate(object, req), callback);
	}
	function doDelete(object_id, req, callback) {
		doQuery(getSqlDelete(object_id, req), callback);
	}

	function doQuery(sql, callback) {
		if (sql instanceof Array) {
			for (var i = 0; i < sql.length; i++) {

				if (i !== sql.length-1) 
					db.query(sql[i]);	
				else 
					db.query(sql[i], callback);
				
			}
		}
		else {
			db.query(sql, callback);
		}
	}

	//Creates an object in the database and sends back the ID it was created with
	this.onCreate = function(req, res) {
		if (typeof(self.beforeSQLCheckCreate) == "function") {
			if (self.beforeSQLCheckCreate(req, res, req.body[objectName]) == false) {
				res.status(400).end();
				return;
			}
		}

		doCreate(req.body[self.objectName], req, function(err, result) {
			if (err) {
				res.status(500).send(JSON.stringify({message: "Error during " + self.objectName + " creation."}));
				console.log("Error during " + self.objectName + " creation:");
				console.log(req.body[self.objectName]);
				console.log(err);
			}
			else {
				console.log("Created " + self.objectName + ":");
				console.log(result.rows[0]);
				var object = req.body[self.objectName];
				object[self.objectIDName] = result.rows[0][self.objectIDName];
				
				if (typeof(self.beforeSendCreate) == "function") self.beforeSendCreate(req, res, object); 
				
				var result = {};
				result[self.objectIDName] = object[self.objectIDName];
				res.status(200).send(result);
			}
		});
	}
	this.onRead = function(req, res) {
		doRead(req.params[self.objectIDName], function(err, result) {
			if (err) {
				res.status(500).send(JSON.stringify({message: "Error during " + self.objectName + " get."}));
				console.log("Error during " + self.objectName + " get:");
				console.log(err);
				return;
			}

			if (result.rows.length === 1) {
				var object = result.rows[0];
				
				if (typeof(self.beforeSendRead) == "function") self.beforeSendRead(req, res, object); 

				res.status(200).send(object);
			}
			else {
				res.status(404).end();
			}
		});
	}
	this.onUpdate = function(req, res, ignoreBeforeSQLCheck) {
		if (typeof(self.beforeSQLCheckUpdate) == "function") {
			if (self.beforeSQLCheckUpdate(req, res, req.body[self.objectName]) == false) {
				res.status(403).send({message: "Forbidden"});
				return;
			}
		}
		doUpdate(req.body[self.objectName], req, function(err, result) {
			if (err) {
				res.status(500).send(JSON.stringify({message: "Error during " + self.objectName + " update."}));
				console.log("Error during " + self.objectName + " update:");
				console.log(err);
			}
			else {
				var object = result.rows[0];

				if (typeof(self.beforeSendUpdate) == "function") self.beforeSendUpdate(req, res, object); 

				res.send(object);				
			}
		});
	}
	this.onDelete = function(req, res) {
		doDelete(req.params[self.objectIDName], req, function(err, result) {
			if (err || result.rowCount !== 1) {
				res.status(500).send(JSON.stringify({message: "Error during " + self.objectName + " delete."}));
				console.log("Error during " + self.objectName + " delete:");
				console.log(err);
			}
			else {
				if (result.rowCount === 1) {
					console.log("Deleted " + self.objectName);
					if (typeof(self.beforeSendDelete) == "function") self.beforeSendDelete(req, res, req.params[self.objectIDName]); 
					res.status(200).end();
				}
			}
		});
	}
}