$.ajaxSetup({
	async: false
});


//Fence group tests
var sampleFenceGroup = {
	name: "TEST fence group",
	type: "Enter"
};
var updatedSampleFenceGroup = JSON.parse(JSON.stringify(sampleFenceGroup));
updatedSampleFenceGroup.name = "TEST updated fence group";

QUnit.test("fence_group tests", function(assert) {
	assert.expect(9);

	var done;
	done = assert.async();
	$.ajax({
		type: "POST",
		url: "/fence_group",
		data: {fence_group: sampleFenceGroup},
		success: function(data, textStatus, jqXHR) {
			sampleFenceGroup.fence_group_id = data.fence_group_id;
			updatedSampleFenceGroup.fence_group_id = data.fence_group_id;
		},
		complete: onAsyncComplete("fence_group create", done)
	});

	done = assert.async();
	$.ajax({
		type: "GET",
		url: "/fence_group/" + sampleFenceGroup.fence_group_id,
		complete: onAsyncComplete("fence_group read", done)
	});
	
	done = assert.async();
	$.ajax({
		type: "PUT",
		url: "/fence_group/" + sampleFenceGroup.fence_group_id,
		data: {fence_group: updatedSampleFenceGroup},
		success: function(data, textStatus, jqXHR) {
			QUnit.equal(data.name, updatedSampleFenceGroup.name, "Group fence name should be updated")
			sampleFenceGroup = data;
		},
		complete: onAsyncComplete("fence_group update", done)
	});


	done = assert.async();
	$.ajax({
		type: "DELETE",
		url: "/fence_group/" + sampleFenceGroup.fence_group_id,
		complete: onAsyncComplete("fence_group delete", done)
	});


	// Test getting all fence groups
	done = assert.async();
	$.ajax({
		type: "GET",
		url: "/fence_group/getAll",
		success: function(data, textStatus, jqXHR) {
			if (data.length > 0) {
				QUnit.equal(true, true, "Should have loaded at least one predefined fence group.");
			}
			else {
				QUnit.equal(true, false, "Should have loaded at least one predefined fence group.");
			}
		},
		complete: onAsyncComplete("fence_group getAll", done)
	});

	// Test getting all fences for a given group
	done = assert.async();
	$.ajax({
		type: "GET",
		url: "/fence_group/1/getFences",
		success: function(data, textStatus, jqXHR) {
			QUnit.equal(2, data.length, "Should have loaded two predefined fences for predefined fence group");
		},
		complete: onAsyncComplete("fence_group getFences", done)
	});

});


//Fence tests
var sampleFence = {
	lat: -1,
	lng: -1,
	radius: -1
};
var updatedSampleFence = JSON.parse(JSON.stringify(sampleFence));
updatedSampleFence.radius = -2;

QUnit.test("fence tests", function(assert) {
	assert.expect(5);

	var done;
	done = assert.async();
	$.ajax({
		type: "POST",
		url: "/fence_group/1/fence",
		data: {fence: sampleFence},
		success: function(data, textStatus, jqXHR) {
			sampleFence.fence_id = data.fence_id;
			updatedSampleFence.fence_id = data.fence_id;
		},
		complete: onAsyncComplete("fence create", done)
	});

	done = assert.async();
	$.ajax({
		type: "GET",
		url: "/fence_group/1/fence/" + sampleFence.fence_id,
		complete: onAsyncComplete("fence read", done)
	});
	
	done = assert.async();
	$.ajax({
		type: "PUT",
		url: "/fence_group/1/fence/" + sampleFence.fence_id,
		data: {fence: updatedSampleFence},
		success: function(data, textStatus, jqXHR) {
			QUnit.equal(data.radius, updatedSampleFence.radius, "fence radius should be updated")
			sampleFence = data;
		},
		complete: onAsyncComplete("fence update", done)
	});


	done = assert.async();
	$.ajax({
		type: "DELETE",
		url: "/fence_group/1/fence/" + sampleFence.fence_id,
		complete: onAsyncComplete("fence delete", done)
	});

});


var onAsyncComplete = function(text, done) {
    return function(jqXHR, textStatus) {
    	console.log("Ran: " + text);
		QUnit.equal(jqXHR.status, 200, text);
		done();
	};
}

