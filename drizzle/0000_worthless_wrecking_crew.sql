CREATE TABLE `notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`timestamp` text DEFAULT (CURRENT_TIMESTAMP),
	`pin` blob
);
