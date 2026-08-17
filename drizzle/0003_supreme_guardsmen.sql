CREATE TABLE `daily_exchange_rates` (
	`rate_id` text PRIMARY KEY NOT NULL,
	`date` text NOT NULL,
	`currency_from` text NOT NULL,
	`currency_to` text NOT NULL,
	`rate` integer NOT NULL,
	`school_id` text NOT NULL,
	`created_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	`updated_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `daily_rate_unique_idx` ON `daily_exchange_rates` (`date`,`currency_from`,`currency_to`,`school_id`);--> statement-breakpoint
CREATE INDEX `daily_rate_date_idx` ON `daily_exchange_rates` (`date`);--> statement-breakpoint
CREATE TABLE `fee_assignments` (
	`assignment_id` text PRIMARY KEY NOT NULL,
	`enrollment_id` text NOT NULL,
	`fee_config_id` text NOT NULL,
	`amount_paid` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'UNPAID' NOT NULL,
	`created_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	`updated_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	FOREIGN KEY (`enrollment_id`) REFERENCES `classroom_enrollments`(`enrollment_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`fee_config_id`) REFERENCES `fee_configurations`(`fee_config_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `enrollment_fee_config_unique_idx` ON `fee_assignments` (`enrollment_id`,`fee_config_id`);--> statement-breakpoint
CREATE TABLE `fee_configurations` (
	`fee_config_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`total_amount` integer NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`option_id` text,
	`classroom_id` text,
	`fee_type_id` text NOT NULL,
	`school_id` text NOT NULL,
	`year_id` text NOT NULL,
	`created_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	`updated_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	FOREIGN KEY (`option_id`) REFERENCES `options`(`option_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`classroom_id`) REFERENCES `classrooms`(`class_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`fee_type_id`) REFERENCES `fee_types`(`fee_type_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`year_id`) REFERENCES `schools`(`school_id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "option_classroom_xor_check" CHECK(("fee_configurations"."option_id" IS NULL AND "fee_configurations"."classroom_id" IS NOT NULL) OR ("fee_configurations"."option_id" IS NOT NULL AND "fee_configurations"."classroom_id" IS NULL))
);
--> statement-breakpoint
CREATE TABLE `fee_types` (
	`fee_type_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`wallet_id` text NOT NULL,
	`school_id` text NOT NULL,
	`year_id` text NOT NULL,
	`created_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	`updated_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`wallet_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`year_id`) REFERENCES `schools`(`school_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `fee_types_wallet_year_school_idx` ON `fee_types` (`wallet_id`,`year_id`,`school_id`);--> statement-breakpoint
CREATE TABLE `student_payments` (
	`payment_id` text PRIMARY KEY NOT NULL,
	`assignment_id` text NOT NULL,
	`amount_received` integer NOT NULL,
	`currency_received` text DEFAULT 'CDF' NOT NULL,
	`applied_exchange_rate` integer NOT NULL,
	`amount_converted` integer NOT NULL,
	`payment_method` text NOT NULL,
	`transaction_reference` text,
	`created_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	`updated_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	FOREIGN KEY (`assignment_id`) REFERENCES `fee_assignments`(`assignment_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `payments_assignment_idx` ON `student_payments` (`assignment_id`);--> statement-breakpoint
CREATE TABLE `wallets` (
	`wallet_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`currency` text DEFAULT 'CDF' NOT NULL,
	`current_balance` integer DEFAULT 0 NOT NULL,
	`school_id` text NOT NULL,
	`created_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	`updated_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `wallets_school_idx` ON `wallets` (`school_id`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_classroom_enrollments` (
	`enrollment_id` text PRIMARY KEY NOT NULL,
	`classroom_id` text NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`is_new_student` integer DEFAULT false NOT NULL,
	`student_code` text NOT NULL,
	`student_id` text NOT NULL,
	`school_id` text NOT NULL,
	`year_id` text NOT NULL,
	`created_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	`updated_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	FOREIGN KEY (`classroom_id`) REFERENCES `classrooms`(`class_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`student_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`year_id`) REFERENCES `schools`(`school_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_classroom_enrollments`("enrollment_id", "classroom_id", "status", "is_new_student", "student_code", "student_id", "school_id", "year_id", "created_at", "updated_at") SELECT "enrollment_id", "classroom_id", "status", "is_new_student", "student_code", "student_id", "school_id", "year_id", "created_at", "updated_at" FROM `classroom_enrollments`;--> statement-breakpoint
DROP TABLE `classroom_enrollments`;--> statement-breakpoint
ALTER TABLE `__new_classroom_enrollments` RENAME TO `classroom_enrollments`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `enrollments_school_idx` ON `classroom_enrollments` (`school_id`);--> statement-breakpoint
CREATE INDEX `enrollments_classroom_idx` ON `classroom_enrollments` (`classroom_id`);--> statement-breakpoint
CREATE INDEX `enrollments_student_idx` ON `classroom_enrollments` (`student_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `student_year_unique_idx` ON `classroom_enrollments` (`student_id`,`year_id`);--> statement-breakpoint
CREATE TABLE `__new_classrooms` (
	`class_id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`short_identifier` text NOT NULL,
	`section` text NOT NULL,
	`option_id` text,
	`school_id` text NOT NULL,
	`created_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	`updated_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	FOREIGN KEY (`option_id`) REFERENCES `options`(`option_id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_classrooms`("class_id", "identifier", "short_identifier", "section", "option_id", "school_id", "created_at", "updated_at") SELECT "class_id", "identifier", "short_identifier", "section", "option_id", "school_id", "created_at", "updated_at" FROM `classrooms`;--> statement-breakpoint
DROP TABLE `classrooms`;--> statement-breakpoint
ALTER TABLE `__new_classrooms` RENAME TO `classrooms`;--> statement-breakpoint
CREATE INDEX `classrooms_school_idx` ON `classrooms` (`school_id`);--> statement-breakpoint
CREATE INDEX `classrooms_school_indentifier_idx` ON `classrooms` (`school_id`,`identifier`);--> statement-breakpoint
CREATE INDEX `classrooms_school_short_indentifier_idx` ON `classrooms` (`school_id`,`short_identifier`);--> statement-breakpoint
CREATE TABLE `__new_classroom_enrollment_actions` (
	`action_id` text PRIMARY KEY NOT NULL,
	`enrollment_id` text NOT NULL,
	`reason` text,
	`action` text NOT NULL,
	`created_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	`updated_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	FOREIGN KEY (`enrollment_id`) REFERENCES `classroom_enrollments`(`enrollment_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_classroom_enrollment_actions`("action_id", "enrollment_id", "reason", "action", "created_at", "updated_at") SELECT "action_id", "enrollment_id", "reason", "action", "created_at", "updated_at" FROM `classroom_enrollment_actions`;--> statement-breakpoint
DROP TABLE `classroom_enrollment_actions`;--> statement-breakpoint
ALTER TABLE `__new_classroom_enrollment_actions` RENAME TO `classroom_enrollment_actions`;--> statement-breakpoint
CREATE INDEX `actions_enrollment_idx` ON `classroom_enrollment_actions` (`enrollment_id`);--> statement-breakpoint
CREATE TABLE `__new_export_histories` (
	`export_id` text PRIMARY KEY NOT NULL,
	`file_type` text NOT NULL,
	`export_key` text NOT NULL,
	`export_name` text NOT NULL,
	`file_path` text,
	`school_id` text NOT NULL,
	`user_id` text,
	`created_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	`updated_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_export_histories`("export_id", "file_type", "export_key", "export_name", "file_path", "school_id", "user_id", "created_at", "updated_at") SELECT "export_id", "file_type", "export_key", "export_name", "file_path", "school_id", "user_id", "created_at", "updated_at" FROM `export_histories`;--> statement-breakpoint
DROP TABLE `export_histories`;--> statement-breakpoint
ALTER TABLE `__new_export_histories` RENAME TO `export_histories`;--> statement-breakpoint
CREATE INDEX `exports_school_idx` ON `export_histories` (`school_id`);--> statement-breakpoint
CREATE INDEX `exports_user_idx` ON `export_histories` (`user_id`);--> statement-breakpoint
CREATE INDEX `exports_key_idx` ON `export_histories` (`export_key`);--> statement-breakpoint
CREATE INDEX `exports_file_type_idx` ON `export_histories` (`file_type`);--> statement-breakpoint
CREATE TABLE `__new_schools` (
	`school_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`town` text NOT NULL,
	`logo` text,
	`created_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	`updated_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_schools`("school_id", "name", "address", "town", "logo", "created_at", "updated_at") SELECT "school_id", "name", "address", "town", "logo", "created_at", "updated_at" FROM `schools`;--> statement-breakpoint
DROP TABLE `schools`;--> statement-breakpoint
ALTER TABLE `__new_schools` RENAME TO `schools`;--> statement-breakpoint
CREATE TABLE `__new_study_years` (
	`year_id` text PRIMARY KEY NOT NULL,
	`year_name` text NOT NULL,
	`start_date` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	`end_date` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	`school_id` text NOT NULL,
	`created_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	`updated_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_study_years`("year_id", "year_name", "start_date", "end_date", "school_id", "created_at", "updated_at") SELECT "year_id", "year_name", "start_date", "end_date", "school_id", "created_at", "updated_at" FROM `study_years`;--> statement-breakpoint
DROP TABLE `study_years`;--> statement-breakpoint
ALTER TABLE `__new_study_years` RENAME TO `study_years`;--> statement-breakpoint
CREATE INDEX `study_years_school_idx` ON `study_years` (`school_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `school_year_name_unique_idx` ON `study_years` (`school_id`,`year_name`);--> statement-breakpoint
CREATE TABLE `__new_users` (
	`user_id` text PRIMARY KEY NOT NULL,
	`last_name` text NOT NULL,
	`middle_name` text NOT NULL,
	`first_name` text,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`gender` text DEFAULT 'M' NOT NULL,
	`role` text DEFAULT 'STUDENT' NOT NULL,
	`birth_date` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	`birth_place` text,
	`school_id` text NOT NULL,
	`created_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	`updated_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_users`("user_id", "last_name", "middle_name", "first_name", "username", "password", "gender", "role", "birth_date", "birth_place", "school_id", "created_at", "updated_at") SELECT "user_id", "last_name", "middle_name", "first_name", "username", "password", "gender", "role", "birth_date", "birth_place", "school_id", "created_at", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE INDEX `users_school_idx` ON `users` (`school_id`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `users_school_last_name_idx` ON `users` (`school_id`,`last_name`);--> statement-breakpoint
CREATE INDEX `users_school_middle_name_idx` ON `users` (`school_id`,`middle_name`);--> statement-breakpoint
CREATE INDEX `users_school_first_name_idx` ON `users` (`school_id`,`first_name`);--> statement-breakpoint
ALTER TABLE `options` ADD `created_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL;--> statement-breakpoint
ALTER TABLE `options` ADD `updated_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL;