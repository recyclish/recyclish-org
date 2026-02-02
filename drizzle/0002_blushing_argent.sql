CREATE TABLE `user_favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`facilityId` varchar(64) NOT NULL,
	`facilityName` varchar(255) NOT NULL,
	`facilityAddress` varchar(500) NOT NULL,
	`facilityCategory` varchar(100),
	`facilityPhone` varchar(50),
	`facilityWebsite` varchar(500),
	`facilityFeedstock` text,
	`facilityLatitude` varchar(20),
	`facilityLongitude` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_favorites_id` PRIMARY KEY(`id`)
);
