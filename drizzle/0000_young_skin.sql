CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT 'Untitled',
	`quick_copy` text,
	`content` text,
	`created` text DEFAULT (CURRENT_TIMESTAMP),
	`updated` text DEFAULT (CURRENT_TIMESTAMP),
	`location` text,
	`user_id` text
);
--> statement-breakpoint
CREATE INDEX `idx_notes_id` ON `notes` (`id`);--> statement-breakpoint
CREATE INDEX `idx_notes_created` ON `notes` (`created`);