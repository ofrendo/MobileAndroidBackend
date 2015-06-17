var db = require(".././db");
var crud = require("./crud");

exports.crud = new crud.CRUDModule("fence_group", 
	function(fence_group, req) { // CREATE
		return {
			text: "INSERT INTO fence_group" +
				  " (name)" + 
				  " VALUES ($1) RETURNING fence_group_id",
			values: [fence_group.name]
		};
	},
	function(fence_group_id) { // READ
		return {
			text: "SELECT * FROM fence_group " +
				  " WHERE fence_group_id=$1",
			values: [fence_group_id]
		}
	},
	function(fence_group, req) { // UPDATE
		return {
			text: "UPDATE fence_group SET" + 
			      " name=$1" + 
			      " WHERE fence_group_id=$2" + 
			      " RETURNING fence_group_id, name",
			values: [fence_group.name, req.params.fence_group_id]
		}
	},
	function(fence_group_id) { // DELETE
		return {
			text: "DELETE FROM fence_group" + 
			      " WHERE fence_group_id=$1",
			values: [fence_group_id]
		}
	}
);


exports.crud.onReadAllFenceGroups = function(req, res) {
	var sql = {
		text: "SELECT * FROM fence_group" + 
			  " ORDER BY fence_group_id",
		values : []
	};
	db.query(sql, function(err, result) {
		if (err) {
			console.log("Error reading all fence_groups");
			console.log(err);
			res.status(500).end();
		}
		else {
			console.log("Returning " + result.rows.length + " fences_groups");
			res.status(200).send(result.rows);
		}
	})
}


exports.crud.onReadFenceGroupComplete = function(req, res) {

	var fence_group_id = req.params.fence_group_id;
	var sql = {
		text: "SELECT * FROM fence_group, fence" +
			  " WHERE fence_group.fence_group_id=$1" + 
			  "   AND fence_group.fence_group_id=fence.fence_group_id" + 
			  " ORDER BY fence_group.fence_group_id",
		values: [fence_group_id]
	};
	db.query(sql, function(err, result) {
		if (err) {
			console.log("Error reading fence group complete: fence_group_id=" + city_id);
			console.log(err);
			res.status(500).end();
		}
		else {
			console.log("Returning " + result.rows.length + " fences for fence_group_id=" + fence_group_id);
			res.status(200).send(result.rows);
		}
	})

};