PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_daily_exchange_rates` (
	`rate_id` text PRIMARY KEY NOT NULL,
	`date` integer NOT NULL,
	`currency_from` text NOT NULL,
	`currency_to` text NOT NULL,
	`rate` integer NOT NULL,
	`school_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`school_id`) REFERENCES `schools`(`school_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_daily_exchange_rates`("rate_id", "date", "currency_from", "currency_to", "rate", "school_id", "created_at", "updated_at") SELECT "rate_id", "date", "currency_from", "currency_to", "rate", "school_id", "created_at", "updated_at" FROM `daily_exchange_rates`;--> statement-breakpoint
DROP TABLE `daily_exchange_rates`;--> statement-breakpoint
ALTER TABLE `__new_daily_exchange_rates` RENAME TO `daily_exchange_rates`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `daily_rate_unique_idx` ON `daily_exchange_rates` (`school_id`,`date`,`currency_from`,`currency_to`);--> statement-breakpoint
CREATE INDEX `daily_rate_date_idx` ON `daily_exchange_rates` (`date`);