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
-- Table structure for table `loyalty_program`
--

DROP TABLE IF EXISTS `loyalty_program`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loyalty_program` (
  `loyalty_id` int NOT NULL AUTO_INCREMENT,
  `passenger_id` int NOT NULL,
  `membership_number` varchar(30) NOT NULL,
  `tier` enum('Silver','Gold','Platinum','Diamond') DEFAULT NULL,
  `miles_balance` int DEFAULT '0',
  `discount` decimal(3,2) DEFAULT '0.00',
  PRIMARY KEY (`loyalty_id`),
  UNIQUE KEY `passenger_id` (`passenger_id`),
  CONSTRAINT `loyalty_program_ibfk_1` FOREIGN KEY (`passenger_id`) REFERENCES `passenger` (`passenger_id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loyalty_program`
--

LOCK TABLES `loyalty_program` WRITE;
/*!40000 ALTER TABLE `loyalty_program` DISABLE KEYS */;
INSERT INTO `loyalty_program` VALUES (1,1,'MEM-1','Diamond',24578,0.15),(2,2,'MEM-2','Silver',500,0.00),(3,3,'MEM-3','Gold',4000,0.05),(4,4,'MEM-4','Silver',5500,0.00),(5,5,'MEM-5','Silver',0,0.00),(6,6,'MEM-6','Diamond',27491,0.15),(7,7,'MEM-7','Silver',5500,0.00),(8,8,'MEM-8','Gold',1000,0.05),(9,9,'MEM-9','Silver',0,0.00),(10,10,'MEM-10','Silver',0,0.00),(11,56017,'MEM-56017','Silver',0,0.00),(14,54242,'MEM-54242','Silver',500,0.00),(15,48920,'MEM-48920','Silver',500,0.00),(16,56018,'MEM-56018','Silver',500,0.00),(17,16,'MEM-16','Silver',500,0.00);
/*!40000 ALTER TABLE `loyalty_program` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-19 15:13:54
