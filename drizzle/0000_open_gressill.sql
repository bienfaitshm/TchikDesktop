CREATE TABLE `authentication` (
	`id` text(10) PRIMARY KEY NOT NULL,
	`updated_at` integer,
	`created_at` integer NOT NULL,
	`name` text(256) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text(10) PRIMARY KEY NOT NULL,
	`updated_at` integer,
	`created_at` integer NOT NULL,
	`name` text(256) NOT NULL,
	`is_admin` integer DEFAULT false NOT NULL
);
