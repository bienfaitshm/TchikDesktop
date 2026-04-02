CREATE TABLE `ClassRooms` (
	`class_id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`short_identifier` text NOT NULL,
	`section` text NOT NULL,
	`year_id` text NOT NULL,
	`option_id` text,
	`school_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`year_id`) REFERENCES `StudyYears`(`year_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`option_id`) REFERENCES `Options`(`option_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`school_id`) REFERENCES `Schools`(`school_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ClassroomEnrolementActions` (
	`action_id` text PRIMARY KEY NOT NULL,
	`enrolement_id` text NOT NULL,
	`reason` text,
	`action` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`enrolement_id`) REFERENCES `ClassroomEnrolements`(`enrolement_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ClassroomEnrolements` (
	`enrolement_id` text PRIMARY KEY NOT NULL,
	`classroom_id` text NOT NULL,
	`status` text DEFAULT 'EN_COURS' NOT NULL,
	`is_new_student` integer DEFAULT false NOT NULL,
	`student_code` text NOT NULL,
	`student_id` text NOT NULL,
	`school_id` text NOT NULL,
	`year_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`classroom_id`) REFERENCES `ClassRooms`(`class_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `Users`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`school_id`) REFERENCES `Schools`(`school_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`year_id`) REFERENCES `StudyYears`(`year_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `LocalRooms` (
	`local_room_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`max_capacity` integer DEFAULT 0 NOT NULL,
	`total_rows` integer DEFAULT 0 NOT NULL,
	`total_columns` integer DEFAULT 0 NOT NULL,
	`school_id` text NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `Schools`(`school_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Options` (
	`option_id` text PRIMARY KEY NOT NULL,
	`option_name` text NOT NULL,
	`option_short_name` text NOT NULL,
	`section` text DEFAULT 'SECONDARY' NOT NULL,
	`school_id` text NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `Schools`(`school_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Schools` (
	`school_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`adress` text NOT NULL,
	`town` text NOT NULL,
	`logo` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `SeatingAssignments` (
	`assignment_id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`local_room_id` text NOT NULL,
	`enrolement_id` text NOT NULL,
	`row_position` integer NOT NULL,
	`column_position` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `SeatingSessions`(`session_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`local_room_id`) REFERENCES `LocalRooms`(`local_room_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`enrolement_id`) REFERENCES `ClassroomEnrolements`(`enrolement_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_enrolement_idx` ON `SeatingAssignments` (`session_id`,`enrolement_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `seat_position_idx` ON `SeatingAssignments` (`session_id`,`local_room_id`,`row_position`,`column_position`);--> statement-breakpoint
CREATE TABLE `SeatingSessions` (
	`session_id` text PRIMARY KEY NOT NULL,
	`session_name` text NOT NULL,
	`school_id` text NOT NULL,
	`year_id` text NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `Schools`(`school_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`year_id`) REFERENCES `StudyYears`(`year_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `StudyYears` (
	`year_id` text PRIMARY KEY NOT NULL,
	`year_name` text NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`school_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `Schools`(`school_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `StudyYears_year_name_unique` ON `StudyYears` (`year_name`);--> statement-breakpoint
CREATE TABLE `Users` (
	`user_id` text PRIMARY KEY NOT NULL,
	`last_name` text NOT NULL,
	`middle_name` text NOT NULL,
	`first_name` text,
	`username` text NOT NULL,
	`password` text DEFAULT '000000' NOT NULL,
	`gender` text DEFAULT 'M' NOT NULL,
	`role` text DEFAULT 'STUDENT' NOT NULL,
	`birth_date` text,
	`birth_place` text,
	`school_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `Schools`(`school_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Users_username_unique` ON `Users` (`username`);