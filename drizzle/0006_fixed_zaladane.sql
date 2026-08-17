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
	FOREIGN KEY (`year_id`) REFERENCES `study_years`(`year_id`) ON UPDATE no action ON DELETE cascade
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
CREATE TABLE `__new_fee_configurations` (
	`fee_config_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`total_amount` integer NOT NULL,
	`currency` text DEFAULT 'CDF' NOT NULL,
	`section` text,
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
	FOREIGN KEY (`year_id`) REFERENCES `study_years`(`year_id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "exactly_one_target_check" CHECK(
        ("__new_fee_configurations"."section" IS NOT NULL AND "__new_fee_configurations"."option_id" IS NULL AND "__new_fee_configurations"."classroom_id" IS NULL)
        OR
        ("__new_fee_configurations"."section" IS NULL AND "__new_fee_configurations"."option_id" IS NOT NULL AND "__new_fee_configurations"."classroom_id" IS NULL)
        OR
        ("__new_fee_configurations"."section" IS NULL AND "__new_fee_configurations"."option_id" IS NULL AND "__new_fee_configurations"."classroom_id" IS NOT NULL)
      )
);
--> statement-breakpoint
INSERT INTO `__new_fee_configurations`("fee_config_id", "name", "total_amount", "currency", "section", "option_id", "classroom_id", "fee_type_id", "school_id", "year_id", "created_at", "updated_at") SELECT "fee_config_id", "name", "total_amount", "currency", "section", "option_id", "classroom_id", "fee_type_id", "school_id", "year_id", "created_at", "updated_at" FROM `fee_configurations`;--> statement-breakpoint
DROP TABLE `fee_configurations`;--> statement-breakpoint
ALTER TABLE `__new_fee_configurations` RENAME TO `fee_configurations`;--> statement-breakpoint
CREATE TABLE `__new_fee_types` (
	`fee_type_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`wallet_id` text NOT NULL,
	`school_id` text NOT NULL,
	`year_id` text NOT NULL,
	`created_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	`updated_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	FOREIGN KEY (`wallet_id`) REFERENCES `wallets`(`wallet_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`year_id`) REFERENCES `study_years`(`year_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_fee_types`("fee_type_id", "name", "wallet_id", "school_id", "year_id", "created_at", "updated_at") SELECT "fee_type_id", "name", "wallet_id", "school_id", "year_id", "created_at", "updated_at" FROM `fee_types`;--> statement-breakpoint
DROP TABLE `fee_types`;--> statement-breakpoint
ALTER TABLE `__new_fee_types` RENAME TO `fee_types`;