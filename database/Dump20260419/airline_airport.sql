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
-- Table structure for table `airport`
--

DROP TABLE IF EXISTS `airport`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `airport` (
  `airport_id` int NOT NULL,
  `airport_code` varchar(10) NOT NULL,
  `airport_name` varchar(60) NOT NULL,
  `city_id` int NOT NULL,
  `timezone` varchar(30) DEFAULT NULL,
  `number_of_terminals` int DEFAULT NULL,
  PRIMARY KEY (`airport_id`),
  KEY `city_id` (`city_id`),
  CONSTRAINT `airport_ibfk_1` FOREIGN KEY (`city_id`) REFERENCES `city` (`city_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `airport`
--

LOCK TABLES `airport` WRITE;
/*!40000 ALTER TABLE `airport` DISABLE KEYS */;
INSERT INTO `airport` VALUES (1,'JFK','John F. Kennedy International Airport',1,'America/New_York',8),(2,'LAX','Los Angeles International Airport',2,'America/Los_Angeles',9),(3,'ORD','Hare International Airport',3,'America/Chicago',8),(4,'IAH','George Bush Intercontinental Airport',4,'America/Chicago',5),(5,'MIA','Miami International Airport',5,'America/New_York',6),(6,'LHR','London Heathrow Airport',6,'Europe/London',5),(7,'LGW','London Gatwick Airport',6,'Europe/London',2),(8,'MAN','Manchester Airport',7,'Europe/London',3),(9,'YYZ','Toronto Pearson International Airport',9,'America/Toronto',5),(10,'YVR','Vancouver International Airport',10,'America/Vancouver',4),(11,'MEX','Mexico City International Airport',12,'America/Mexico_City',6),(12,'CUN','Cancún International Airport',13,'America/Cancun',4),(13,'CDG','Charles de Gaulle Airport',15,'Europe/Paris',9),(14,'ORY','Paris-Orly Airport',15,'Europe/Paris',4),(15,'FRA','Frankfurt Airport',19,'Europe/Berlin',5),(16,'MUC','Munich Airport',18,'Europe/Berlin',3),(17,'MAD','Adolfo Suárez Madrid Barajas Airport',20,'Europe/Madrid',5),(18,'BCN','Josep Tarradellas Barcelona-El Prat Airport',21,'Europe/Madrid',4),(19,'FCO','Leonardo da Vinci?Fiumicino Airport',22,'Europe/Rome',4),(20,'MXP','Milan Malpensa Airport',23,'Europe/Rome',2),(21,'HND','Tokyo Haneda Airport',25,'Asia/Tokyo',3),(22,'NRT','Narita International Airport',25,'Asia/Tokyo',3),(23,'SYD','Sydney Kingsford Smith Airport',27,'Australia/Sydney',3),(24,'MEL','Melbourne Airport',28,'Australia/Melbourne',4),(25,'DEL','Indira Gandhi International Airport',29,'Asia/Kolkata',3),(26,'BOM','Chhatrapati Shivaji Maharaj International Airport',30,'Asia/Kolkata',3),(27,'GRU','São Paulo/Guarulhos International Airport',32,'America/Sao_Paulo',4),(28,'GIG','Rio de Janeiro/Galeão International Airport',33,'America/Sao_Paulo',3);
/*!40000 ALTER TABLE `airport` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-19 15:13:48
