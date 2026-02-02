CREATE TABLE `facility_reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`userName` varchar(255),
	`facilityId` varchar(64) NOT NULL,
	`facilityName` varchar(255) NOT NULL,
	`facilityAddress` varchar(500) NOT NULL,
	`rating` int NOT NULL,
	`title` varchar(255),
	`content` text,
	`serviceRating` int,
	`cleanlinessRating` int,
	`convenienceRating` int,
	`status` enum('published','pending','hidden') NOT NULL DEFAULT 'published',
	`adminNotes` text,
	`helpfulCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `facility_reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `review_helpful_votes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reviewId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `review_helpful_votes_id` PRIMARY KEY(`id`)
);
