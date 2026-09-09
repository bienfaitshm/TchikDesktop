DROP INDEX `tutors_school_phone_idx`;--> statement-breakpoint
CREATE INDEX `tutors_search_phone_idx` ON `tutors` (`school_id`,`phone_number`);--> statement-breakpoint
CREATE INDEX `users_search_names_idx` ON `users` (`school_id`,`role`,"last_name" COLLATE NOCASE,"first_name" COLLATE NOCASE);