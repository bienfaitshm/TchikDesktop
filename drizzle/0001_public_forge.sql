PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`user_id` text PRIMARY KEY NOT NULL,
	`last_name` text NOT NULL,
	`middle_name` text NOT NULL,
	`first_name` text,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`gender` text DEFAULT 'M' NOT NULL,
	`role` text DEFAULT 'STUDENT' NOT NULL,
	`birth_date` integer NOT NULL,
	`birth_place` text,
	`school_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_users`("user_id", "last_name", "middle_name", "first_name", "username", "password", "gender", "role", "birth_date", "birth_place", "school_id", "created_at", "updated_at") SELECT "user_id", "last_name", "middle_name", "first_name", "username", "password", "gender", "role", "birth_date", "birth_place", "school_id", "created_at", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE INDEX `users_school_idx` ON `users` (`school_id`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `users_school_last_name_idx` ON `users` (`school_id`,`last_name`);--> statement-breakpoint
CREATE INDEX `users_school_middle_name_idx` ON `users` (`school_id`,`middle_name`);--> statement-breakpoint
CREATE INDEX `users_school_first_name_idx` ON `users` (`school_id`,`first_name`);--> statement-breakpoint
CREATE INDEX `classrooms_school_indentifier_idx` ON `classrooms` (`school_id`,`identifier`);--> statement-breakpoint
CREATE INDEX `classrooms_school_short_indentifier_idx` ON `classrooms` (`school_id`,`short_identifier`);