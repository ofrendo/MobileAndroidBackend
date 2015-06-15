This page lists the API calls that can be made to the backend.

## Inhaltsverzeichnis
- [Session management](#sessionManagement)
    - [Login](#login)
    - [Logout](#logout)
- [Unit testing](#unitTesting)
- [User](#user)
    - [Creating a user](#createUser)
    - [Get user data](#getUserData)
    - [Get user trips](#getUserTrips)
    - [Update user](#updateUser)
    - [Update user password](#updateUserPassword)
    - [Delete user](#deleteUser)
- [Trip](#trip)
    - [Create a trip](#createTrip)
    - [Get trip data](#getTripData)
    - [Get list of users for trip](#getListOfUsersForTrip)
    - [Add user to trip](#addUserToTrip)
    - [Delete user from trip](#deleteUserFromTrip)
    - [Get list of cities for trip](#getListOfCitiesForTrip)
    - [Update trip](#updateTrip)
    - [Move trip (change index of trip, only for currently logged in user)](#moveTrip)
    - [Delete trip](#deleteTrip)
- [City](#city)
    - [Create city](#createCity)
    - [Get city](#getCity)
    - [Get list of locations for city](#getListOfLocationsForCity)
    - [Change indexes of all locations for given city, to be used during optimization](#changeIndexes)
    - [Update city](#updateCity)
    - [Move city (change index of city)](#moveCity)
    - [Delete city](#deleteCity)
- [Location](#location)
    - [Create location(s)](#createLocation)
    - [Get location](#getLocation)
    - [Update location](#updateLocation)
    - [Move location (change index of location)](#moveLocation)
    - [Delete location](#deleteLocation)
- [WebSocket chat](#websocketChat)
    - [Message structure](#messageStructure)
    - [Emitting events](#emittingEvents)
    - [Reacting to events](#reactingToEvents)

## <a name="sessionManagement"></a>Session management
#### <a name="login"></a>Login
```
POST /auth/login

Required: 
username
password

Returns:
user_id
email
phone
username
name


//Sample usage:
$.ajax({
	type: "POST",
	url: "/auth/login",
	data: {
		username: sampleUser.username,
		password: sampleUser.password
	},
	success: function(data, textStatus, jqXHR) {
		//On login: data.user_id
	},
	error: function(jqXHR, textStatus, errorThrown) {
		//On error, for example wrong password
	}
});
```

`data` in `success` returns a user JSON object like in `user/:user_id`.

Status codes:
- 200: OK
- 400: Error during login

#### <a name="logout"></a>Logout
```
POST /auth/logout
```

Status codes:
- 200: Successful logout

## <a name="unitTesting"></a>Unit testing
Open `/test` in a browser, this will run through every API call once. 

## <a name="user"></a>User
#### <a name="createUser"></a>Creating a user
```
POST /user

Required: 
user.email
user.username
user.password
user.name

Optional:
user.phone

Returns:
user_id

//Sample usage:
var sampleUser = {
	email: "hello@wor.ld",
	username: "helloWorld",
	password: "helloPass",
	name: "Hello World"
};
$.ajax({
	type: "POST",
	url: "/user",
	data: {user: sampleUser},
	success: function(data, textStatus, jqXHR) {
		sampleUser.user_id = data.user_id;
	}
});
```

This call also logs you in. It is unnecessary to call `/login` after this.

Status codes:
- 200: User creation successful
- 400: Bad request, for example not an email adress
- 403: Trying to create a user that already exists AND has been confirmed
- 500: User exists already or internal server error


#### <a name="getUserData"></a>Get user data
```
GET /user/:user_id

Returns:
user_id
email
phone
username
name
```

Status codes:
- 200: OK
- 400: Bad request, for example when sending a string instead of a number as `user_id`
- 401: Not logged in
- 403: Forbidden, trying to access info about other user
- 404: Not found


#### <a name="getUserTrips"></a>Get user trips
```
GET /user/:user_id/trips

Returns (array):
trip_id
created_by
user_id (ID of the currently logged in user, could be compared with created_by)
name
start_date
end_date
created_on
no_participants
no_cities
```

#### <a name="updateUser"></a>Update user
```
PUT /user/:user_id

Required:
user.email
user.username
user.password
user.name

Optional:
user.phone

Returns:
user_id
email
username
name
```

For sample usage see `POST /user`.

Status codes:
- 200: OK
- 400: Bad request, for example when sending a string instead of a number as `user_id`
- 401: Not logged in
- 403: Forbidden, trying to access update other user
- 404: Not found

#### <a name="updateUserPassword"></a>Update user password
```
PUT /user/:user_id/changePassword

Required: 
password
```


#### <a name="deleteUser"></a>Delete user
```
DELETE /user/:user_id
```

Only the user himself may delete the user and he must be logged in. Also logs the user out.

Status codes:
- 200: OK
- 400: Bad request, for example when sending a string instead of a number as `user_id`
- 401: Not logged in
- 403: Trying to delete a different user (different `user_id`)
- 500: Internal server error trying to delete user

## <a name="trip"></a>Trip
All calls described here require a user to be logged in.

Status codes:
- 200: OK
- 400: Bad request, for example when sending a string instead of a number as IDs
- 401: Not logged in
- 403: Trying to read/update/delete a forbidden trip, for example trying to read from another user
- 500: Internal server error

#### <a name="createTrip"></a>Create a trip
```
POST /trip

Required:
trip.name

Optional:
trip.start_date (ISO 6801 format)
trip.end_date (ISO 6801 format)

Returns:
trip_id

//Sample usage:
var sampleTrip = {
	name: "Test trip",
	start_date: (new Date()).toISOString()
};
$.ajax({
	type: "POST",
	url: "/trip",
	data: {trip: sampleTrip},
	success: function(data, textStatus, jqXHR) { //data will be trip_id
		sampleTrip.trip_id = data.trip_id;
	}
});
```

#### <a name="getTripData"></a>Get trip data
```
GET /trip/:trip_id

Returns:
trip_id
created_by
name
start_date
end_date
created_on
index
```

#### <a name="getListOfUsersForTrip"></a>Get list of users for trip
```
GET /trip/:trip_id/users

Returns (array):
user_id
username
name
avatar
confirmed
```

#### <a name="addUserToTrip"></a>Add user to trip
```
PUT /trip/:trip_id/addUser

Required is at least ONE of the following, preferably exactly ONE:
user.email
user.phone
user.username

Optional:
user.name
```

#### <a name="deleteUserFromTrip"></a>Delete user from trip
```
DELETE /trip/:trip_id/removeUser

Required:
user.user_id
```

#### <a name="getListOfCitiesForTrip"></a>Get list of cities for trip
```
GET /trip/:trip_id/cities

Returns (array):
city_id
trip_id
name
place_id
longitude
latitude
start_date
end_date
created_on
index
```

#### <a name="updateTrip"></a>Update trip
``` 
PUT /trip/:trip_id

Required:
trip.name

Optional:
trip.start_date (ISO 6801 format)
trip.end_date (ISO 6801 format)

Returns:
trip_id
name
start_date
end_date
created_on
index
```

#### <a name="moveTrip"></a>Move trip (change index of trip, only for currently logged in user)
```
PUT /trip/:trip_id/move

Required:
fromIndex
toIndex
```

Note: This API call will return 400 if:
- fromIndex or toIndex are not numbers
- fromIndex equals toIndex
- fromIndex does not equal the index currently saved in the DB (for example when working with an old version in the frontend)


#### <a name="deleteTrip"></a>Delete trip
```
DELETE /trip/:trip_id
```

## <a name="city"></a>City
All calls described here require a user to be logged in.

Status codes:
- 200: OK
- 400: Bad request, for example when sending a string instead of a number as IDs
- 401: Not logged in
- 403: Trying to read/update/delete a forbidden trip, for example trying to read from another user
- 500: Internal server error

#### <a name="createCity"></a>Create city
```
POST /trip/:trip_id/city

Required: 
city.trip_id
city.name
city.place_id
city.longitude
city.latitude

Optional:
city.start_date
city.end_date

Returns:
city_id
```

#### <a name="getCity"></a>Get city
```
GET /trip/:trip_id/city/:city_id

Returns:
city_id
trip_id
name
place_id
longitude
latitude
start_date
end_date
index
```

#### <a name="getListOfLocationsForCity"></a>Get list of locations for city
```
GET /trip/:trip_id/city/:city_id/locations

Returns (array):
location_id
city_id
name
place_id
category
longitude
latitude
start_date
end_date
created_on
index
```

#### <a name="changeIndexes"></a>Change indexes of all locations for given city, to be used during optimization
```
PUT /trip/:trip_id/city/:city_id/changeLocationIndexes

Required (.locations array):
newIndex
location_id
```

#### Update city
```
PUT /trip/:trip_id/city/:city_id

Required: 
city.trip_id
city.name
city.place_id
city.longitude
city.latitude

Optional:
city.start_date
city.end_date

Returns:
city_id
trip_id
name
place_id
longitude
latitude
start_date
end_date
index
```

#### <a name="moveCity"></a>Move city (change index of city)
```
PUT /trip/:trip_id/city/:city_id/move

Required:
fromIndex
toIndex
```

Note: This API call will return 400 if:
- fromIndex or toIndex are not numbers
- fromIndex equals toIndex
- fromIndex does not equal the index currently saved in the DB (for example when working with an old version in the frontend)

#### <a name="deleteCity"></a>Delete city
```
DELETE /trip/:trip_id/city/:city_id
```

## <a name="location"></a>Location
All calls described here require a user to be logged in.

Status codes:
- 200: OK
- 400: Bad request, for example when sending a string instead of a number as IDs
- 401: Not logged in
- 403: Trying to read/update/delete a forbidden trip, for example trying to read from another user
- 500: Internal server error

#### <a name="createLocation"></a>Create location(s)
The following objects may also be stored in an array `locations`, thus making it possible to create multiple locations with one call.
```
POST /trip/:trip_id/city/:city_id/location

Required:
location.city_id
location.name
location.place_id
location.category
location.longitude
location.latitude

Optional:
location.start_date
location.end_date

Returns:
location_id
```

#### <a name="getLocation"></a>Get location
```
GET /trip/:trip_id/city/:city_id/location/:location_id

Returns:
location_id
city_id
name
place_id
category
longitude
latitude
start_date
end_date
index
```

#### <a name="updateLocation"></a>Update location
```
PUT /trip/:trip_id/city/:city_id/location/:location_id

Required:
location.city_id
location.name
location.place_id
location.category
location.longitude
location.latitude

Optional:
location.start_date
location.end_date

Returns:
location_id
city_id
name
place_id
category
longitude
latitude
start_date
end_date
index
```

#### <a name="moveLocation"></a>Move location (change index of location)
```
PUT /trip/:trip_id/city/:city_id/location/:location_id/move

Required:
fromIndex
toIndex
```

Note: This API call will return 400 if:
- fromIndex or toIndex are not numbers
- fromIndex equals toIndex
- fromIndex does not equal the index currently saved in the DB (for example when working with an old version in the frontend)

#### <a name="deleteLocation"></a>Delete location
```
DELETE /trip/:trip_id/city/:city_id/location/:location_id
```



## <a name="websocketChat"></a>WebSocket chat
The library `socket.io` is used for the WebSocket connection. The chat is room based, which means each trip has its own room. A user can only join one room at a time. In order to connect:
```
//Can also use http://localhost:5000 if using the local server
var url = "https://thawing-stream-4939.herokuapp.com:443"; 
var socket = io.connect(url);
```


#### <a name="messageStructure"></a>Message structure
Each message has the following structure:
```
message.user_id
message.username
message.name
message.trip_id
message.msg_id
message.msg_text
message.created_on
```



#### <a name="emittingEvents"></a>Emitting events
These are the events that the client can emit to the server.
```
//Call this to join a room for a given trip_id
//The response is room.previousMessages
socket.emit("room.join", {trip_id: trip.trip_id});


//Call this to leave the current room
//The response is room.left
socket.emit("room.leave");


//Call this to send a message to other participants
//The response is msg.sent
socket.emit("msg.send", {msg_text: text});
```



#### <a name="reactingToEvents"></a>Reacting to events
These are the events that the server will emit to the client. 

```
//This event will be emitted upon connecting (not joining a room)
socket.on("connect", function() {
	
});

//This event will be emitted upon disconnecting
socket.on("disconnect", function() {
	
});

//This event will be emitted upon joining a room
socket.on("room.previousMessages", function(previousMessages) {
	//previousMessages is an array of previous messages in a room for a given trip
});

//This event will be emitted if another user joins a room
socket.on("room.userJoined", function(user) {
	//user.user_id, user.username, user.name are available
});

//This event will be emitted if the user leaves the current room
socket.on("room.left", function() {
	
});

//This event will be emitted if another user leaves the current room
socket.on("room.userLeft", function(user) {
	//user.user_id, user.username, user.name are available to be used
});

//This event will be emitted upon sending a message
socket.on("msg.sent", function(message) {
	//message has the full message structure, such as the msg_id
});

//This event will be emitted if a different user sends  amessage
socket.on("msg.new", function(message) {
	//message has the full message structure (see above)
});
```

