//User tests
var sampleUser = {
	email: "hello@wor.ld",
	username: "helloWorld",
	password: "helloPass",
	name: "Hello World"
};
var updatedSampleUser = JSON.parse(JSON.stringify(sampleUser));
updatedSampleUser.email = "updated@email.de";

$.ajaxSetup({
	async: false
});

QUnit.test("User tests", function(assert) {
	assert.expect(9);

	var done;
	done = assert.async();
	$.ajax({
		type: "POST",
		url: "/user",
		data: {user: sampleUser},
		complete: onAsyncComplete("User create", done)
	});

	done = assert.async();
	$.ajax({
		type: "POST",
		url: "/auth/logout",
		complete: onAsyncComplete("User logout", done)
	});
	
	done = assert.async();
	$.ajax({
		type: "POST",
		url: "/auth/login",
		data: {
			username: sampleUser.username,
			password: sampleUser.password
		},
		success: function(data, textStatus, jqXHR) {
			sampleUser.user_id = data.user_id;
			updatedSampleUser.user_id = data.user_id;
		},
		complete: onAsyncComplete("User login", done)
	});

	done = assert.async();
	$.ajax({
		type: "GET",
		url: "/user/" + sampleUser.user_id,
		complete: onAsyncComplete("User get info", done)
	});

	done = assert.async();
	$.ajax({
		type: "PUT",
		url: "/user/" + sampleUser.user_id,
		data: {user: updatedSampleUser},
		success: function(data, textStatus, jqXHR) {
			QUnit.equal(data.email, updatedSampleUser.email, "Email should be updated");
			sampleUser = data;
		},
		complete: onAsyncComplete("User update info", done)
	});

	done = assert.async();
	$.ajax({
		type: "PUT",
		url: "/user/" + sampleUser.user_id + "/changePassword",
		data: {password: "newPassword"},
		complete: onAsyncComplete("User update password", done)
	});

	done = assert.async();
	$.ajax({
		type: "DELETE",
		url: "/user/" + sampleUser.user_id,
		complete: onAsyncComplete("User delete", done)
	});
	
	done = assert.async();
	$.ajax({
		type: "POST",
		url: "/auth/logout",
		complete: onAsyncComplete("User logout", done)
	});
});

var testUser = {
	username: "test_user",
	password: "un1tt3st1ng"
};

QUnit.test("Chat tests", function(assert) {
	assert.expect(6);

	var doneLogin = assert.async();
	var doneConnect = assert.async();
	var doneRoomJoin = assert.async();
	var doneMessageSent = assert.async();
	var doneRoomLeave = assert.async();
	var doneLogout = assert.async();

	$.ajax({
		type: "POST",
		url: "/auth/login",
		data: {
			username: testUser.username,
			password: testUser.password
		},
		success: function(data, textStatus, jqXHR) {
			var socket = io.connect({ 
				reconnection: false
			});

			socket.on("room.previousMessages", function(previousMessages) {
				console.log("Chat room joined with previousMessages:");
				console.log(previousMessages);
				assert.ok(previousMessages instanceof Array, "Chat room joined");
				doneRoomJoin();

				//Send a message
				var message = {msg_text: "Unit testing chat."};
				socket.emit("msg.send", message);
			});
			socket.on("msg.sent", function() {
				console.log("Chat message sent and recieved");
				assert.ok(true, "Chat message sent and recieved");
				doneMessageSent();
				
				//Leave the room and disconnect
				socket.emit("room.leave");
			});
			socket.on("room.left", function() {
				console.log("Chat room left");
				assert.ok(true, "Chat room left");
				doneRoomLeave();

				//socket.disconnect();

				//Logout at the end
				$.ajax({
					type: "POST",
					url: "/auth/logout",
					complete: onAsyncComplete("Test user logout", doneLogout)
				});
			});

			socket.on("connect", function() {
				assert.ok(true, "Connected to backend");
				doneConnect();

				//Join a room
				var testRoom = {trip_id: 1};
				socket.emit("room.join", testRoom);
			});

		},
		complete: onAsyncComplete("Test user login", doneLogin)
	});
});

var sampleTrip = {
	name: "Test trip",
	start_date: (new Date()).toISOString()
};
var updatedSampleTrip = JSON.parse(JSON.stringify(sampleTrip));
updatedSampleTrip.name = "Updated test trip";

QUnit.test("Trip tests", function(assert) {
	assert.expect(19);

	var done;
	done = assert.async();
	$.ajax({
		type: "POST",
		url: "/auth/login",
		data: {
			username: testUser.username,
			password: testUser.password
		},
		success: function(data) {
			testUser.user_id = data.user_id;
		},
		complete: onAsyncComplete("Test user login", done)
	});

	done = assert.async();
	$.ajax({
		type: "POST",
		url: "/trip",
		data: {trip: sampleTrip},
		success: function(data, textStatus, jqXHR) { //data will be trip_id
			assert.ok(data.trip_id >= 0, "Created trip_id should be an integer: " + data.trip_id);
			sampleTrip.trip_id = data.trip_id;
			updatedSampleTrip.trip_id = data.trip_id;
		},
		complete: onAsyncComplete("Trip create", done)
	});

	done = assert.async();
	$.ajax({
		type: "PUT",
		url: "/trip/" + updatedSampleTrip.trip_id,
		data: {trip: updatedSampleTrip},
		success: function(data, textStatus, jqXHR) {
			assert.ok(data.name == updatedSampleTrip.name, "trip.name should be updated");
			sampleTrip.name = data.name;
		},
		complete: onAsyncComplete("Trip update", done)
	});

	done = assert.async();
	$.ajax({
		type: "PUT",
		url: "/trip/" + sampleTrip.trip_id + "/addUser",
		data: {user: {email: "test_user2@gmail.com"}},
		complete: onAsyncComplete("Trip add user", done)
	});

	done = assert.async();
	$.ajax({
		type: "PUT",
		url: "/trip/" + sampleTrip.trip_id + "/removeUser",
		data: {user: {user_id: 2}},
		complete: onAsyncComplete("Trip remove user", done)
	});

	done = assert.async();
	$.ajax({
		type: "GET",
		url: "/trip/" + sampleTrip.trip_id,
		success: function(data, textStatus, jqXHR) {
			var updated = sampleTrip.name == data.name;
			assert.ok(updated, "GET should return the same data");
		},
		complete: onAsyncComplete("Trip get", done)
	});

	done = assert.async();
	$.ajax({
		type: "GET",
		url: "/trip/1/users",
		success: function(data) {
			assert.ok(data.length>=0, "Should return an array of users");
		},
		complete: onAsyncComplete("Trip get users", done)
	});

	done = assert.async();
	$.ajax({
		type: "GET",
		url: "/user/" + testUser.user_id + "/trips",
		success: function(data, textStatus, jqXHR) {
			assert.ok(data.length >= 1, "Should return an array of trips")
		},
		complete: onAsyncComplete("Trip get all for user", done)
	});

	//Try moving index of trips
	done = assert.async();
	$.ajax({
		type: "PUT",
		url: "/trip/2/move",
		data: {
			fromIndex: 2,
			toIndex: 3
		},
		complete: onAsyncComplete("Trip move (change index)", done)
	});
	//Check index of other trip to make sure it was changed too
	done = assert.async();
	$.ajax({
		type: "GET",
		url: "/user/1/trips",
		success: function(data, textStatus, jqXHR) {
			var trips = data;
			assert.ok(data[1].index == 2 && data[1].trip_id==3, "Should have changed the index of the previously last trip")
		},
		complete: onAsyncComplete("Get updated index of trip", done)
	});
	//Move it back
	done = assert.async();
	$.ajax({
		type: "PUT",
		url: "/trip/2/move",
		data: {
			fromIndex: 3,
			toIndex: 2
		},
		complete: onAsyncComplete("Trip move (change index) back", done)
	});

	done = assert.async();
	$.ajax({
		type: "DELETE",
		url: "/trip/" + sampleTrip.trip_id,
		complete: onAsyncComplete("Trip delete", done)
	});

	done = assert.async();
	$.ajax({
		type: "POST",
		url: "/auth/logout",
		complete: onAsyncComplete("Test user logout", done)
	});

});

var sampleCity = {
	trip_id: 1,
	name: "Unit test city",
	place_id: -1, 
	longitude: -1, 
	latitude: -1, 
	start_date: (new Date()).toISOString(),
	end_date: (new Date()).toISOString(),
	ranking: 1
};
var updatedSampleCity = JSON.parse(JSON.stringify(sampleCity));
updatedSampleCity.name = "Updated unit test city";

QUnit.test("City tests", function(assert) {
	assert.expect(15);

	var done;
	done = assert.async();
	$.ajax({
		type: "POST",
		url: "/auth/login",
		data: {
			username: testUser.username,
			password: testUser.password
		},
		success: function(data) {
			testUser.user_id = data.user_id;
		},
		complete: onAsyncComplete("Test user login", done)
	});

	//Read cities for test trip
	done = assert.async();
	$.ajax({
		type: "GET", 
		url: "/trip/1/cities",
		success: function(data) {
			assert.ok(data.length >= 0, "cities for test trip should be an array");
		},
		complete: onAsyncComplete("Get cities for test trip", done)
	});

	//Use test trip with id=1 as parent and create new city
	done = assert.async();
	$.ajax({
		type: "POST",
		url: "/trip/1/city",
		data: {city: sampleCity},
		success: function(data) {
			assert.ok(data.city_id >= 0, "city_id should be an integer");
			sampleCity.city_id = data.city_id;
			updatedSampleCity.city_id = data.city_id;
		},
		complete: onAsyncComplete("Create city", done)
	});

	done = assert.async();
	$.ajax({
		type: "PUT",
		url: "/trip/1/city/" + updatedSampleCity.city_id,
		data: {city: updatedSampleCity},
		success: function(data, textStatus, jqXHR) {
			assert.ok(data.name == updatedSampleCity.name, "city.name should be updated");
			sampleCity.name = data.name;
		},
		complete: onAsyncComplete("City update", done)
	});

	done = assert.async();
	$.ajax({
		type: "GET",
		url: "/trip/1/city/" + sampleCity.city_id,
		success: function(data, textStatus, jqXHR) {
			assert.ok(data.city_id == sampleCity.city_id, "Should return the correct city")
		},
		complete: onAsyncComplete("City get", done)
	});

	//Try moving index of cities
	done = assert.async();
	$.ajax({
		type: "PUT",
		url: "/trip/1/city/2/move",
		data: {
			fromIndex: 2,
			toIndex: 3
		},
		complete: onAsyncComplete("City move (change index)", done)
	});
	//Check index of other city to make sure it was changed too
	done = assert.async();
	$.ajax({
		type: "GET",
		url: "/trip/1/city/3",
		success: function(data, textStatus, jqXHR) {
			assert.ok(data.index == 2, "Should have changed the index of the previously last city")
		},
		complete: onAsyncComplete("Get updated index of city", done)
	});
	//Move it back
	done = assert.async();
	$.ajax({
		type: "PUT",
		url: "/trip/1/city/2/move",
		data: {
			fromIndex: 3,
			toIndex: 2
		},
		complete: onAsyncComplete("City move (change index) back", done)
	});

	done = assert.async();
	$.ajax({
		type: "DELETE",
		url: "/trip/1/city/" + sampleCity.city_id,
		complete: onAsyncComplete("City delete", done)
	});

	done = assert.async();
	$.ajax({
		type: "POST",
		url: "/auth/logout",
		complete: onAsyncComplete("Test user logout", done)
	});
});

var sampleLocation = {
	city_id: 1,
	name: "Unit test location", 
	place_id: -1,
	category: -1,
	longitude: -1,
	latitude: -1,
	start_date: (new Date().toISOString()),
	end_date: (new Date().toISOString()),
	ranking: 1
};
var updatedSampleLocation = JSON.parse(JSON.stringify(sampleLocation));
updatedSampleLocation.name = "Updated unit test location";

QUnit.test("Location tests", function(assert) {
	assert.expect(17);

	var done;
	done = assert.async();
	$.ajax({
		type: "POST",
		url: "/auth/login",
		data: {
			username: testUser.username,
			password: testUser.password
		},
		success: function(data) {
			testUser.user_id = data.user_id;
		},
		complete: onAsyncComplete("Test user login", done)
	});

	//Read locations for test city
	done = assert.async();
	$.ajax({
		type: "GET",
		url: "/trip/1/city/1/locations",
		success: function(data) {
			assert.ok(data.length >= 0, "locations for test city should be an array");
		},
		complete: onAsyncComplete("Get locations for test city", done)
	});

	//Change indexes of locations
	done = assert.async();
	$.ajax({
		type: "PUT",
		url: "/trip/1/city/1/changeLocationIndexes",
		data: {locations: [{
			location_id: 1,
			newIndex: 1
		},
		{
			location_id: 2,
			newIndex: 2
		},
		{
			location_id: 3,
			newIndex: 3
		}]},
		complete: onAsyncComplete("Update indexes on locations for city", done)
	});

	//Use test city with id=1 as parent
	done = assert.async();
	$.ajax({
		type: "POST",
		url: "/trip/1/city/1/location",
		data: {location: sampleLocation},
		success: function(data) {
			assert.ok(data.location_id >= 0, "location_id should be an integer");
			sampleLocation.location_id = data.location_id;
			updatedSampleLocation.location_id = data.location_id;
		},
		complete: onAsyncComplete("Create location", done)
	});

	done = assert.async();
	$.ajax({
		type: "POST",
		url: "/trip/1/city/1/location",
		data: {locations: [sampleLocation, sampleLocation, sampleLocation]},
		complete: onAsyncComplete("Create mulitple locations", done)
	});

	var done = assert.async();
	$.ajax({
		type: "PUT",
		url: "/trip/1/city/1/location/" + updatedSampleLocation.location_id,
		data: {location: updatedSampleLocation},
		success: function(data, textStatus, jqXHR) {
			assert.ok(data.name == updatedSampleLocation.name, "location.name should be updated");
			sampleLocation.name = data.name;
		},
		complete: onAsyncComplete("Location update", done)
	});

	done = assert.async();
	$.ajax({
		type: "GET",
		url: "/trip/1/city/1/location/" + sampleLocation.location_id,
		success: function(data, textStatus, jqXHR) {
			assert.ok(data.location_id == sampleLocation.location_id, "Should return the correct location")
		},
		complete: onAsyncComplete("Location get", done)
	});

	//Try moving index of locations
	done = assert.async();
	$.ajax({
		type: "PUT",
		url: "/trip/1/city/1/location/2/move",
		data: {
			fromIndex: 2,
			toIndex: 3
		},
		complete: onAsyncComplete("Location move (change index)", done)
	});
	//Check index of other location to make sure it was changed too
	done = assert.async();
	$.ajax({
		type: "GET",
		url: "/trip/1/city/1/location/3",
		success: function(data, textStatus, jqXHR) {
			assert.ok(data.index == 2, "Should have changed the index of the previously last location")
		},
		complete: onAsyncComplete("Get updated index of location", done)
	});
	//Move it back
	done = assert.async();
	$.ajax({
		type: "PUT",
		url: "/trip/1/city/1/location/2/move",
		data: {
			fromIndex: 3,
			toIndex: 2
		},
		complete: onAsyncComplete("Location move (change index) back", done)
	});

	done = assert.async();
	$.ajax({
		type: "DELETE",
		url: "/trip/1/city/1/location/" + sampleLocation.location_id,
		complete: onAsyncComplete("Location delete", done)
	});

	done = assert.async();
	$.ajax({
		type: "POST",
		url: "/auth/logout",
		complete: onAsyncComplete("Test user logout", done)
	});
});

var onAsyncComplete = function(text, done) {
    return function(jqXHR, textStatus) {
    	console.log("Ran: " + text);
		QUnit.equal(jqXHR.status, 200, text);
		done();
	};
}