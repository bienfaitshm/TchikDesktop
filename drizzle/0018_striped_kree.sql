DROP INDEX `student_year_unique_idx`;--> statement-breakpoint
CREATE UNIQUE INDEX `student_year_unique_idx` ON `classroom_enrollments` (`student_id`,`year_id`,`school_id`);