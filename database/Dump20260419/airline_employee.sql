-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: crossover.proxy.rlwy.net    Database: airline
-- ------------------------------------------------------
-- Server version	9.4.0

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
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee` (
  `id_number` varchar(30) NOT NULL,
  `first_name` varchar(60) NOT NULL,
  `last_name` varchar(60) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `email` varchar(120) DEFAULT NULL,
  `phone_number` varchar(30) DEFAULT NULL,
  `address` varchar(120) DEFAULT NULL,
  `card_number` varchar(30) DEFAULT NULL,
  `card_expiration_date` varchar(30) DEFAULT NULL,
  `card_security_code` varchar(30) DEFAULT NULL,
  `passport_status` tinyint(1) DEFAULT NULL,
  `visa_status` tinyint(1) DEFAULT NULL,
  `country_of_origin` int DEFAULT NULL,
  `seat_preferences` varchar(30) DEFAULT NULL,
  `meal_preferences` varchar(60) DEFAULT NULL,
  `special_needs` varchar(120) DEFAULT NULL,
  `department` varchar(60) DEFAULT NULL,
  `airport_id` int DEFAULT NULL,
  `position` varchar(60) DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `position_permission` varchar(60) DEFAULT NULL,
  `access_level` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id_number`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone_number` (`phone_number`),
  KEY `country_of_origin` (`country_of_origin`),
  KEY `airport_id` (`airport_id`),
  CONSTRAINT `employee_ibfk_1` FOREIGN KEY (`country_of_origin`) REFERENCES `country` (`country_id`),
  CONSTRAINT `employee_ibfk_2` FOREIGN KEY (`airport_id`) REFERENCES `airport` (`airport_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee`
--

LOCK TABLES `employee` WRITE;
/*!40000 ALTER TABLE `employee` DISABLE KEYS */;
INSERT INTO `employee` VALUES ('101','Chandler','Bing',NULL,'employee1@rha.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Friends',NULL,'Advertising','2026-04-12',NULL,NULL),('102','staff','staff',NULL,'staff@gmail.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-12',NULL,NULL),('103','Eli','Denton',NULL,'adenton@rha.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Hostess',NULL,'Member of the Marketing Committee ','2026-04-19',NULL,NULL),('201','Jane','Doe',NULL,'admin1@rha.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Administration',NULL,'System Administrator','2026-04-11',NULL,'Full'),('202','John','Doe',NULL,'admin2@rha.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Administration',NULL,'System Administrator','2026-04-11',NULL,'Full');
/*!40000 ALTER TABLE `employee` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-19 15:13:30
