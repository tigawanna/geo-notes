PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text DEFAULT 'Untitled',
	`quick_copy` text,
	`content` text,
	`created` text DEFAULT (CURRENT_TIMESTAMP),
	`updated` text DEFAULT (CURRENT_TIMESTAMP),
	`location` blob,
	`user_id` text
);
--> statement-breakpoint
INSERT INTO `__new_notes`("id", "title", "quick_copy", "content", "created", "updated", "location", "user_id") SELECT "id", "title", "quick_copy", "content", "created", "updated", "location", "user_id" FROM `notes`;--> statement-breakpoint
DROP TABLE `notes`;--> statement-breakpoint
ALTER TABLE `__new_notes` RENAME TO `notes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_notes_id` ON `notes` (`id`);--> statement-breakpoint
CREATE INDEX `idx_notes_created` ON `notes` (`created`);