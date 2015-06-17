DROP TABLE IF EXISTS message_seen;
DROP TABLE IF EXISTS message;
DROP TABLE IF EXISTS location;
DROP TABLE IF EXISTS city;
DROP TABLE IF EXISTS user_trip;
DROP TABLE IF EXISTS trip;
DROP TABLE IF EXISTS users;

DROP TABLE IF EXISTS fence_group;
DROP TABLE IF EXISTS fence;

CREATE TABLE fence_group (
	fence_group_id SERIAL PRIMARY KEY,
	name varchar(100) 
);

CREATE TABLE fence (
	fence_id SERIAL PRIMARY KEY,
	fence_group_id INT REFERENCES fence_group(fence_group_id),
	lat float(24),
	long float(24),
	radius float(24)
);