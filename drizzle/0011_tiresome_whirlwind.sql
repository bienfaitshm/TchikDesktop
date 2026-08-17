PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_study_years` (
	`year_id` text PRIMARY KEY NOT NULL,
	`year_name` text NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_study_years`("year_id", "year_name", "start_date", "end_date", "created_at", "updated_at") SELECT "year_id", "year_name", "start_date", "end_date", "created_at", "updated_at" FROM `study_years`;--> statement-breakpoint
DROP TABLE `study_years`;--> statement-breakpoint
ALTER TABLE `__new_study_years` RENAME TO `study_years`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
DROP INDEX `fee_type_school_idx`;--> statement-breakpoint
CREATE INDEX `fee_types_school_year_idx` ON `fee_types` (`school_id`,`year_id`);--> statement-breakpoint
CREATE INDEX `fee_types_wallet_idx` ON `fee_types` (`wallet_id`);--> statement-breakpoint
ALTER TABLE `student_payments` ADD `user_id` text REFERENCES users(user_id);--> statement-breakpoint
ALTER TABLE `student_payments` ADD `school_id` text NOT NULL REFERENCES schools(school_id);--> statement-breakpoint
ALTER TABLE `student_payments` ADD `year_id` text NOT NULL REFERENCES study_years(year_id);--> statement-breakpoint
CREATE INDEX `payments_school_year_idx` ON `student_payments` (`school_id`,`year_id`);--> statement-breakpoint
CREATE INDEX `payments_user_idx` ON `student_payments` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `daily_rate_unique_idx` ON `daily_exchange_rates` (`school_id`,`date`,`currency_from`,`currency_to`);--> statement-breakpoint
CREATE INDEX `fee_assignments_config_idx` ON `fee_assignments` (`fee_config_id`);--> statement-breakpoint
CREATE INDEX `fee_assignments_schedule_idx` ON `fee_assignments` (`schedule_id`);--> statement-breakpoint
CREATE INDEX `fee_config_school_year_idx` ON `fee_configurations` (`school_id`,`year_id`);--> statement-breakpoint
CREATE INDEX `fee_config_fee_type_idx` ON `fee_configurations` (`fee_type_id`);--> statement-breakpoint
CREATE INDEX `fee_config_option_idx` ON `fee_configurations` (`option_id`);--> statement-breakpoint
CREATE INDEX `fee_config_classroom_idx` ON `fee_configurations` (`classroom_id`);--> statement-breakpoint
CREATE INDEX `fee_schedules_fee_type_idx` ON `fee_schedules` (`fee_type_id`);