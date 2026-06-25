CREATE TABLE `export_histories` (
	`export_id` text PRIMARY KEY NOT NULL,
	`file_type` text NOT NULL,
	`export_key` text NOT NULL,
	`export_name` text NOT NULL,
	`file_path` text,
	`school_id` text NOT NULL,
	`user_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `exports_school_idx` ON `export_histories` (`school_id`);--> statement-breakpoint
CREATE INDEX `exports_user_idx` ON `export_histories` (`user_id`);--> statement-breakpoint
CREATE INDEX `exports_key_idx` ON `export_histories` (`export_key`);--> statement-breakpoint
CREATE INDEX `exports_file_type_idx` ON `export_histories` (`file_type`);