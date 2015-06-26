DROP TABLE IF EXISTS fence;
DROP TABLE IF EXISTS fence_group;

CREATE TABLE fence_group (
	fence_group_id SERIAL PRIMARY KEY,
	name varchar(100),
	type varchar(10)
);

CREATE TABLE fence (
	fence_id INT,
	fence_group_id INT REFERENCES fence_group(fence_group_id),
	lat DECIMAL(10, 7),
	lng DECIMAL(10, 7),
	radius INT,
	PRIMARY KEY(fence_id, fence_group_id)
);

INSERT INTO fence_group
	(name)
	VALUES ('TEST fence_group');

INSERT INTO fence
	(fence_id, fence_group_id, lat, lng, radius)
	VALUES (1, 1, -1, -1, -1);

INSERT INTO fence
	(fence_id, fence_group_id, lat, lng, radius)
	VALUES (2, 1, -2, -2, -2);
