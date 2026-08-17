ALTER TABLE `tutors` ADD `user_id` text REFERENCES users(user_id);--> statement-breakpoint
CREATE UNIQUE INDEX `tutors_user_id_unique` ON `tutors` (`user_id`);--> statement-breakpoint
CREATE INDEX `users_idx` ON `tutors` (`user_id`);