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