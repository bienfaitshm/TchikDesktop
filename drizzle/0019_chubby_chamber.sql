CREATE TABLE `fee_overrides` (
	`fee_override_id` text PRIMARY KEY NOT NULL,
	`fee_type_id` text NOT NULL,
	`class_id` text,
	`enrollment_id` text,
	`custom_amount` integer NOT NULL,
	`reason` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`fee_type_id`) REFERENCES `fee_types`(`fee_type_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`class_id`) REFERENCES `classrooms`(`class_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`enrollment_id`) REFERENCES `classroom_enrollments`(`enrollment_id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "override_target_check" CHECK("fee_overrides"."class_id" IS NOT NULL OR "fee_overrides"."enrollment_id" IS NOT NULL)
);
--> statement-breakpoint
CREATE INDEX `fee_overrides_fee_type_idx` ON `fee_overrides` (`fee_type_id`);--> statement-breakpoint
CREATE INDEX `fee_overrides_class_idx` ON `fee_overrides` (`class_id`);--> statement-breakpoint
CREATE INDEX `fee_overrides_enrollment_idx` ON `fee_overrides` (`enrollment_id`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_student_payments` (
	`payment_id` text PRIMARY KEY NOT NULL,
	`assignment_id` text NOT NULL,
	`amount_received` integer NOT NULL,
	`currency_received` text DEFAULT 'CDF' NOT NULL,
	`applied_exchange_rate` integer NOT NULL,
	`amount_converted` integer NOT NULL,
	`payment_method` text NOT NULL,
	`transaction_reference` text,
	`user_id` text,
	`school_id` text NOT NULL,
	`year_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`assignment_id`) REFERENCES `fee_assignments`(`assignment_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`year_id`) REFERENCES `study_years`(`year_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_student_payments`("payment_id", "assignment_id", "amount_received", "currency_received", "applied_exchange_rate", "amount_converted", "payment_method", "transaction_reference", "user_id", "school_id", "year_id", "created_at", "updated_at", "deleted_at") SELECT "payment_id", "assignment_id", "amount_received", "currency_received", "applied_exchange_rate", "amount_converted", "payment_method", "transaction_reference", "user_id", "school_id", "year_id", "created_at", "updated_at", "deleted_at" FROM `student_payments`;--> statement-breakpoint
DROP TABLE `student_payments`;--> statement-breakpoint
ALTER TABLE `__new_student_payments` RENAME TO `student_payments`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `payments_assignment_idx` ON `student_payments` (`assignment_id`);--> statement-breakpoint
CREATE INDEX `payments_school_year_idx` ON `student_payments` (`school_id`,`year_id`);--> statement-breakpoint
CREATE INDEX `payments_user_idx` ON `student_payments` (`user_id`);--> statement-breakpoint
ALTER TABLE `fee_assignments` ADD `is_customized` integer DEFAULT false NOT NULL;