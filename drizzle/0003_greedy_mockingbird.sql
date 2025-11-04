CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text,
	`created` text DEFAULT (CURRENT_TIMESTAMP),
	`user_id` text
);
--> statement-breakpoint
CREATE INDEX `idx_tags_name` ON `tags` (`name`);