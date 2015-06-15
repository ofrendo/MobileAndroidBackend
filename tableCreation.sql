DROP TABLE IF EXISTS message_seen;
DROP TABLE IF EXISTS message;
DROP TABLE IF EXISTS location;
DROP TABLE IF EXISTS city;
DROP TABLE IF EXISTS user_trip;
DROP TABLE IF EXISTS trip;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(50) UNIQUE,
  username VARCHAR(30) UNIQUE,
  password VARCHAR(112),
  name VARCHAR(100),
  confirmed BOOLEAN DEFAULT true
);

CREATE TABLE trip (
	trip_id SERIAL PRIMARY KEY,
	created_by INT REFERENCES users(user_id),
	name VARCHAR(50) NOT NULL,
	created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
	start_date TIMESTAMP, 
	end_date TIMESTAMP
); 

CREATE TABLE user_trip (
	user_id INT REFERENCES users(user_id),
	trip_id INT REFERENCES trip(trip_id),
	PRIMARY KEY(user_id, trip_id),
	index SERIAL
);

CREATE TABLE city (
	city_id SERIAL PRIMARY KEY,
	trip_id  INT REFERENCES trip(trip_id) ON DELETE CASCADE,
	name VARCHAR(50) NOT NULL,
	place_id VARCHAR(27),
	longitude DECIMAL(10, 7) NOT NULL,
	latitude DECIMAL(10, 7) NOT NULL,
	start_date TIMESTAMP,
	end_date TIMESTAMP,
	created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
	index SERIAL
);

CREATE TABLE location (
	location_id SERIAL PRIMARY KEY,
	city_id INT REFERENCES city(city_id) ON DELETE CASCADE,
	name VARCHAR(50) NOT NULL,
	place_id VARCHAR(27),
	category VARCHAR(50),
	longitude DECIMAL(10, 7) NOT NULL,
	latitude DECIMAL(10, 7) NOT NULL,
	start_date TIMESTAMP,
	end_date TIMESTAMP,
	created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	index SERIAL
);

CREATE TABLE message (
	msg_id SERIAL PRIMARY KEY,
	user_id INT REFERENCES users(user_id),
	trip_id INT REFERENCES trip(trip_id),
	msg_text TEXT NOT NULL,
	created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE message_seen (
	user_id INT REFERENCES users(user_id),
	msg_id INT REFERENCES message(msg_id)
);


INSERT INTO users 
	(email,username,password,name)
	VALUES ('test_user@gmail.com', 'test_user', crypt('un1tt3st1ng', gen_salt('bf', 8)), 'Test user');
INSERT INTO users 
	(email,username,password,name)
	VALUES ('test_user2@gmail.com', 'test_user2', crypt('un1tt3st1ng', gen_salt('bf', 8)), 'Test user 2');
INSERT INTO users 
	(email,username,password,name)
	VALUES ('mliedtke@gmx.de', 'matthias', crypt('test', gen_salt('bf', 8)), 'Matthias Liedtke');
	
INSERT INTO trip 
	(name, created_by)
	VALUES ('test_trip1', 1);
INSERT INTO user_trip 
	(user_id, trip_id)
	VALUES (1, 1);
INSERT INTO trip 
	(name, created_by)
	VALUES ('test_trip2', 1);
INSERT INTO user_trip 
	(user_id, trip_id)
	VALUES (1, 2);
INSERT INTO trip 
	(name, created_by)
	VALUES ('test_trip3', 1);
INSERT INTO user_trip 
	(user_id, trip_id)
	VALUES (1, 3);

INSERT INTO trip 
	(name, created_by, start_date, end_date)
	VALUES ('Amerika - Testreise', 1, '2014-12-10T00:00:00.000Z', '2014-12-25T00:00:00.000Z');	
INSERT INTO user_trip
	(user_id, trip_id)
	VALUES (1, 4);
INSERT INTO user_trip 
	(user_id, trip_id)
	VALUES (3, 4);
	
INSERT INTO city
	(trip_id, name, place_id, longitude, latitude)
	VALUES (1, 'test_city1 DONT REORDER', 1234, -1, -1);
INSERT INTO city
	(trip_id, name, place_id, longitude, latitude)
	VALUES (1, 'test_city2 DONT REORDER', 1234, -1, -1);
INSERT INTO city
	(trip_id, name, place_id, longitude, latitude)
	VALUES (1, 'test_city3 DONT REORDER', 1234, -1, -1);
INSERT INTO city
	(trip_id, name, place_id, longitude, latitude)
	VALUES (4, 'Boston', 'ChIJGzE9DS1l44kRoOhiASS_fHg', -71.0600970, 42.3584865);
INSERT INTO city
	(trip_id, name, place_id, longitude, latitude)
	VALUES (4, 'New York', 'ChIJOwg_06VPwokRYv534QaPC8g', -74.0059413, 40.7127837);
INSERT INTO city
	(trip_id, name, place_id, longitude, latitude)
	VALUES (4, 'Washington', 'ChIJW-T2Wt7Gt4kRKl2I1CJFUsI', -77.0368707, 38.9071923);
	
INSERT INTO location
	(city_id, name, place_id, longitude, latitude)
	VALUES (1, 'test_location1 DONT REORDER', 12345, -1, -1);
INSERT INTO location
	(city_id, name, place_id, longitude, latitude)
	VALUES (1, 'test_location2 DONT REORDER', 12345, -1, -1);
INSERT INTO location
	(city_id, name, place_id, longitude, latitude)
	VALUES (1, 'test_location3 DONT REORDER', 12345, -1, -1);