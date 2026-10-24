-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: interndesk
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `application_messages`
--

DROP TABLE IF EXISTS `application_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `application_messages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `applicationId` bigint unsigned NOT NULL,
  `senderEmail` varchar(255) NOT NULL,
  `senderName` varchar(255) NOT NULL DEFAULT 'User',
  `senderRole` varchar(20) NOT NULL,
  `message` text NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `applicationId` (`applicationId`),
  CONSTRAINT `application_messages_ibfk_1` FOREIGN KEY (`applicationId`) REFERENCES `applications` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application_messages`
--

LOCK TABLES `application_messages` WRITE;
/*!40000 ALTER TABLE `application_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `application_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `applications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `jobId` bigint unsigned NOT NULL,
  `jobTitle` varchar(255) DEFAULT 'Internship',
  `title` varchar(255) DEFAULT 'Internship',
  `company` varchar(255) DEFAULT '',
  `companyId` bigint unsigned DEFAULT NULL,
  `logoColor` varchar(50) DEFAULT '#0A66C2',
  `category` varchar(50) DEFAULT 'IT',
  `status` varchar(100) DEFAULT 'Under Review',
  `nextStep` text,
  `appliedAt` datetime DEFAULT NULL,
  `studentId` bigint unsigned DEFAULT NULL,
  `studentName` varchar(255) DEFAULT 'Student Applicant',
  `name` varchar(255) DEFAULT 'Student Applicant',
  `candidateEmail` varchar(255) DEFAULT '',
  `candidatePhone` varchar(50) DEFAULT '',
  `phone` varchar(50) DEFAULT '',
  `college` varchar(255) DEFAULT '',
  `course` varchar(255) DEFAULT '',
  `score` int DEFAULT '88',
  `resumeKey` varchar(512) DEFAULT 'resume.pdf',
  `coverNote` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobId` (`jobId`),
  CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`jobId`) REFERENCES `internships` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applications`
--

LOCK TABLES `applications` WRITE;
/*!40000 ALTER TABLE `applications` DISABLE KEYS */;
INSERT INTO `applications` VALUES (1,12,'Full Stack Java Developer','Full Stack Java Developer','KHUSHISAGALE',8,'#0A66C2','IT','Under Review','Application submitted. The hiring team will review your profile shortly.','2026-10-22 06:06:45',NULL,'khushisagale Student','khushisagale Student','khushisagale@gmail.com','8767436539','8767436539','State Technical University','B.Tech Computer Science',88,'resume_1792649205898','','2026-10-22 06:06:45','2026-10-22 06:06:45');
/*!40000 ALTER TABLE `applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `companies` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `domain` varchar(255) DEFAULT '',
  `industry` varchar(255) DEFAULT 'Software & Technology',
  `location` varchar(255) DEFAULT 'Bengaluru, India',
  `rating` float DEFAULT '4.5',
  `reviewsCount` int DEFAULT '1',
  `openPositionsCount` int DEFAULT '0',
  `description` text,
  `tagline` varchar(512) DEFAULT '',
  `logoColor` varchar(50) DEFAULT '#0A66C2',
  `isVerified` tinyint(1) DEFAULT '1',
  `verificationStatus` varchar(50) DEFAULT 'verified',
  `website` varchar(512) DEFAULT '',
  `recruiterName` varchar(255) DEFAULT '',
  `recruiterEmail` varchar(255) DEFAULT '',
  `recruiterDesignation` varchar(255) DEFAULT '',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES (7,'Acme Technologies','acme.com','Software & Technology','Bengaluru, India',0,0,1,'Building next-generation developer tools.','Innovation for creators','#0A66C2',1,'verified','https://acme.com','Alice Smith','alice@acme.com','Talent Acquisition','2026-10-12 05:55:52','2026-10-12 05:55:52'),(8,'KHUSHISAGALE','gmail.com','Software & Technology','Remote',0,0,1,'','','#0A66C2',1,'verified','https://gmail.com','khushisagale','khushisagale@gmail.com','Talent Acquisition Partner','2026-10-22 05:57:27','2026-10-22 06:05:13');
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `internships`
--

DROP TABLE IF EXISTS `internships`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `internships` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL DEFAULT 'Internship',
  `company` varchar(255) DEFAULT '',
  `companyId` bigint unsigned DEFAULT NULL,
  `logo` varchar(10) DEFAULT 'CO',
  `logoColor` varchar(50) DEFAULT '#0A66C2',
  `location` varchar(255) DEFAULT 'Remote',
  `workMode` varchar(50) DEFAULT 'Remote',
  `mode` varchar(50) DEFAULT 'Remote',
  `stipend` varchar(100) DEFAULT 'Unpaid',
  `stipendNum` int DEFAULT '0',
  `stipendAmount` int DEFAULT '0',
  `stipendCurrency` varchar(10) DEFAULT 'INR',
  `stipendPeriod` varchar(20) DEFAULT 'month',
  `duration` varchar(50) DEFAULT '3 Months',
  `category` varchar(50) DEFAULT 'IT',
  `department` varchar(255) DEFAULT 'Software Development',
  `skills` text,
  `perks` text,
  `postedDate` varchar(100) DEFAULT 'Just now',
  `posted` varchar(100) DEFAULT 'Today',
  `ago` varchar(100) DEFAULT 'Just now',
  `openings` int DEFAULT '1',
  `deadline` date DEFAULT NULL,
  `description` text,
  `responsibilities` text,
  `eligibility` text,
  `status` varchar(50) DEFAULT 'Active',
  `applicants` int DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `minCgpa` float DEFAULT NULL,
  `selectionSteps` text,
  PRIMARY KEY (`id`),
  KEY `companyId` (`companyId`),
  CONSTRAINT `internships_ibfk_1` FOREIGN KEY (`companyId`) REFERENCES `companies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `internships`
--

LOCK TABLES `internships` WRITE;
/*!40000 ALTER TABLE `internships` DISABLE KEYS */;
INSERT INTO `internships` VALUES (11,'Full Stack Developer Intern','Acme Technologies',7,'AT','#0A66C2','Remote','Remote','Remote','₹25,000 / month',25000,25000,'INR','month','3 Months','IT','Software Development','[\"React\",\"Node.js\"]','[\"Certificate\",\"PPO\"]','Just now','Today','Just now',2,'2026-11-30','Work on cutting edge full stack apps.','','','Active',0,'2026-10-12 05:55:52','2026-10-12 05:55:52',NULL,NULL),(12,'Full Stack Java Developer','KHUSHISAGALE',8,'K','#0A66C2','Pune, Maharashtra','On-site','On-site','Unpaid',0,0,'INR','month','6 Months','IT','Full Stack Development','[\"java\",\"React.js\",\"Node.js\",\"Mysql\",\"Express.js\"]','[\"Certificate\",\"Letter of Recommendation\"]','Just now','Today','Just now',3,'2026-10-26','Full stack java devloper','0-1 year Experince ,','mca ,bca.,msc','Active',1,'2026-10-22 06:05:13','2026-10-22 06:06:45',8,'[]');
/*!40000 ALTER TABLE `internships` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `userId` bigint unsigned DEFAULT NULL,
  `userEmail` varchar(255) DEFAULT NULL,
  `title` varchar(512) DEFAULT '',
  `message` text,
  `status` varchar(100) DEFAULT NULL,
  `jobId` bigint unsigned DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `isRead` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,NULL,'khushisagale@gmail.com','Application Sent: Full Stack Java Developer','Your application for \"Full Stack Java Developer\" at KHUSHISAGALE has been received.','Under Review',12,'KHUSHISAGALE',1,'2026-10-22 06:06:45','2026-10-22 06:19:49');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resume_assets`
--

DROP TABLE IF EXISTS `resume_assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `resume_assets` (
  `resumeKey` varchar(100) NOT NULL,
  `ownerEmail` varchar(255) NOT NULL,
  `fileName` varchar(255) NOT NULL,
  `mimeType` varchar(120) NOT NULL,
  `dataBase64` longtext NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`resumeKey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resume_assets`
--

LOCK TABLES `resume_assets` WRITE;
/*!40000 ALTER TABLE `resume_assets` DISABLE KEYS */;
/*!40000 ALTER TABLE `resume_assets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(512) DEFAULT '',
  `name` varchar(255) DEFAULT '',
  `firstName` varchar(255) DEFAULT '',
  `lastName` varchar(255) DEFAULT '',
  `role` enum('student','company','admin') DEFAULT 'student',
  `companyId` bigint unsigned DEFAULT NULL,
  `companyName` varchar(255) DEFAULT '',
  `companyDomain` varchar(255) DEFAULT '',
  `designation` varchar(255) DEFAULT '',
  `profileComplete` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `email_8` (`email`),
  UNIQUE KEY `email_9` (`email`),
  UNIQUE KEY `email_10` (`email`),
  KEY `companyId` (`companyId`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`companyId`) REFERENCES `companies` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'recruiter@zenithai.com','','Aarav Singhania','Aarav','Singhania','company',NULL,'Zenith AI Corp','zenithai.com','Head of Talent',1,'2026-10-10 06:42:27','2026-10-10 06:42:27'),(2,'sagalekhushi@gmail.com','','Sagalekhushi','Sagalekhushi','Student','student',NULL,'','','',1,'2026-10-10 06:59:30','2026-10-10 06:59:30'),(3,'khushi@syntiaro.com','Abhijeet@26','Khushi Sagale','Khushi','Sagale','company',NULL,'','syntiaro.com','HR Manager ',1,'2026-10-10 07:57:16','2026-10-12 04:48:16'),(4,'khushisagale@gmail.com','Abhijeet@26','khushisagale','khushisagale','Student','company',8,'KHUSHISAGALE','','',1,'2026-10-10 08:06:25','2026-10-22 06:07:12'),(5,'abhijeet26@gmail.com','Abhijeet@26','abhijeet26','abhijeet26','Recruiter','student',NULL,'','','',1,'2026-10-10 08:07:09','2026-10-10 09:19:36'),(6,'vedhaai@gmail.com','VedhaAI@25','vedhaai','vedhaai','Student','student',NULL,'','','',1,'2026-10-22 05:53:23','2026-10-22 05:53:23'),(7,'admin@interndesk.in','','Site Admin','Site','Admin','admin',NULL,'','','',1,'2026-10-23 05:20:48','2026-10-23 05:20:48');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-23 15:26:34
