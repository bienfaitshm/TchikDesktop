CREATE TABLE `classroom_enrollment_actions` (
	`action_id` text PRIMARY KEY NOT NULL,
	`enrollment_id` text NOT NULL,
	`reason` text,
	`action` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`enrollment_id`) REFERENCES `classroom_enrollments`(`enrollment_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `actions_enrollment_idx` ON `classroom_enrollment_actions` (`enrollment_id`);--> statement-breakpoint
CREATE TABLE `classroom_enrollments` (
	`enrollment_id` text PRIMARY KEY NOT NULL,
	`classroom_id` text NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`is_new_student` integer DEFAULT false NOT NULL,
	`student_code` text NOT NULL,
	`student_id` text NOT NULL,
	`school_id` text NOT NULL,
	`year_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`classroom_id`) REFERENCES `classrooms`(`class_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`student_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`year_id`) REFERENCES `study_years`(`year_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `enrollments_school_idx` ON `classroom_enrollments` (`school_id`);--> statement-breakpoint
CREATE INDEX `enrollments_classroom_idx` ON `classroom_enrollments` (`classroom_id`);--> statement-breakpoint
CREATE INDEX `enrollments_student_idx` ON `classroom_enrollments` (`student_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `student_year_unique_idx` ON `classroom_enrollments` (`student_id`,`year_id`);--> statement-breakpoint
CREATE TABLE `classrooms` (
	`class_id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`short_identifier` text NOT NULL,
	`section` text NOT NULL,
	`year_id` text NOT NULL,
	`option_id` text,
	`school_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`year_id`) REFERENCES `study_years`(`year_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`option_id`) REFERENCES `options`(`option_id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `classrooms_school_idx` ON `classrooms` (`school_id`);--> statement-breakpoint
CREATE INDEX `classrooms_year_idx` ON `classrooms` (`year_id`);--> statement-breakpoint
CREATE TABLE `local_rooms` (
	`local_room_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`max_capacity` integer DEFAULT 0 NOT NULL,
	`total_rows` integer DEFAULT 0 NOT NULL,
	`total_columns` integer DEFAULT 0 NOT NULL,
	`school_id` text NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `local_rooms_school_idx` ON `local_rooms` (`school_id`);--> statement-breakpoint
CREATE TABLE `options` (
	`option_id` text PRIMARY KEY NOT NULL,
	`option_name` text NOT NULL,
	`option_short_name` text NOT NULL,
	`section` text DEFAULT 'SECONDARY' NOT NULL,
	`school_id` text NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `options_school_idx` ON `options` (`school_id`);--> statement-breakpoint
CREATE TABLE `schools` (
	`school_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`town` text NOT NULL,
	`logo` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `seating_assignments` (
	`assignment_id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`local_room_id` text NOT NULL,
	`enrollment_id` text NOT NULL,
	`row_position` integer NOT NULL,
	`column_position` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `seating_sessions`(`session_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`local_room_id`) REFERENCES `local_rooms`(`local_room_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`enrollment_id`) REFERENCES `classroom_enrollments`(`enrollment_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_enrollment_idx` ON `seating_assignments` (`session_id`,`enrollment_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `seat_position_idx` ON `seating_assignments` (`session_id`,`local_room_id`,`row_position`,`column_position`);--> statement-breakpoint
CREATE TABLE `seating_sessions` (
	`session_id` text PRIMARY KEY NOT NULL,
	`session_name` text NOT NULL,
	`school_id` text NOT NULL,
	`year_id` text NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`year_id`) REFERENCES `study_years`(`year_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `seating_sessions_school_idx` ON `seating_sessions` (`school_id`);--> statement-breakpoint
CREATE TABLE `study_years` (
	`year_id` text PRIMARY KEY NOT NULL,
	`year_name` text NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`school_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `study_years_school_idx` ON `study_years` (`school_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `school_year_name_unique_idx` ON `study_years` (`school_id`,`year_name`);--> statement-breakpoint
CREATE TABLE `users` (
	`user_id` text PRIMARY KEY NOT NULL,
	`last_name` text NOT NULL,
	`middle_name` text NOT NULL,
	`first_name` text,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`gender` text DEFAULT 'M' NOT NULL,
	`role` text DEFAULT 'STUDENT' NOT NULL,
	`birth_date` text,
	`birth_place` text,
	`school_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE INDEX `users_school_idx` ON `users` (`school_id`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);