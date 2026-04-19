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
-- Table structure for table `aircraft`
--

DROP TABLE IF EXISTS `aircraft`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aircraft` (
  `aircraft_id` int NOT NULL,
  `model` varchar(30) NOT NULL,
  `manufacturer` varchar(30) NOT NULL,
  `seating_capacity` int NOT NULL,
  `max_baggage_capacity` int DEFAULT NULL,
  `mph` int DEFAULT NULL,
  PRIMARY KEY (`aircraft_id`),
  CONSTRAINT `aircraft_chk_1` CHECK ((`seating_capacity` > 0)),
  CONSTRAINT `aircraft_chk_2` CHECK ((`max_baggage_capacity` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aircraft`
--

LOCK TABLES `aircraft` WRITE;
/*!40000 ALTER TABLE `aircraft` DISABLE KEYS */;
INSERT INTO `aircraft` VALUES (1,'Boeing 737-800','Boeing',23,3200,714),(2,'Boeing 737 MAX 8','Boeing',178,3400,551),(3,'Boeing 777-300ER','Boeing',396,6000,710),(4,'Boeing 787-9 Dreamliner','Boeing',290,5000,501),(5,'Airbus A320neo','Airbus',180,3100,772),(6,'Airbus A321neo','Airbus',220,3400,659),(7,'Airbus A330-300','Airbus',300,5200,778),(8,'Airbus A350-900','Airbus',325,5500,514),(9,'Embraer E175','Embraer',76,1200,634),(10,'Embraer E195','Embraer',124,1800,531),(11,'Boeing 747-8','Boeing',467,6500,551),(12,'Airbus A380-800','Airbus',525,7000,662),(13,'Boeing 757-200','Boeing',239,2800,557),(14,'Airbus A319','Airbus',124,2500,600),(15,'Bombardier CRJ900','Bombardier',90,1500,531);
/*!40000 ALTER TABLE `aircraft` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-19 15:13:33
