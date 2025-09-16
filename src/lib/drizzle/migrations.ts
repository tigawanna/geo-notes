const notes = `
CREATE TABLE notes (
	id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	title text,
	content text NOT NULL,
	quick_copy text,
	type text DEFAULT 'note' NOT NULL,
	status text DEFAULT 'active',
	tags text,
	metadata text,
	image_path text,
	image_blob blob,
	priority integer DEFAULT 0,
	reminder_at text,
	completed_at text,
	due_date text,
	last_viewed text DEFAULT (CURRENT_TIMESTAMP),
	created_at text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	updated_at text DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);

SELECT AddGeometryColumn('notes', 'location_point', 4326, 'POINT', 'XY');
`;

export const migrations = [notes];
