CREATE TABLE `contact_events` (
	`contact_id` integer NOT NULL,
	`event_id` integer NOT NULL,
	PRIMARY KEY(`contact_id`, `event_id`),
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `contact_events_event_idx` ON `contact_events` (`event_id`);--> statement-breakpoint
CREATE TABLE `contact_tags` (
	`contact_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	PRIMARY KEY(`contact_id`, `tag_id`),
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `contact_tags_tag_idx` ON `contact_tags` (`tag_id`);--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`affiliation` text DEFAULT '' NOT NULL,
	`memo` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`date` text,
	`place` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `social_links` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`contact_id` integer NOT NULL,
	`service` text NOT NULL,
	`handle` text NOT NULL,
	FOREIGN KEY (`contact_id`) REFERENCES `contacts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `social_links_contact_idx` ON `social_links` (`contact_id`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_idx` ON `tags` (`name`);