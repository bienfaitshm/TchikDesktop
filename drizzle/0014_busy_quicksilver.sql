CREATE TABLE `tutors` (
	`tutor_id` text PRIMARY KEY NOT NULL,
	`profession` text,
	`address` text,
	`phone_number` text,
	`school_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `tutors_school_idx` ON `tutors` (`school_id`);--> statement-breakpoint
CREATE INDEX `tutors_phone_number_idx` ON `tutors` (`phone_number`);--> statement-breakpoint
CREATE INDEX `tutors_school_phone_idx` ON `tutors` (`school_id`,`phone_number`);--> statement-breakpoint
DROP INDEX `classrooms_school_indentifier_idx`;--> statement-breakpoint
DROP INDEX `classrooms_school_short_indentifier_idx`;--> statement-breakpoint
CREATE INDEX `classrooms_school_identifier_idx` ON `classrooms` (`school_id`,`identifier`);--> statement-breakpoint
CREATE INDEX `classrooms_school_short_identifier_idx` ON `classrooms` (`school_id`,`short_identifier`);--> statement-breakpoint
ALTER TABLE `classroom_enrollments` ADD `tutor_id` text REFERENCES tutors(tutor_id);--> statement-breakpoint
CREATE INDEX `enrollments_tutor_idx` ON `classroom_enrollments` (`tutor_id`);--> statement-breakpoint
CREATE INDEX `enrollments_year_idx` ON `classroom_enrollments` (`year_id`);