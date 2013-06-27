-- MySQL dump 10.13  Distrib 5.1.69, for redhat-linux-gnu (x86_64)
--
-- Host: localhost    Database: toonstore
-- ------------------------------------------------------
-- Server version	5.1.69

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Characters`
--

DROP TABLE IF EXISTS `Characters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Characters` (
  `canonical_name` char(40) NOT NULL,
  `name` char(40) NOT NULL,
  `owner` char(40) NOT NULL,
  `info` text,
  `concept` char(40) DEFAULT NULL,
  `created_on` date DEFAULT NULL,
  PRIMARY KEY (`canonical_name`,`owner`),
  KEY `owner` (`owner`),
  CONSTRAINT `Characters_ibfk_1` FOREIGN KEY (`owner`) REFERENCES `Users` (`username`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Characters`
--

LOCK TABLES `Characters` WRITE;
/*!40000 ALTER TABLE `Characters` DISABLE KEYS */;
INSERT INTO `Characters` VALUES ('dresden','Harry Dresden','tester','{\"name\":\"Harry Dresden\",\"player\":\"Test McGee\",\"aspects\":{\"high_concept\":{\"name\":\"Wizard P.I.\",\"description\":\"\"},\"trouble\":{\"name\":\"\",\"description\":\"\"},\"aspects\":[]},\"stress\":[{\"name\":\"Physical\",\"skill\":\"Endurance\",\"strength\":2,\"used\":[],\"armor\":[]},{\"name\":\"Mental\",\"skill\":\"Conviction\",\"strength\":2,\"used\":[],\"armor\":[]},{\"name\":\"Social\",\"skill\":\"Presence\",\"strength\":2,\"used\":[],\"armor\":[]}],\"consequences\":[{\"type\":\"Mild\",\"mode\":\"Any\",\"used\":false,\"aspect\":\"\"},{\"type\":\"Moderate\",\"mode\":\"Any\",\"used\":false,\"aspect\":\"\"},{\"type\":\"Severe\",\"mode\":\"Any\",\"used\":false,\"aspect\":\"\"},{\"type\":\"Extreme\",\"mode\":\"Any\",\"used\":false,\"aspect\":\"Replace permanent\"}],\"totals\":{\"power_level\":\"Submerged\",\"base_refresh\":12,\"skill_cap\":5,\"skills_total\":42,\"skills_spent\":0,\"adjusted_refresh\":12,\"fate_points\":0},\"skills\":{\"1\":[],\"2\":[],\"3\":[],\"4\":[],\"5\":[]},\"powers\":[]}','Wizard P.I.','2013-06-27');
/*!40000 ALTER TABLE `Characters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Tokens`
--

DROP TABLE IF EXISTS `Tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Tokens` (
  `token` binary(16) NOT NULL,
  `requested` date DEFAULT NULL,
  `username` char(40) NOT NULL,
  `type` enum('forget','activate') DEFAULT NULL,
  PRIMARY KEY (`token`),
  KEY `username` (`username`),
  CONSTRAINT `Tokens_ibfk_1` FOREIGN KEY (`username`) REFERENCES `Users` (`username`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Tokens`
--

LOCK TABLES `Tokens` WRITE;
/*!40000 ALTER TABLE `Tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `Tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Users` (
  `username` char(40) NOT NULL,
  `email` char(40) NOT NULL,
  `registered` date DEFAULT NULL,
  `last_login` date DEFAULT NULL,
  `password` binary(32) DEFAULT NULL,
  `salt` binary(32) DEFAULT NULL,
  PRIMARY KEY (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES ('tester','tester@example.com','2013-06-27','2013-06-27','H©½…–v­Ÿ¨Ñ6`Üx›Ë¯è]øÁvúîZ(','¹bê\0}¶¹ETÖçùN\nD¼óH¯¸£u¼@¶÷','Test McGee');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2013-06-27 13:15:55
