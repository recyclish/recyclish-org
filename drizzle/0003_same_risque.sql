CREATE TABLE `facility_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`facilityId` varchar(64) NOT NULL,
	`facilityName` varchar(255) NOT NULL,
	`facilityAddress` varchar(500) NOT NULL,
	`issueType` enum('permanently_closed','temporarily_closed','wrong_address','wrong_phone','wrong_hours','wrong_materials','duplicate_listing','other') NOT NULL,
	`description` text,
	`reporterName` varchar(255),
	`reporterEmail` varchar(320),
	`status` enum('pending','reviewed','resolved','dismissed') NOT NULL DEFAULT 'pending',
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `facility_reports_id` PRIMARY KEY(`id`)
);
