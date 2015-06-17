DROP TABLE IF EXISTS fence;
DROP TABLE IF EXISTS fence_group;

CREATE TABLE fence_group (
	fence_group_id SERIAL PRIMARY KEY,
	name varchar(100) 
);

CREATE TABLE fence (
	fence_id SERIAL PRIMARY KEY,
	fence_group_id INT REFERENCES fence_group(fence_group_id),
	lat DECIMAL(10, 7),
	lng DECIMAL(10, 7),
	radius INT
);

INSERT INTO fence_group
	(name)
	VALUES ('TEST fence_group');

INSERT INTO fence
	(fence_group_id, lat, lng, radius)
	VALUES (1, -1, -1, -1);

INSERT INTO fence
	(fence_group_id, lat, lng, radius)
	VALUES (1, -2, -2, -2);
