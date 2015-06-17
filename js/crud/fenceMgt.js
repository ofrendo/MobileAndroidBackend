var db = require(".././db");
var crud = require("./crud");

exports.crud = new crud.CRUDModule("fence", 
	function(fence, req) { // CREATE
		return {
			text: "INSERT INTO fence" +
				  " (fence_group_id, lat, lng, radius)" + 
				  " VALUES ($1, $2, $3, $4) RETURNING fence_id",
			values: [req.params.fence_group_id, fence.lat, fence.lng, fence.radius]
		};
	},
	function(fence_id) { // READ
		return {
			text: "SELECT * FROM fence " +
				  " WHERE fence_id=$1",
			values: [fence_id]
		}
	},
	function(fence, req) { // UPDATE
		return {
			text: "UPDATE fence SET" + 
			      " lat=$1, lng=$2, radius=$3" + 
			      " WHERE fence_id=$4" + 
			      " RETURNING fence_id, fence_group_id, lat, lng, radius",
			values: [fence.lat, fence.lng, fence.radius, req.params.fence_id]
		}
	},
	function(fence_id) { // DELETE
		return {
			text: "DELETE FROM fence" + 
			      " WHERE fence_id=$1",
			values: [fence_id]
		}
	}
);