CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT 'Untitled',
	`quick_copy` text,
	`quick_copy_mode` text,
	`tags` text,
	`content` text,
	`created` text DEFAULT (CURRENT_TIMESTAMP),
	`updated` text DEFAULT (CURRENT_TIMESTAMP),
	`location` blob,
	`user_id` text
);
--> statement-breakpoint
CREATE INDEX `idx_notes_id` ON `notes` (`id`);--> statement-breakpoint
CREATE INDEX `idx_notes_created` ON `notes` (`created`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text,
	`created` text DEFAULT (CURRENT_TIMESTAMP),
	`user_id` text
);
--> statement-breakpoint
CREATE INDEX `idx_tags_name` ON `tags` (`name`);