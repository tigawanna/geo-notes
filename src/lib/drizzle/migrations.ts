const notes = `
CREATE TABLE notes (
	id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	title text,
	content text,
	quick_copy text,
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
	updated_at text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,

	latitude integer,
	longitude integer
);

SELECT AddGeometryColumn('notes', 'location_point', 4326, 'POINT', 'XY');
`;

export const migrations = {
  tables: [{
	notes: {
		sql: notes,
	},
  }],
};
