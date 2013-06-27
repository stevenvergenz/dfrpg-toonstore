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
INSERT INTO `Characters` VALUES ('lifeson','Andrew Lifeson','tester','{\"name\":\"Andrew Lifeson\",\"player\":\"Steven Vergenz\",\"aspects\":{\"high_concept\":{\"name\":\"White Council Footsoldier\",\"description\":\"\"},\"trouble\":{\"name\":\"Still On The Battlefield\",\"description\":\"\"},\"aspects\":[{\"name\":\"I Am From A Gutter Too\",\"description\":\"\"},{\"name\":\"Warden\'s Honor\",\"description\":\"\"},{\"name\":\"No Kill Like Overkill\",\"description\":\"\"},{\"name\":\"Crazy Enough To Work\",\"description\":\"\"},{\"name\":\"Conviction Is Both Sword And Shield\",\"description\":\"\"}]},\"stress\":[{\"name\":\"Physical\",\"skill\":\"Endurance\",\"strength\":4,\"used\":[2],\"armor\":[{\"vs\":\"Physical\",\"strength\":2}]},{\"name\":\"Mental\",\"skill\":\"Conviction\",\"strength\":4,\"used\":[1,2]},{\"name\":\"Social\",\"skill\":\"Presence\",\"strength\":2,\"used\":[]}],\"consequences\":[{\"type\":\"Mild\",\"mode\":\"Any\",\"used\":false,\"aspect\":\"\"},{\"type\":\"Mild\",\"mode\":\"P\",\"used\":false,\"aspect\":\"\"},{\"type\":\"Mild\",\"mode\":\"M\",\"used\":false,\"aspect\":\"\"},{\"type\":\"Moderate\",\"mode\":\"Any\",\"used\":false,\"aspect\":\"\"},{\"type\":\"Severe\",\"mode\":\"Any\",\"used\":false,\"aspect\":\"\"},{\"type\":\"Extreme\",\"mode\":\"Any\",\"used\":false,\"aspect\":\"Replace permanent\"}],\"totals\":{\"power_level\":12,\"skill_cap\":5,\"skills_spent\":42,\"skills_available\":0,\"base_refresh\":12,\"adjusted_refresh\":2,\"fate_points\":3},\"skills\":{\"1\":[\"Presence\",\"Empathy\",\"Fists\",\"Resources\",\"Investigation\"],\"2\":[\"Might\",\"Survival\",\"Alertness\"],\"3\":[\"Contacts\",\"Weapons\",\"Intimidation\"],\"4\":[\"Discipline\",\"Lore\",\"Athletics\"],\"5\":[\"Conviction\",\"Endurance\"]},\"powers\":[{\"cost\":-4,\"name\":\"Evocation + Refinement\",\"description\":\"Elements: Spirit, Air, Water\\nSpec: +2 power to spirit evocation\\nSpec: +1 control to air evocation\\nFocus item: Crystal belt buckle\\n- +1 control to offensive spirit magic\\nFocus item: Hawk skin gloves\\n- +1 power to defensive air magic\"},{\"cost\":-3,\"name\":\"Thaumaturgy\",\"description\":\"Spec: +1 control to spectromancy\"},{\"cost\":-1,\"name\":\"The Sight\",\"description\":\"\"},{\"cost\":0,\"name\":\"Soulgaze\",\"description\":\"\"},{\"cost\":0,\"name\":\"Wizard\'s Constitution\",\"description\":\"\"},{\"cost\":-1,\"name\":\"Switchblade master\",\"description\":\"+1 to attacks with short blades\"},{\"cost\":-1,\"name\":\"Controlled outburst\",\"description\":\"Zone attacks avoid allies\"}]}','White Council Footsoldier','2013-06-26');
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
INSERT INTO `Users` VALUES ('tester','tester@example.com','2013-06-26','2013-06-26','≥?‹#ùô◊‹ﬂéR=ÑX/âÈOÍÍ€ﬂ‘ûÊK’','„.wæt,5\rJlY( áWQê~∫˘1mÍÕ\rÍ«');
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

-- Dump completed on 2013-06-26 17:52:57
