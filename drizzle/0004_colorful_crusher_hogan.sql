CREATE TABLE `fee_schedules` (
	`schedule_id` text PRIMARY KEY NOT NULL,
	`installment_name` text NOT NULL,
	`fee_type_id` text NOT NULL,
	`created_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	`updated_at` integer DEFAULT '"1970-01-01T00:00:00.000Z"' NOT NULL,
	FOREIGN KEY (`fee_type_id`) REFERENCES `fee_types`(`fee_type_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
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
	FOREIGN KEY (`year_id`) REFERENCES `schools`(`school_id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "exactly_one_target_check" CHECK(
        ("__new_fee_configurations"."section" IS NOT NULL AND "__new_fee_configurations"."option_id" IS NULL AND "__new_fee_configurations"."classroom_id" IS NULL)
        OR
        ("__new_fee_configurations"."section" IS NULL AND "__new_fee_configurations"."option_id" IS NOT NULL AND "__new_fee_configurations"."classroom_id" IS NULL)
        OR
        ("__new_fee_configurations"."section" IS NULL AND "__new_fee_configurations"."option_id" IS NULL AND "__new_fee_configurations"."classroom_id" IS NOT NULL)
      )
);
--> statement-breakpoint
INSERT INTO `__new_fee_configurations`("fee_config_id", "name", "total_amount", "currency", "section", "option_id", "classroom_id", "fee_type_id", "school_id", "year_id", "created_at", "updated_at") SELECT "fee_config_id", "name", "total_amount", "currency", NULL, "option_id", "classroom_id", "fee_type_id", "school_id", "year_id", "created_at", "updated_at" FROM `fee_configurations`;--> statement-breakpoint
DROP TABLE `fee_configurations`;--> statement-breakpoint
ALTER TABLE `__new_fee_configurations` RENAME TO `fee_configurations`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
DROP INDEX `enrollment_fee_config_unique_idx`;--> statement-breakpoint
ALTER TABLE `fee_assignments` ADD `schedule_id` text NOT NULL REFERENCES fee_schedules(schedule_id);--> statement-breakpoint
CREATE UNIQUE INDEX `enrollment_fee_config_schedule_unique_idx` ON `fee_assignments` (`enrollment_id`,`fee_config_id`,`schedule_id`);