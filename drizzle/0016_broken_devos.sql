PRAGMA foreign_keys = OFF;--> statement-breakpoint

-- 1. RECRÉATION DE STUDY_YEARS
CREATE TABLE `__new_study_years` (
    `year_id` text PRIMARY KEY NOT NULL,
    `year_name` text NOT NULL,
    `start_date` integer,
    `end_date` integer,
    `created_at` integer NOT NULL,
    `updated_at` integer NOT NULL,
    `deleted_at` integer
);--> statement-breakpoint

INSERT INTO `__new_study_years`("year_id", "year_name", "start_date", "end_date", "created_at", "updated_at") 
SELECT "year_id", "year_name", "start_date", "end_date", "created_at", "updated_at" FROM `study_years`;--> statement-breakpoint

DROP TABLE `study_years`;--> statement-breakpoint
ALTER TABLE `__new_study_years` RENAME TO `study_years`;--> statement-breakpoint

-- 2. RECRÉATION DE USERS
CREATE TABLE `__new_users` (
    `user_id` text PRIMARY KEY NOT NULL,
    `last_name` text NOT NULL,
    `middle_name` text NOT NULL,
    `first_name` text,
    `username` text NOT NULL,
    `password` text NOT NULL,
    `gender` text DEFAULT 'M' NOT NULL,
    `role` text DEFAULT 'STUDENT' NOT NULL,
    `birth_date` integer,
    `birth_place` text,
    `school_id` text NOT NULL,
    `created_at` integer NOT NULL,
    `updated_at` integer NOT NULL,
    `deleted_at` integer,
    FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint

INSERT INTO `__new_users`("user_id", "last_name", "middle_name", "first_name", "username", "password", "gender", "role", "birth_date", "birth_place", "school_id", "created_at", "updated_at")  SELECT "user_id", "last_name", "middle_name", "first_name", "username", "password", "gender", "role", "birth_date", "birth_place", "school_id", "created_at", "updated_at" FROM `users`;--> statement-breakpoint

DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint

CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE INDEX `users_school_idx` ON `users` (`school_id`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `users_school_last_name_idx` ON `users` (`school_id`,`last_name`);--> statement-breakpoint
CREATE INDEX `users_school_middle_name_idx` ON `users` (`school_id`,`middle_name`);--> statement-breakpoint
CREATE INDEX `users_school_first_name_idx` ON `users` (`school_id`,`first_name`);--> statement-breakpoint

-- 3. RECRÉATION DE TUTORS
CREATE TABLE `__new_tutors` (
    `tutor_id` text PRIMARY KEY NOT NULL,
    `profession` text,
    `address` text,
    `phone_number` text,
    `user_id` text NOT NULL,
    `school_id` text NOT NULL,
    `created_at` integer NOT NULL,
    `updated_at` integer NOT NULL,
    `deleted_at` integer,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE cascade,
    FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint

INSERT INTO `__new_tutors`("tutor_id", "profession", "address", "phone_number", "user_id", "school_id", "created_at", "updated_at") 
SELECT "tutor_id", "profession", "address", "phone_number", "user_id", "school_id", "created_at", "updated_at" FROM `tutors`;--> statement-breakpoint

DROP TABLE `tutors`;--> statement-breakpoint
ALTER TABLE `__new_tutors` RENAME TO `tutors`;--> statement-breakpoint

CREATE UNIQUE INDEX `tutors_user_id_unique` ON `tutors` (`user_id`);--> statement-breakpoint
CREATE INDEX `tutors_school_idx` ON `tutors` (`school_id`);--> statement-breakpoint
CREATE INDEX `tutors_phone_number_idx` ON `tutors` (`phone_number`);--> statement-breakpoint
CREATE INDEX `tutors_school_phone_idx` ON `tutors` (`school_id`,`phone_number`);--> statement-breakpoint
CREATE INDEX `users_idx` ON `tutors` (`user_id`);--> statement-breakpoint

-- 4. MODIFICATIONS DES AUTRES TABLES
ALTER TABLE `classroom_enrollments` ADD `is_free` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `classroom_enrollments` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `classrooms` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `options` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `schools` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `daily_exchange_rates` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `fee_assignments` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `fee_configurations` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `fee_schedules` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `fee_types` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `student_payments` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `wallets` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `classroom_enrollment_actions` ADD `deleted_at` integer;--> statement-breakpoint
ALTER TABLE `export_histories` ADD `deleted_at` integer;--> statement-breakpoint

-- RÉACTIVATION DES CLÉS ÉTRANGÈRES À LA TOUTE FIN
PRAGMA foreign_keys = ON;