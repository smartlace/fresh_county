-- MySQL dump 10.13  Distrib 9.4.0, for macos15.4 (arm64)
--
-- Host: localhost    Database: ecommerce_db
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `blog_categories`
--

DROP TABLE IF EXISTS `blog_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blog_categories` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text,
  `color` varchar(7) DEFAULT '#6B7280',
  `display_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_slug` (`slug`),
  KEY `idx_display_order` (`display_order`),
  KEY `idx_is_active` (`is_active`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `blog_categories_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog_categories`
--

LOCK TABLES `blog_categories` WRITE;
/*!40000 ALTER TABLE `blog_categories` DISABLE KEYS */;
INSERT INTO `blog_categories` (`id`, `name`, `slug`, `description`, `color`, `display_order`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES ('05b2037c-7ecb-11f0-a1b3-084957d83787','Company News','company-news','Latest updates and announcements from Fresh County','#F59E0B',1,1,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-08-21 21:11:28','2025-08-21 22:33:13'),('05b338e6-7ecb-11f0-a1b3-084957d83787','Product Updates','product-updates','New products, features, and improvements','#10B981',2,1,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-08-21 21:11:28','2025-08-21 21:11:28'),('05b340c0-7ecb-11f0-a1b3-084957d83787','Sustainability','sustainability','Our commitment to sustainable and eco-friendly practices','#059669',4,1,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-08-21 21:11:28','2025-08-21 21:11:28'),('05b3434a-7ecb-11f0-a1b3-084957d83787','Recipes & Tips','recipes-tips','Cooking tips, recipes, and food preparation guides','#DC2626',5,1,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-08-21 21:11:28','2025-08-21 21:11:28');
/*!40000 ALTER TABLE `blog_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blog_comments`
--

DROP TABLE IF EXISTS `blog_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blog_comments` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `post_id` varchar(36) NOT NULL,
  `parent_id` varchar(36) DEFAULT NULL,
  `author_name` varchar(100) NOT NULL,
  `author_email` varchar(255) NOT NULL,
  `author_website` varchar(255) DEFAULT NULL,
  `content` text NOT NULL,
  `status` enum('pending','approved','spam','trash') NOT NULL DEFAULT 'pending',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_post_id` (`post_id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `blog_comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `blog_posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `blog_comments_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `blog_comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog_comments`
--

LOCK TABLES `blog_comments` WRITE;
/*!40000 ALTER TABLE `blog_comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `blog_comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blog_post_tags`
--

DROP TABLE IF EXISTS `blog_post_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blog_post_tags` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `post_id` varchar(36) NOT NULL,
  `tag_id` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_post_tag` (`post_id`,`tag_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `blog_post_tags_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `blog_posts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `blog_post_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `blog_tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog_post_tags`
--

LOCK TABLES `blog_post_tags` WRITE;
/*!40000 ALTER TABLE `blog_post_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `blog_post_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blog_post_views`
--

DROP TABLE IF EXISTS `blog_post_views`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blog_post_views` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `post_id` varchar(36) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `user_agent` text,
  `referer` varchar(500) DEFAULT NULL,
  `viewed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_post_id` (`post_id`),
  KEY `idx_ip_address` (`ip_address`),
  KEY `idx_viewed_at` (`viewed_at`),
  CONSTRAINT `blog_post_views_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `blog_posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog_post_views`
--

LOCK TABLES `blog_post_views` WRITE;
/*!40000 ALTER TABLE `blog_post_views` DISABLE KEYS */;
/*!40000 ALTER TABLE `blog_post_views` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blog_posts`
--

DROP TABLE IF EXISTS `blog_posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blog_posts` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `excerpt` text,
  `content` longtext NOT NULL,
  `featured_image` varchar(500) DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text,
  `meta_keywords` text,
  `status` enum('draft','published','scheduled','archived') NOT NULL DEFAULT 'draft',
  `is_featured` tinyint(1) DEFAULT '0',
  `allow_comments` tinyint(1) DEFAULT '1',
  `view_count` int DEFAULT '0',
  `reading_time` int DEFAULT NULL COMMENT 'Estimated reading time in minutes',
  `published_at` datetime DEFAULT NULL,
  `scheduled_at` datetime DEFAULT NULL,
  `category_id` varchar(36) DEFAULT NULL,
  `created_by` varchar(36) NOT NULL,
  `updated_by` varchar(36) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_slug` (`slug`),
  KEY `idx_status` (`status`),
  KEY `idx_published_at` (`published_at`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_is_featured` (`is_featured`),
  KEY `idx_view_count` (`view_count`),
  KEY `idx_created_at` (`created_at`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `blog_posts_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `blog_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `blog_posts_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `blog_posts_ibfk_3` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog_posts`
--

LOCK TABLES `blog_posts` WRITE;
/*!40000 ALTER TABLE `blog_posts` DISABLE KEYS */;
INSERT INTO `blog_posts` (`id`, `title`, `slug`, `excerpt`, `content`, `featured_image`, `meta_title`, `meta_description`, `meta_keywords`, `status`, `is_featured`, `allow_comments`, `view_count`, `reading_time`, `published_at`, `scheduled_at`, `category_id`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES ('05b48296-7ecb-11f0-a1b3-084957d83787','Welcome to Fresh County Blog','welcome-to-fresh-county-blog','Welcome to the Fresh County blog! Here you\'ll find the latest news, product updates, recipes, and insights from our team awesome.','<h1>Welcome to Fresh County Blog.</h1>\n<p>We\'re excited to launch our new blog where we\'ll be sharing:</p>\n<ul>\n<li>Latest company news and updates</li>\n<li>New product announcements</li>\n<li>Fresh recipes and cooking tips</li>\n<li>Industry insights and trends</li>\n<li>Sustainability initiatives</li>\n</ul>\n<p>Stay tuned for regular updates and don\'t forget to subscribe to our newsletter!</p>\n<p>\nLorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc,\n</p>\n<p>\nLorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc,\n</p>\n<p>\nLorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc,\n</p>','http://localhost:3001/uploads/blog/blog-1757347895917-557299316-2.jpg','','','','published',0,1,13,2,'2025-08-21 06:11:00',NULL,'05b2037c-7ecb-11f0-a1b3-084957d83787','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-08-21 21:11:28','2025-09-08 23:12:54'),('ad7d86b2-19fa-4b10-9bd3-2ada255108a5','Another test blog','another-test-blog','Welcome to the Fresh County blog! Here you\'ll find the latest news, product updates, recipes, and insights from our team awesome.','<h1>Test blog title</h1>\n<p>Another test blog content</p>','http://localhost:3001/uploads/blog/blog-1757348007422-180027087-2.jpg','','','','published',0,1,17,5,NULL,NULL,'05b338e6-7ecb-11f0-a1b3-084957d83787','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-08 17:13:31','2025-09-08 22:12:54'),('d80e4948-95a0-47ab-88ba-84e8d53ec3c4','Test','Test','Welcome to the Fresh County blog! Here you\'ll find the latest news, product updates, recipes, and insights from our team awesome.','<p>\nLorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc,\n</p>\n<p>\nLorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc,\n</p>\n<p>\nLorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc,\n</p>','http://localhost:3001/uploads/blog/blog-1757347885696-259884971-1.jpg','','','','published',0,1,9,5,NULL,NULL,'05b3434a-7ecb-11f0-a1b3-084957d83787','b4f5d6b6-720e-11f0-9e14-dddbb3f09727','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-08-21 23:52:32','2025-09-08 22:20:15');
/*!40000 ALTER TABLE `blog_posts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blog_seo_settings`
--

DROP TABLE IF EXISTS `blog_seo_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blog_seo_settings` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `post_id` varchar(36) NOT NULL,
  `canonical_url` varchar(500) DEFAULT NULL,
  `og_title` varchar(255) DEFAULT NULL,
  `og_description` text,
  `og_image` varchar(500) DEFAULT NULL,
  `og_type` varchar(50) DEFAULT 'article',
  `twitter_card` varchar(50) DEFAULT 'summary_large_image',
  `twitter_title` varchar(255) DEFAULT NULL,
  `twitter_description` text,
  `twitter_image` varchar(500) DEFAULT NULL,
  `schema_markup` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `post_id` (`post_id`),
  CONSTRAINT `blog_seo_settings_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `blog_posts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog_seo_settings`
--

LOCK TABLES `blog_seo_settings` WRITE;
/*!40000 ALTER TABLE `blog_seo_settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `blog_seo_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `blog_tags`
--

DROP TABLE IF EXISTS `blog_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `blog_tags` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(50) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `color` varchar(7) DEFAULT '#3B82F6',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_slug` (`slug`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blog_tags`
--

LOCK TABLES `blog_tags` WRITE;
/*!40000 ALTER TABLE `blog_tags` DISABLE KEYS */;
INSERT INTO `blog_tags` (`id`, `name`, `slug`, `color`, `created_at`) VALUES ('05b3add0-7ecb-11f0-a1b3-084957d83787','Fresh Produce','fresh-produce','#10B981','2025-08-21 21:11:28'),('05b3af1a-7ecb-11f0-a1b3-084957d83787','Organic','organic','#059669','2025-08-21 21:11:28'),('05b3b064-7ecb-11f0-a1b3-084957d83787','Health','health','#DC2626','2025-08-21 21:11:28'),('05b3b0fa-7ecb-11f0-a1b3-084957d83787','Nutrition','nutrition','#7C3AED','2025-08-21 21:11:28'),('05b3b366-7ecb-11f0-a1b3-084957d83787','Sustainability','sustainability','#065F46','2025-08-21 21:11:28'),('05b3b410-7ecb-11f0-a1b3-084957d83787','Recipes','recipes','#DC2626','2025-08-21 21:11:28'),('05b3b4a6-7ecb-11f0-a1b3-084957d83787','Tips','tips','#6366F1','2025-08-21 21:11:28');
/*!40000 ALTER TABLE `blog_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `user_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `quantity` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product` (`user_id`,`product_id`),
  KEY `product_id` (`product_id`),
  KEY `idx_user` (`user_id`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(100) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `sort_order` int DEFAULT '0',
  `parent_id` varchar(36) DEFAULT NULL,
  `description` text,
  `image` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `slug_2` (`slug`),
  KEY `idx_name` (`name`),
  KEY `idx_active` (`is_active`),
  KEY `idx_sort_order` (`sort_order`),
  KEY `idx_parent` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` (`id`, `name`, `slug`, `sort_order`, `parent_id`, `description`, `image`, `is_active`, `created_at`, `updated_at`) VALUES ('068b835c-7c2a-11f0-a1b3-084957d83787','Fresh Vegetable','fresh-vegetable',1,NULL,'Farm-fresh vegetables delivered to you','http://localhost:3001/uploads/categories/category-1756822374089-353435712-veg.jpg',1,'2025-08-18 11:53:58','2025-09-02 14:12:56'),('068ba45e-7c2a-11f0-a1b3-084957d83787','Fruits','fruits',2,NULL,'Sweet and juicy fruits picked at perfect ripeness','http://localhost:3001/uploads/categories/category-1756760429111-468362454-fruits.jpg',1,'2025-08-18 11:53:58','2025-09-01 21:00:31'),('068ba5a8-7c2a-11f0-a1b3-084957d83787','Dairy & Eggs','dairy-eggs',3,NULL,'Fresh dairy products and farm eggs','http://localhost:3001/uploads/categories/category-1756822405887-345684831-egg.jpg',1,'2025-08-18 11:53:58','2025-09-02 14:13:27'),('068ba68e-7c2a-11f0-a1b3-084957d83787','Meat & Poultry','meat-poultry',4,NULL,'Premium quality meat and poultry products','http://localhost:3001/uploads/categories/category-1756822432778-466516907-meat.jpg',1,'2025-08-18 11:53:58','2025-09-02 14:13:54'),('068ba76a-7c2a-11f0-a1b3-084957d83787','Grains & Cereals','grains-cereals',5,NULL,'Healthy grains and cereals for your daily nutrition','https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop',1,'2025-08-18 11:53:58','2025-08-18 11:53:58'),('130aa610-7c7c-499a-a407-276f911d9f3d','Yoghurt','yoghurt-1756768286353',0,NULL,'Yoghurt','http://localhost:3001/uploads/categories/category-1756768284887-286691098-proxy-image.jpg',0,'2025-09-01 23:09:54','2025-09-02 14:37:56'),('185cef9d-a545-4336-b685-144ae1cf9e50','Salads','salads',0,NULL,'Salads','http://localhost:3001/uploads/categories/category-1756777251476-912981910-Big-Italian-Salad-1200x1553.jpg',1,'2025-09-02 01:40:53','2025-09-02 01:40:53'),('1f1adc81-277d-4820-9cc3-77045222b509','Kebabs','kebabs',0,NULL,'Kebabs','http://localhost:3001/uploads/categories/category-1756824170331-138651076-kebab.jpg',1,'2025-09-02 14:42:51','2025-09-02 14:42:51'),('2edc97e4-c67d-4965-a43d-52f12df20db9','Macaroons','macaroons',0,NULL,'Macaroons','http://localhost:3001/uploads/categories/category-1756824184553-919138990-macaroons.jpg',1,'2025-09-02 14:43:05','2025-09-02 14:43:05'),('44912870-7c82-11f0-a1b3-084957d83787','food','food',0,NULL,'food','http://localhost:3001/uploads/categories/category-1755555936659-122258627-gyoghurt2.jpg',0,'2025-08-18 22:25:38','2025-08-18 22:26:17'),('48b2c698-7c82-11f0-a1b3-084957d83787','food','food-1755555945574',0,NULL,'food','http://localhost:3001/uploads/categories/category-1755555936659-122258627-gyoghurt2.jpg',0,'2025-08-18 22:25:45','2025-08-18 22:26:14'),('4c8cec30-7c82-11f0-a1b3-084957d83787','food','food-1755555952037',0,NULL,'food','http://localhost:3001/uploads/categories/category-1755555936659-122258627-gyoghurt2.jpg',0,'2025-08-18 22:25:52','2025-08-18 22:25:52'),('64e4814e-7c82-11f0-a1b3-084957d83787','Food','food-1755555992877',0,NULL,'Food','http://localhost:3001/uploads/categories/category-1755555991400-156321967-gyoghurt2.jpg',0,'2025-08-18 22:26:32','2025-08-18 22:30:28'),('671e6400-e20b-4f76-83b7-6f58c27d0a7c','Food','food-1755558727298',0,NULL,'Food','http://localhost:3001/uploads/categories/category-1755556332968-251078402-salad.jpg',0,'2025-08-18 22:32:15','2025-08-18 23:12:07'),('6ea69f4a-7abd-47da-8562-8cf648e476ae','Yoghurt','yoghurt-1756823891593',0,NULL,'Yoghurt','http://localhost:3001/uploads/categories/category-1756823890016-466532915-youghurt.jpg',0,'2025-09-02 14:38:11','2025-09-02 14:38:35'),('9daa084a-901a-40ad-bb0d-0e4a7420f374','Snacks','snacks',0,NULL,'Snacks','http://localhost:3001/uploads/categories/category-1756823756526-431523748-snacks.jpg',1,'2025-09-02 14:35:59','2025-09-06 09:27:38'),('c35a3ce1-c8fd-4055-8e71-8904808411d9','Smoothies','smoothies',0,NULL,'Smoothies','http://localhost:3001/uploads/categories/category-1756824155890-405532935-smoothie.jpg',1,'2025-09-02 14:42:37','2025-09-02 14:42:37'),('c40d7d8a-2392-49df-b374-9590ff4fba4b','Yoghurt','yoghurt',0,NULL,'Yoghurt','http://localhost:3001/uploads/categories/category-1755556404934-102870955-gyoghurt.jpg',0,'2025-08-18 22:33:27','2025-08-18 23:12:20'),('f2403266-9d56-4376-a8b5-81b53d74ed33','Yoghurts','yoghurts',0,NULL,'Yoghurts','http://localhost:3001/uploads/categories/category-1756823937717-759741289-youghurt.jpg',1,'2025-09-02 14:38:59','2025-09-02 14:38:59');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupon_usage`
--

DROP TABLE IF EXISTS `coupon_usage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupon_usage` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `coupon_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `order_id` varchar(36) NOT NULL,
  `discount_amount` decimal(10,2) NOT NULL,
  `used_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_coupon_order` (`coupon_id`,`order_id`),
  KEY `order_id` (`order_id`),
  KEY `idx_coupon_usage_coupon` (`coupon_id`),
  KEY `idx_coupon_usage_user` (`user_id`),
  CONSTRAINT `coupon_usage_ibfk_1` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE,
  CONSTRAINT `coupon_usage_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `coupon_usage_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupon_usage`
--

LOCK TABLES `coupon_usage` WRITE;
/*!40000 ALTER TABLE `coupon_usage` DISABLE KEYS */;
INSERT INTO `coupon_usage` (`id`, `coupon_id`, `user_id`, `order_id`, `discount_amount`, `used_at`) VALUES ('1c32d1a4-8aa5-11f0-b67e-edb4be9dd75f','abf7f500-7d4c-11f0-a1b3-084957d83787','5fde4ff3-1248-4a9f-9d78-6c54298aa535','4ee29dcc-e633-47f4-b962-cac67703e6eb',1000.00,'2025-09-05 22:10:19'),('2e13c7c8-8aa7-11f0-b67e-edb4be9dd75f','abf7f500-7d4c-11f0-a1b3-084957d83787','9f9bfeac-8407-11f0-a1b3-084957d83787','79edccfb-d770-49c7-82de-1b245fd0e467',350.00,'2025-09-05 22:25:08'),('4d071c4a-8aa5-11f0-b67e-edb4be9dd75f','abf7f500-7d4c-11f0-a1b3-084957d83787','5fde4ff3-1248-4a9f-9d78-6c54298aa535','c6249715-c971-4408-8217-3deec7f2bf07',1400.00,'2025-09-05 22:11:41'),('61d4a968-8991-11f0-b67e-edb4be9dd75f','abf7f500-7d4c-11f0-a1b3-084957d83787','5fde4ff3-1248-4a9f-9d78-6c54298aa535','94c9b408-6ad8-44e3-8288-1023bcf9f0b3',350.00,'2025-09-04 13:16:35'),('752b4c22-8aa6-11f0-b67e-edb4be9dd75f','abf7f500-7d4c-11f0-a1b3-084957d83787','5fde4ff3-1248-4a9f-9d78-6c54298aa535','1bdc5e6a-fde0-44ca-88ef-3321ae122d9c',350.00,'2025-09-05 22:19:58'),('8c1a7dbe-8aa5-11f0-b67e-edb4be9dd75f','abf7f500-7d4c-11f0-a1b3-084957d83787','5fde4ff3-1248-4a9f-9d78-6c54298aa535','6ed040a6-c81d-4210-b5aa-262b0b5d67e7',400.00,'2025-09-05 22:13:27'),('ab665704-8bf1-11f0-b67e-edb4be9dd75f','abfb1d8e-7d4c-11f0-a1b3-084957d83787','0217bffe-8bdc-11f0-b67e-edb4be9dd75f','5aed4dfc-33f8-4215-a028-8656381b9366',500.00,'2025-09-07 13:50:52'),('bb1289b8-8aa5-11f0-b67e-edb4be9dd75f','abf7f500-7d4c-11f0-a1b3-084957d83787','5fde4ff3-1248-4a9f-9d78-6c54298aa535','23c40393-6c4d-42e7-9d1e-f4f0cf7552fb',400.00,'2025-09-05 22:14:46'),('c1c3ed92-8aa5-11f0-b67e-edb4be9dd75f','abf7f500-7d4c-11f0-a1b3-084957d83787','5fde4ff3-1248-4a9f-9d78-6c54298aa535','c6100180-7480-40f5-85e8-8eb66475183f',400.00,'2025-09-05 22:14:57'),('c3b3a558-8c34-11f0-b67e-edb4be9dd75f','abf7f500-7d4c-11f0-a1b3-084957d83787','9f9bfeac-8407-11f0-a1b3-084957d83787','ccaf77bb-36d6-4d69-840a-503325dc8487',1050.00,'2025-09-07 21:51:09'),('eb4e1dee-8aa6-11f0-b67e-edb4be9dd75f','abf7f500-7d4c-11f0-a1b3-084957d83787','9f9bfeac-8407-11f0-a1b3-084957d83787','976b8b4d-1f5a-4f9a-9af7-25960e9546e9',1150.00,'2025-09-05 22:23:16'),('f162e636-8b07-11f0-b67e-edb4be9dd75f','abfb1d8e-7d4c-11f0-a1b3-084957d83787','5fde4ff3-1248-4a9f-9d78-6c54298aa535','78cce5ab-a6b4-485b-8487-d468f644383f',500.00,'2025-09-06 09:57:47'),('f6465656-8aa3-11f0-b67e-edb4be9dd75f','abf7f500-7d4c-11f0-a1b3-084957d83787','5fde4ff3-1248-4a9f-9d78-6c54298aa535','da39b6be-a278-4103-8e9e-50f38fbd9306',600.00,'2025-09-05 22:02:06');
/*!40000 ALTER TABLE `coupon_usage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `code` varchar(50) NOT NULL,
  `name` varchar(200) NOT NULL,
  `description` text,
  `type` enum('percentage','fixed_amount') NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `minimum_order_amount` decimal(10,2) DEFAULT '0.00',
  `maximum_discount_amount` decimal(10,2) DEFAULT NULL,
  `usage_limit` int DEFAULT NULL,
  `usage_limit_per_customer` int DEFAULT NULL,
  `used_count` int DEFAULT '0',
  `starts_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `created_by` (`created_by`),
  KEY `idx_coupons_code` (`code`),
  KEY `idx_coupons_active` (`is_active`),
  KEY `idx_coupons_dates` (`starts_at`,`expires_at`),
  CONSTRAINT `coupons_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` (`id`, `code`, `name`, `description`, `type`, `discount_value`, `minimum_order_amount`, `maximum_discount_amount`, `usage_limit`, `usage_limit_per_customer`, `used_count`, `starts_at`, `expires_at`, `is_active`, `created_at`, `updated_at`, `created_by`) VALUES ('1b66093e-cb93-4256-9ccf-8f23d9b1cf81','BBB2025','Black Friday sale 2025','Black Friday sale 2025','percentage',25.00,1000.00,NULL,100,1,0,'2025-08-31 20:00:00','2025-09-30 19:59:00',0,'2025-08-19 23:39:53','2025-08-21 23:14:14','b4f5d6b6-720e-11f0-9e14-dddbb3f09727'),('abf7f500-7d4c-11f0-a1b3-084957d83787','WELCOME10','Welcome 10% Off','Get 10% off your first order','percentage',10.00,0.00,NULL,100,6,11,'2025-07-31 20:00:00','2025-09-30 09:59:00',1,'2025-08-19 22:34:30','2025-09-07 21:51:09','163d4fa0-53bd-4f8c-924c-32deb0e9eebf'),('abfb1d8e-7d4c-11f0-a1b3-084957d83787','SAVE500','Save ₦500','Get ₦500 off orders above ₦5000','fixed_amount',500.00,5000.00,500.00,100,1,2,'2025-08-31 20:00:00','2025-09-30 19:59:00',1,'2025-08-19 22:34:30','2025-09-07 13:50:52','163d4fa0-53bd-4f8c-924c-32deb0e9eebf');
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faq_items`
--

DROP TABLE IF EXISTS `faq_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faq_items` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `question` text NOT NULL,
  `answer` longtext NOT NULL,
  `display_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `view_count` int DEFAULT '0',
  `helpful_count` int DEFAULT '0',
  `not_helpful_count` int DEFAULT '0',
  `created_by` varchar(36) NOT NULL,
  `updated_by` varchar(36) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_display_order` (`display_order`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_view_count` (`view_count`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `faq_items_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `faq_items_ibfk_3` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faq_items`
--

LOCK TABLES `faq_items` WRITE;
/*!40000 ALTER TABLE `faq_items` DISABLE KEYS */;
INSERT INTO `faq_items` (`id`, `question`, `answer`, `display_order`, `is_active`, `view_count`, `helpful_count`, `not_helpful_count`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES ('02eac693-3efb-4efc-8897-53622d217cb7','What is Fresh County known for?','We are a nutrition-based brand that uses high-grade food equipment to produce healthy and effective edibles.',0,1,0,0,0,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727',NULL,'2025-08-21 12:05:16','2025-08-21 12:05:16'),('0e7447b8-ddc8-4bd7-a044-d16cf46c00b9','Test Question','Test Answer',0,0,0,0,0,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-08-21 12:29:52','2025-09-08 14:21:20'),('3e92607e-7e2b-11f0-a1b3-084957d83787','How do I place an order?','To place an order, browse our products, add items to your cart, and proceed to checkout. You\'ll need to provide shipping and payment information to complete your purchase.',1,1,0,0,0,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf',NULL,'2025-08-21 02:07:44','2025-08-21 02:07:44'),('3e92c0a0-7e2b-11f0-a1b3-084957d83787','What payment methods do you accept?','We accept major credit cards, debit cards, and online payment platforms. All payments are processed securely through our encrypted payment system.',2,1,0,0,0,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf',NULL,'2025-08-21 02:07:44','2025-08-21 02:07:44'),('3e92c776-7e2b-11f0-a1b3-084957d83787','How long does shipping take?','Standard shipping typically takes 3-5 business days. Express shipping options are available for faster delivery. Delivery times may vary based on your location.',3,1,0,0,0,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf',NULL,'2025-08-21 02:07:44','2025-08-21 02:07:44'),('3e92cc4e-7e2b-11f0-a1b3-084957d83787','What is your return policy?','We accept returns within 30 days of delivery. Items must be unused and in original packaging. Please contact our customer service team to initiate a return.',4,1,0,0,0,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf',NULL,'2025-08-21 02:07:44','2025-08-21 02:07:44'),('3e92d0a4-7e2b-11f0-a1b3-084957d83787','How can I track my order?','Once your order ships, you\'ll receive a tracking number via email. You can use this number to track your package on our shipping partner\'s website.',5,1,0,0,0,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf',NULL,'2025-08-21 02:07:44','2025-08-21 02:07:44');
/*!40000 ALTER TABLE `faq_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newsletter_campaign_recipients`
--

DROP TABLE IF EXISTS `newsletter_campaign_recipients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `newsletter_campaign_recipients` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `campaign_id` varchar(36) NOT NULL,
  `subscription_id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `status` enum('pending','sent','delivered','opened','clicked','bounced','unsubscribed') NOT NULL DEFAULT 'pending',
  `sent_at` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `opened_at` datetime DEFAULT NULL,
  `clicked_at` datetime DEFAULT NULL,
  `bounced_at` datetime DEFAULT NULL,
  `bounce_reason` varchar(255) DEFAULT NULL,
  `unsubscribed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_campaign_subscription` (`campaign_id`,`subscription_id`),
  KEY `idx_campaign_id` (`campaign_id`),
  KEY `idx_subscription_id` (`subscription_id`),
  KEY `idx_email` (`email`),
  KEY `idx_status` (`status`),
  CONSTRAINT `newsletter_campaign_recipients_ibfk_1` FOREIGN KEY (`campaign_id`) REFERENCES `newsletter_campaigns` (`id`) ON DELETE CASCADE,
  CONSTRAINT `newsletter_campaign_recipients_ibfk_2` FOREIGN KEY (`subscription_id`) REFERENCES `newsletter_subscriptions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsletter_campaign_recipients`
--

LOCK TABLES `newsletter_campaign_recipients` WRITE;
/*!40000 ALTER TABLE `newsletter_campaign_recipients` DISABLE KEYS */;
/*!40000 ALTER TABLE `newsletter_campaign_recipients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newsletter_campaigns`
--

DROP TABLE IF EXISTS `newsletter_campaigns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `newsletter_campaigns` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `title` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `html_content` longtext,
  `status` enum('draft','scheduled','sending','sent','cancelled') NOT NULL DEFAULT 'draft',
  `scheduled_date` datetime DEFAULT NULL,
  `sent_date` datetime DEFAULT NULL,
  `total_recipients` int DEFAULT '0',
  `sent_count` int DEFAULT '0',
  `delivered_count` int DEFAULT '0',
  `opened_count` int DEFAULT '0',
  `clicked_count` int DEFAULT '0',
  `bounced_count` int DEFAULT '0',
  `unsubscribed_count` int DEFAULT '0',
  `created_by` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_scheduled_date` (`scheduled_date`),
  KEY `idx_created_by` (`created_by`),
  CONSTRAINT `newsletter_campaigns_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsletter_campaigns`
--

LOCK TABLES `newsletter_campaigns` WRITE;
/*!40000 ALTER TABLE `newsletter_campaigns` DISABLE KEYS */;
/*!40000 ALTER TABLE `newsletter_campaigns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newsletter_subscription_history`
--

DROP TABLE IF EXISTS `newsletter_subscription_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `newsletter_subscription_history` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `subscription_id` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `action` enum('subscribed','unsubscribed','resubscribed','bounced','spam_complaint') NOT NULL,
  `source` varchar(100) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_subscription_id` (`subscription_id`),
  KEY `idx_email` (`email`),
  KEY `idx_action` (`action`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `newsletter_subscription_history_ibfk_1` FOREIGN KEY (`subscription_id`) REFERENCES `newsletter_subscriptions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsletter_subscription_history`
--

LOCK TABLES `newsletter_subscription_history` WRITE;
/*!40000 ALTER TABLE `newsletter_subscription_history` DISABLE KEYS */;
INSERT INTO `newsletter_subscription_history` (`id`, `subscription_id`, `email`, `action`, `source`, `ip_address`, `user_agent`, `created_at`) VALUES ('385b6d0f-9b70-43b8-8d04-b39d2f1c28f2','7c936485-b810-4d31-8cf1-2aca63495980','erickaser@gmail.com','subscribed','website','::1',NULL,'2025-09-02 17:55:53'),('3f6b5886-742a-4248-a35f-d6561864452e','7bb1a380-92ea-4417-9eff-31abd4a51390','iamerhun@gmail.com','subscribed','website','::1',NULL,'2025-09-02 02:52:07'),('7ac1c96b-547a-4be5-8ed6-0f2258161909','00cd1afc-6a1a-44b1-9dd4-7f9dd32d8955','nosaabbe@gmail.com','subscribed','website','::1',NULL,'2025-09-06 09:47:36'),('87d3efcd-6666-4c55-898e-967dae52f3e2','2fc48e79-e96b-4e1a-af46-84f7a46553d7','erhunabbe@gmail.com','subscribed','admin','::1',NULL,'2025-08-20 21:12:03'),('8da485e6-bd85-4ce5-b053-337124a54bc1','2fc48e79-e96b-4e1a-af46-84f7a46553d7','erhunabbe@gmail.com','unsubscribed','admin','::1',NULL,'2025-08-21 01:59:05'),('aaf432eb-efa6-42a5-82a1-662f3a50bafc','2fc48e79-e96b-4e1a-af46-84f7a46553d7','erhunabbe@gmail.com','subscribed','admin','::1',NULL,'2025-08-21 02:01:15'),('bc9c6cfa-eb1e-449f-a17b-cb86116bedd6','2fc48e79-e96b-4e1a-af46-84f7a46553d7','erhunabbe@gmail.com','subscribed','admin','::1',NULL,'2025-08-21 01:59:54'),('c8d043c3-a790-4ef2-8621-ddd6d426ee20','2fc48e79-e96b-4e1a-af46-84f7a46553d7','erhunabbe@gmail.com','subscribed','admin','::1',NULL,'2025-08-21 01:59:33');
/*!40000 ALTER TABLE `newsletter_subscription_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newsletter_subscriptions`
--

DROP TABLE IF EXISTS `newsletter_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `newsletter_subscriptions` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `email` varchar(255) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `status` enum('active','unsubscribed','bounced','spam_complaint') NOT NULL DEFAULT 'active',
  `subscription_source` varchar(100) DEFAULT 'website',
  `subscription_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `unsubscribed_date` datetime DEFAULT NULL,
  `confirmation_token` varchar(255) DEFAULT NULL,
  `confirmed_at` datetime DEFAULT NULL,
  `last_email_sent` datetime DEFAULT NULL,
  `email_count` int DEFAULT '0',
  `preferences` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_status` (`status`),
  KEY `idx_subscription_date` (`subscription_date`),
  KEY `idx_confirmed_at` (`confirmed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsletter_subscriptions`
--

LOCK TABLES `newsletter_subscriptions` WRITE;
/*!40000 ALTER TABLE `newsletter_subscriptions` DISABLE KEYS */;
INSERT INTO `newsletter_subscriptions` (`id`, `email`, `first_name`, `last_name`, `status`, `subscription_source`, `subscription_date`, `unsubscribed_date`, `confirmation_token`, `confirmed_at`, `last_email_sent`, `email_count`, `preferences`, `created_at`, `updated_at`) VALUES ('00cd1afc-6a1a-44b1-9dd4-7f9dd32d8955','nosaabbe@gmail.com','','','active','website','2025-09-06 09:47:36',NULL,NULL,'2025-09-06 09:47:36',NULL,0,NULL,'2025-09-06 09:47:36','2025-09-06 09:47:36'),('2fc48e79-e96b-4e1a-af46-84f7a46553d7','erhunabbe@gmail.com','Erhun','Abbe','active','admin','2025-08-20 21:12:03','2025-08-21 01:59:06',NULL,'2025-08-20 21:12:03',NULL,0,NULL,'2025-08-20 21:12:03','2025-08-21 02:01:15'),('7bb1a380-92ea-4417-9eff-31abd4a51390','iamerhun@gmail.com','','','active','website','2025-09-02 02:52:07',NULL,NULL,'2025-09-02 02:52:07',NULL,0,NULL,'2025-09-02 02:52:07','2025-09-02 02:52:07'),('7c936485-b810-4d31-8cf1-2aca63495980','erickaser@gmail.com','','','active','website','2025-09-02 17:55:53',NULL,NULL,'2025-09-02 17:55:53',NULL,0,NULL,'2025-09-02 17:55:53','2025-09-02 17:55:53');
/*!40000 ALTER TABLE `newsletter_subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newsletter_templates`
--

DROP TABLE IF EXISTS `newsletter_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `newsletter_templates` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(255) NOT NULL,
  `description` text,
  `html_content` longtext NOT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `created_by` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`),
  KEY `idx_is_default` (`is_default`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `newsletter_templates_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsletter_templates`
--

LOCK TABLES `newsletter_templates` WRITE;
/*!40000 ALTER TABLE `newsletter_templates` DISABLE KEYS */;
/*!40000 ALTER TABLE `newsletter_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `order_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `variation_id` varchar(36) DEFAULT NULL,
  `variation_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order` (`order_id`),
  KEY `idx_product` (`product_id`),
  KEY `idx_order_items_variation_id` (`variation_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`, `created_at`, `variation_id`, `variation_name`) VALUES ('078c943a-8ab2-11f0-b67e-edb4be9dd75f','e18864b7-3f2c-4e7c-8974-311355f24486','84c51732-8a5e-11f0-b67e-edb4be9dd75f',1,6000.00,'2025-09-05 23:42:48','8976a1c4-8a5e-11f0-b67e-edb4be9dd75f','Jar Size: Medium'),('078d4920-8ab2-11f0-b67e-edb4be9dd75f','e18864b7-3f2c-4e7c-8974-311355f24486','84c51732-8a5e-11f0-b67e-edb4be9dd75f',1,4000.00,'2025-09-05 23:42:48',NULL,NULL),('0896b1be-8844-11f0-b67e-edb4be9dd75f','5ca183d2-15e2-4710-893d-bdb5749285ae','d1db432a-880b-11f0-a1b3-084957d83787',1,4500.00,'2025-09-02 21:30:23',NULL,NULL),('0c903448-8849-11f0-b67e-edb4be9dd75f','e48f8807-f40f-4b3c-8890-4dec3069c81d','b7b29bb0-880b-11f0-a1b3-084957d83787',1,7500.00,'2025-09-02 22:06:17',NULL,NULL),('0c90e776-8849-11f0-b67e-edb4be9dd75f','e48f8807-f40f-4b3c-8890-4dec3069c81d','aaece6f4-7c64-11f0-a1b3-084957d83787',2,12000.00,'2025-09-02 22:06:17',NULL,NULL),('0c910166-8849-11f0-b67e-edb4be9dd75f','e48f8807-f40f-4b3c-8890-4dec3069c81d','98746c9c-880b-11f0-a1b3-084957d83787',1,5000.00,'2025-09-02 22:06:17',NULL,NULL),('0c9137da-8849-11f0-b67e-edb4be9dd75f','e48f8807-f40f-4b3c-8890-4dec3069c81d','7db49918-880b-11f0-a1b3-084957d83787',1,2000.00,'2025-09-02 22:06:17',NULL,NULL),('1c314870-8aa5-11f0-b67e-edb4be9dd75f','4ee29dcc-e633-47f4-b962-cac67703e6eb','84c51732-8a5e-11f0-b67e-edb4be9dd75f',1,10000.00,'2025-09-05 22:10:19',NULL,NULL),('235bfcfe-8c2f-11f0-b67e-edb4be9dd75f','cfbfb707-0e3b-4f1b-aa73-05e6ff7b7193','98746c9c-880b-11f0-a1b3-084957d83787',1,5000.00,'2025-09-07 21:10:53',NULL,NULL),('2e136fb2-8aa7-11f0-b67e-edb4be9dd75f','79edccfb-d770-49c7-82de-1b245fd0e467','04fa32c0-880c-11f0-a1b3-084957d83787',1,3500.00,'2025-09-05 22:25:08',NULL,NULL),('2e6a8a3e-8bf3-11f0-b67e-edb4be9dd75f','c0385139-6a3f-4345-a76d-b2bc40477813','04fa32c0-880c-11f0-a1b3-084957d83787',1,3500.00,'2025-09-07 14:01:42',NULL,NULL),('2e6bc9c6-8bf3-11f0-b67e-edb4be9dd75f','c0385139-6a3f-4345-a76d-b2bc40477813','b7b29bb0-880b-11f0-a1b3-084957d83787',1,7500.00,'2025-09-07 14:01:42',NULL,NULL),('38b0117a-8848-11f0-b67e-edb4be9dd75f','f5567e22-514b-4679-b497-e3cebd3818ec','04fa32c0-880c-11f0-a1b3-084957d83787',1,3500.00,'2025-09-02 22:00:21',NULL,NULL),('4d0371ee-8aa5-11f0-b67e-edb4be9dd75f','c6249715-c971-4408-8217-3deec7f2bf07','84c51732-8a5e-11f0-b67e-edb4be9dd75f',1,4000.00,'2025-09-05 22:11:41',NULL,NULL),('4d044df8-8aa5-11f0-b67e-edb4be9dd75f','c6249715-c971-4408-8217-3deec7f2bf07','84c51732-8a5e-11f0-b67e-edb4be9dd75f',1,10000.00,'2025-09-05 22:11:41',NULL,NULL),('4efee99a-8aa7-11f0-b67e-edb4be9dd75f','5e55a58f-d52a-4475-a1a4-9410a40dae62','d1db432a-880b-11f0-a1b3-084957d83787',1,4500.00,'2025-09-05 22:26:03','8976a1c4-8a5e-11f0-b67e-edb4be9dd75f','Jar Size: Medium'),('5ab731f6-8ab2-11f0-b67e-edb4be9dd75f','a8cafb93-5bf7-4f78-ade8-c6527648d083','98746c9c-880b-11f0-a1b3-084957d83787',1,5000.00,'2025-09-05 23:45:07',NULL,NULL),('5ab7ad84-8ab2-11f0-b67e-edb4be9dd75f','a8cafb93-5bf7-4f78-ade8-c6527648d083','98746c9c-880b-11f0-a1b3-084957d83787',1,8000.00,'2025-09-05 23:45:07','6922a7b2-89e4-11f0-b67e-edb4be9dd75f','Cup Size: Large'),('61d37142-8991-11f0-b67e-edb4be9dd75f','94c9b408-6ad8-44e3-8288-1023bcf9f0b3','04fa32c0-880c-11f0-a1b3-084957d83787',1,3500.00,'2025-09-04 13:16:35',NULL,NULL),('674513be-8aaa-11f0-b67e-edb4be9dd75f','2abf8eb5-fde5-415e-a034-8fe63849e321','84c51732-8a5e-11f0-b67e-edb4be9dd75f',1,10000.00,'2025-09-05 22:48:13','89777f22-8a5e-11f0-b67e-edb4be9dd75f','Jar Size: Large'),('75299d0a-8aa6-11f0-b67e-edb4be9dd75f','1bdc5e6a-fde0-44ca-88ef-3321ae122d9c','04fa32c0-880c-11f0-a1b3-084957d83787',1,3500.00,'2025-09-05 22:19:58',NULL,NULL),('7e9c755a-8877-11f0-b67e-edb4be9dd75f','b39163d0-e0c2-48fb-bd97-15e81410ddde','98746c9c-880b-11f0-a1b3-084957d83787',1,5000.00,'2025-09-03 03:38:45',NULL,NULL),('7e9da510-8877-11f0-b67e-edb4be9dd75f','b39163d0-e0c2-48fb-bd97-15e81410ddde','prod-chicken',1,45.99,'2025-09-03 03:38:45',NULL,NULL),('8262ccd0-882b-11f0-a1b3-084957d83787','baa0994f-fc45-43c6-90d6-163ed7e731e7','04fa32c0-880c-11f0-a1b3-084957d83787',3,3500.00,'2025-09-02 18:34:50',NULL,NULL),('88622b46-8829-11f0-a1b3-084957d83787','2902aa54-ce16-4a4b-ad82-f64db9808efe','04fa32c0-880c-11f0-a1b3-084957d83787',3,3500.00,'2025-09-02 18:20:41',NULL,NULL),('88632564-8829-11f0-a1b3-084957d83787','2902aa54-ce16-4a4b-ad82-f64db9808efe','d1db432a-880b-11f0-a1b3-084957d83787',2,4500.00,'2025-09-02 18:20:41',NULL,NULL),('8c19c89c-8aa5-11f0-b67e-edb4be9dd75f','6ed040a6-c81d-4210-b5aa-262b0b5d67e7','84c51732-8a5e-11f0-b67e-edb4be9dd75f',1,4000.00,'2025-09-05 22:13:27',NULL,NULL),('90db5d4e-884f-11f0-b67e-edb4be9dd75f','540da825-bbe0-4a57-b1a2-bd74f2d6ee18','04fa32c0-880c-11f0-a1b3-084957d83787',1,3500.00,'2025-09-02 22:52:56',NULL,NULL),('9165a5fc-8ab2-11f0-b67e-edb4be9dd75f','97c76a72-2d1a-4c8d-a8e0-9483a7d022cc','04fa32c0-880c-11f0-a1b3-084957d83787',1,3500.00,'2025-09-05 23:46:39',NULL,NULL),('9166510a-8ab2-11f0-b67e-edb4be9dd75f','97c76a72-2d1a-4c8d-a8e0-9483a7d022cc','84c51732-8a5e-11f0-b67e-edb4be9dd75f',1,10000.00,'2025-09-05 23:46:39','89777f22-8a5e-11f0-b67e-edb4be9dd75f','Jar Size: Large'),('9a9c88a8-8ab1-11f0-b67e-edb4be9dd75f','9d0b8669-7814-4180-b521-4366c04a4f34','d1db432a-880b-11f0-a1b3-084957d83787',1,4500.00,'2025-09-05 23:39:45',NULL,NULL),('a150d52c-8c33-11f0-b67e-edb4be9dd75f','ffc86d23-fafc-4a6e-b0fd-0378a648d84d','04fa32c0-880c-11f0-a1b3-084957d83787',3,3500.00,'2025-09-07 21:43:02',NULL,NULL),('a6909a56-8aa6-11f0-b67e-edb4be9dd75f','46b09c8d-dbb4-488b-beab-a4f71fdef2cf','d1db432a-880b-11f0-a1b3-084957d83787',1,4500.00,'2025-09-05 22:21:21',NULL,NULL),('a6d004a4-8c52-11f0-b67e-edb4be9dd75f','b8b57a30-7e2b-46c2-afea-a6982a1a7022','b7b29bb0-880b-11f0-a1b3-084957d83787',1,7500.00,'2025-09-08 01:25:06',NULL,NULL),('aaca06cc-8874-11f0-b67e-edb4be9dd75f','d53d0539-5596-40f5-8207-28facad4d438','d1db432a-880b-11f0-a1b3-084957d83787',1,4500.00,'2025-09-03 03:18:31',NULL,NULL),('aaca8160-8874-11f0-b67e-edb4be9dd75f','d53d0539-5596-40f5-8207-28facad4d438','b7b29bb0-880b-11f0-a1b3-084957d83787',1,7500.00,'2025-09-03 03:18:31',NULL,NULL),('ab63f892-8bf1-11f0-b67e-edb4be9dd75f','5aed4dfc-33f8-4215-a028-8656381b9366','98746c9c-880b-11f0-a1b3-084957d83787',1,5000.00,'2025-09-07 13:50:52',NULL,NULL),('ab65aa0c-8bf1-11f0-b67e-edb4be9dd75f','5aed4dfc-33f8-4215-a028-8656381b9366','98746c9c-880b-11f0-a1b3-084957d83787',1,6500.00,'2025-09-07 13:50:52','69221efa-89e4-11f0-b67e-edb4be9dd75f','Cup Size: Medium'),('ab660b78-8bf1-11f0-b67e-edb4be9dd75f','5aed4dfc-33f8-4215-a028-8656381b9366','98746c9c-880b-11f0-a1b3-084957d83787',1,8000.00,'2025-09-07 13:50:52','6922a7b2-89e4-11f0-b67e-edb4be9dd75f','Cup Size: Large'),('acf1a65a-8aac-11f0-b67e-edb4be9dd75f','aa8d1544-93ef-47e4-abe3-4a08c55fc867','04fa32c0-880c-11f0-a1b3-084957d83787',1,3500.00,'2025-09-05 23:04:28',NULL,NULL),('ad11b656-8ab2-11f0-b67e-edb4be9dd75f','470bf538-5e58-47d7-88f8-9461539a75e4','98746c9c-880b-11f0-a1b3-084957d83787',1,6500.00,'2025-09-05 23:47:26','69221efa-89e4-11f0-b67e-edb4be9dd75f','Cup Size: Medium'),('ad122474-8ab2-11f0-b67e-edb4be9dd75f','470bf538-5e58-47d7-88f8-9461539a75e4','7db49918-880b-11f0-a1b3-084957d83787',1,2000.00,'2025-09-05 23:47:26',NULL,NULL),('b1c3bb36-8c33-11f0-b67e-edb4be9dd75f','d927792e-65fe-4e9d-aed1-543067f876cd','d1db432a-880b-11f0-a1b3-084957d83787',3,4500.00,'2025-09-07 21:43:30',NULL,NULL),('bb0ee4b6-8aa5-11f0-b67e-edb4be9dd75f','23c40393-6c4d-42e7-9d1e-f4f0cf7552fb','84c51732-8a5e-11f0-b67e-edb4be9dd75f',1,4000.00,'2025-09-05 22:14:46',NULL,NULL),('c05a6fec-884f-11f0-b67e-edb4be9dd75f','e628383c-17fc-4791-89f7-fe06c918a053','b7b29bb0-880b-11f0-a1b3-084957d83787',2,7500.00,'2025-09-02 22:54:15',NULL,NULL),('c1c34072-8aa5-11f0-b67e-edb4be9dd75f','c6100180-7480-40f5-85e8-8eb66475183f','84c51732-8a5e-11f0-b67e-edb4be9dd75f',1,4000.00,'2025-09-05 22:14:57',NULL,NULL),('c3b2dfa6-8c34-11f0-b67e-edb4be9dd75f','ccaf77bb-36d6-4d69-840a-503325dc8487','98746c9c-880b-11f0-a1b3-084957d83787',1,6500.00,'2025-09-07 21:51:09','69221efa-89e4-11f0-b67e-edb4be9dd75f','Cup Size: Medium'),('c3b37204-8c34-11f0-b67e-edb4be9dd75f','ccaf77bb-36d6-4d69-840a-503325dc8487','84c51732-8a5e-11f0-b67e-edb4be9dd75f',1,4000.00,'2025-09-07 21:51:09',NULL,NULL),('d189a880-8aa9-11f0-b67e-edb4be9dd75f','62cb2934-a58d-45bc-9143-9f1892d7b69a','84c51732-8a5e-11f0-b67e-edb4be9dd75f',1,6000.00,'2025-09-05 22:44:01','8976a1c4-8a5e-11f0-b67e-edb4be9dd75f','Jar Size: Medium'),('ea569d8a-8ab0-11f0-b67e-edb4be9dd75f','e70da776-748a-4f8d-93e6-c0b2e8df961d','7db49918-880b-11f0-a1b3-084957d83787',1,2000.00,'2025-09-05 23:34:49',NULL,NULL),('eb4d3b04-8aa6-11f0-b67e-edb4be9dd75f','976b8b4d-1f5a-4f9a-9af7-25960e9546e9','98746c9c-880b-11f0-a1b3-084957d83787',1,6500.00,'2025-09-05 22:23:16',NULL,NULL),('eb4dd654-8aa6-11f0-b67e-edb4be9dd75f','976b8b4d-1f5a-4f9a-9af7-25960e9546e9','98746c9c-880b-11f0-a1b3-084957d83787',1,5000.00,'2025-09-05 22:23:16',NULL,NULL),('f160ff9c-8b07-11f0-b67e-edb4be9dd75f','78cce5ab-a6b4-485b-8487-d468f644383f','84c51732-8a5e-11f0-b67e-edb4be9dd75f',1,4000.00,'2025-09-06 09:57:47',NULL,NULL),('f16215e4-8b07-11f0-b67e-edb4be9dd75f','78cce5ab-a6b4-485b-8487-d468f644383f','98746c9c-880b-11f0-a1b3-084957d83787',1,5000.00,'2025-09-06 09:57:47',NULL,NULL),('f43e0882-884a-11f0-b67e-edb4be9dd75f','743a1df3-4bd1-48f1-bc5a-ba6e94a67a42','d1db432a-880b-11f0-a1b3-084957d83787',1,4500.00,'2025-09-02 22:19:55',NULL,NULL),('f43e6548-884a-11f0-b67e-edb4be9dd75f','743a1df3-4bd1-48f1-bc5a-ba6e94a67a42','b7b29bb0-880b-11f0-a1b3-084957d83787',1,7500.00,'2025-09-02 22:19:55',NULL,NULL),('f644d8e4-8aa3-11f0-b67e-edb4be9dd75f','da39b6be-a278-4103-8e9e-50f38fbd9306','84c51732-8a5e-11f0-b67e-edb4be9dd75f',1,6000.00,'2025-09-05 22:02:06',NULL,NULL),('fdcfa4fa-8c55-11f0-b67e-edb4be9dd75f','c502d364-d723-4cc7-b0b6-f813788faa62','aaece6f4-7c64-11f0-a1b3-084957d83787',1,12000.00,'2025-09-08 01:49:00',NULL,NULL),('item-1','ord-10day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-10','ord-20day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-11','ord-210day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-12','ord-22day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-13','ord-240day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-14','ord-25day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-15','ord-270day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-16','ord-28day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-17','ord-2day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-18','ord-2day-002','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-19','ord-300day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-2','ord-120day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-20','ord-30day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-21','ord-330day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-22','ord-35day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-23','ord-360day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-24','ord-3day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-25','ord-40day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-26','ord-45day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-27','ord-4day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-28','ord-4day-002','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-29','ord-50day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-3','ord-12day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-30','ord-55day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-31','ord-5day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-32','ord-60day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-33','ord-65day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-34','ord-6day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-35','ord-70day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-36','ord-75day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-37','ord-7day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-38','ord-80day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-39','ord-85day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-4','ord-150day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-40','ord-90day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-41','ord-today-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-42','ord-today-002','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-43','ord-today-003','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-5','ord-15day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-6','ord-180day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-7','ord-18day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-8','ord-1day-001','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL),('item-9','ord-1day-002','prod-spinach',1,12.99,'2025-08-18 12:03:11',NULL,NULL);
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_status_history`
--

DROP TABLE IF EXISTS `order_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_status_history` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `order_id` varchar(36) NOT NULL,
  `status` enum('pending','confirmed','processing','shipped','delivered','cancelled','refunded') NOT NULL,
  `notes` text,
  `changed_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `changed_by` (`changed_by`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `order_status_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_status_history_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_status_history`
--

LOCK TABLES `order_status_history` WRITE;
/*!40000 ALTER TABLE `order_status_history` DISABLE KEYS */;
INSERT INTO `order_status_history` (`id`, `order_id`, `status`, `notes`, `changed_by`, `created_at`) VALUES ('059d2510-7c5f-11f0-a1b3-084957d83787','ord-2day-002','cancelled',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 18:13:20'),('078d6cfc-8ab2-11f0-b67e-edb4be9dd75f','e18864b7-3f2c-4e7c-8974-311355f24486','pending','Order created','9f9bfeac-8407-11f0-a1b3-084957d83787','2025-09-05 23:42:48'),('080a4efe-7c5f-11f0-a1b3-084957d83787','ord-2day-001','cancelled',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 18:13:24'),('08975bb4-8844-11f0-b67e-edb4be9dd75f','5ca183d2-15e2-4710-893d-bdb5749285ae','pending','Order created','5fde4ff3-1248-4a9f-9d78-6c54298aa535','2025-09-02 21:30:23'),('0a613802-7c32-11f0-a1b3-084957d83787','ord-today-003','delivered',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 12:51:21'),('0c915620-8849-11f0-b67e-edb4be9dd75f','e48f8807-f40f-4b3c-8890-4dec3069c81d','pending','Order created','5fde4ff3-1248-4a9f-9d78-6c54298aa535','2025-09-02 22:06:17'),('0cf30e2e-7c5f-11f0-a1b3-084957d83787','ord-3day-001','shipped',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 18:13:32'),('1063d214-7c5f-11f0-a1b3-084957d83787','ord-4day-002','shipped',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 18:13:38'),('15a293f4-8dd6-11f0-b67e-edb4be9dd75f','d927792e-65fe-4e9d-aed1-543067f876cd','shipped',NULL,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-09 23:38:27'),('17d7427e-8849-11f0-b67e-edb4be9dd75f','ord-today-002','processing',NULL,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-02 22:06:36'),('17f4f84a-8dd6-11f0-b67e-edb4be9dd75f','5aed4dfc-33f8-4215-a028-8656381b9366','delivered',NULL,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-09 23:38:31'),('192fc910-7c2e-11f0-a1b3-084957d83787','ord-today-002','pending',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 12:23:08'),('1a901252-8849-11f0-b67e-edb4be9dd75f','ord-today-001','processing',NULL,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-02 22:06:40'),('1c334ce2-8aa5-11f0-b67e-edb4be9dd75f','4ee29dcc-e633-47f4-b962-cac67703e6eb','pending','Order created','5fde4ff3-1248-4a9f-9d78-6c54298aa535','2025-09-05 22:10:19'),('201f5de4-7c60-11f0-a1b3-084957d83787','ord-today-003','processing',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 18:21:14'),('23640a70-8c2f-11f0-b67e-edb4be9dd75f','cfbfb707-0e3b-4f1b-aa73-05e6ff7b7193','pending','Order created','0217bffe-8bdc-11f0-b67e-edb4be9dd75f','2025-09-07 21:10:53'),('24e9510a-8849-11f0-b67e-edb4be9dd75f','e48f8807-f40f-4b3c-8890-4dec3069c81d','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-02 22:06:58'),('26e513ac-7c34-11f0-a1b3-084957d83787','ord-today-002','processing',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 13:06:28'),('2965d738-7c34-11f0-a1b3-084957d83787','ord-today-002','pending',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 13:06:32'),('2cad2932-7c34-11f0-a1b3-084957d83787','ord-today-002','processing',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 13:06:37'),('2e140ee0-8aa7-11f0-b67e-edb4be9dd75f','79edccfb-d770-49c7-82de-1b245fd0e467','pending','Order created','9f9bfeac-8407-11f0-a1b3-084957d83787','2025-09-05 22:25:08'),('2e242d4c-7c34-11f0-a1b3-084957d83787','ord-today-002','shipped',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 13:06:40'),('2e6c7ae2-8bf3-11f0-b67e-edb4be9dd75f','c0385139-6a3f-4345-a76d-b2bc40477813','pending','Order created','0217bffe-8bdc-11f0-b67e-edb4be9dd75f','2025-09-07 14:01:42'),('3060e30c-7c34-11f0-a1b3-084957d83787','ord-today-002','delivered',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 13:06:44'),('3117836a-8dd6-11f0-b67e-edb4be9dd75f','c0385139-6a3f-4345-a76d-b2bc40477813','cancelled',NULL,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-09 23:39:13'),('32a4208e-7c34-11f0-a1b3-084957d83787','ord-today-002','cancelled',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 13:06:47'),('3484e406-7c34-11f0-a1b3-084957d83787','ord-today-002','pending',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 13:06:50'),('37c3743a-8dd6-11f0-b67e-edb4be9dd75f','cfbfb707-0e3b-4f1b-aa73-05e6ff7b7193','shipped',NULL,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-09 23:39:24'),('38b222c6-8848-11f0-b67e-edb4be9dd75f','f5567e22-514b-4679-b497-e3cebd3818ec','pending','Order created','5fde4ff3-1248-4a9f-9d78-6c54298aa535','2025-09-02 22:00:21'),('3aae5f56-7c34-11f0-a1b3-084957d83787','ord-today-001','pending',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 13:07:01'),('3af686f4-8b08-11f0-b67e-edb4be9dd75f','78cce5ab-a6b4-485b-8487-d468f644383f','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-06 09:59:51'),('3b0f3eee-8dd6-11f0-b67e-edb4be9dd75f','cfbfb707-0e3b-4f1b-aa73-05e6ff7b7193','delivered',NULL,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-09 23:39:30'),('3b5f7ae4-7c60-11f0-a1b3-084957d83787','ord-today-003','pending',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 18:22:00'),('3c63f172-7c60-11f0-a1b3-084957d83787','ord-today-003','processing',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 18:22:02'),('3d9b21b4-7c60-11f0-a1b3-084957d83787','ord-today-003','shipped',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 18:22:04'),('3ece7884-8dd5-11f0-b67e-edb4be9dd75f','ccaf77bb-36d6-4d69-840a-503325dc8487','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-09 23:32:26'),('4192835c-7c60-11f0-a1b3-084957d83787','ord-today-003','delivered',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 18:22:10'),('41dd71b6-8848-11f0-b67e-edb4be9dd75f','f5567e22-514b-4679-b497-e3cebd3818ec','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-02 22:00:37'),('43e5e856-8dd6-11f0-b67e-edb4be9dd75f','ffc86d23-fafc-4a6e-b0fd-0378a648d84d','delivered',NULL,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-09 23:39:45'),('45138058-7c60-11f0-a1b3-084957d83787','ord-today-003','cancelled',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 18:22:16'),('469f1788-7c34-11f0-a1b3-084957d83787','ord-1day-002','delivered',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 13:07:21'),('4a89f7b4-7c34-11f0-a1b3-084957d83787','ord-22day-001','delivered',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 13:07:27'),('4d079f80-8aa5-11f0-b67e-edb4be9dd75f','c6249715-c971-4408-8217-3deec7f2bf07','pending','Order created','5fde4ff3-1248-4a9f-9d78-6c54298aa535','2025-09-05 22:11:41'),('4eff49d0-8aa7-11f0-b67e-edb4be9dd75f','5e55a58f-d52a-4475-a1a4-9410a40dae62','pending','Order created','9f9bfeac-8407-11f0-a1b3-084957d83787','2025-09-05 22:26:03'),('50012ba4-8ddc-11f0-b67e-edb4be9dd75f','470bf538-5e58-47d7-88f8-9461539a75e4','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-10 00:23:02'),('5507efc0-8ddc-11f0-b67e-edb4be9dd75f','e70da776-748a-4f8d-93e6-c0b2e8df961d','delivered',NULL,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-10 00:23:10'),('58d61096-8ddc-11f0-b67e-edb4be9dd75f','2abf8eb5-fde5-415e-a034-8fe63849e321','delivered',NULL,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-10 00:23:17'),('5aa3f9a2-8aa7-11f0-b67e-edb4be9dd75f','e628383c-17fc-4791-89f7-fe06c918a053','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-05 22:26:23'),('5ab82458-8ab2-11f0-b67e-edb4be9dd75f','a8cafb93-5bf7-4f78-ade8-c6527648d083','pending','Order created','9f9bfeac-8407-11f0-a1b3-084957d83787','2025-09-05 23:45:07'),('5c49d632-8aa7-11f0-b67e-edb4be9dd75f','d53d0539-5596-40f5-8207-28facad4d438','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-05 22:26:26'),('5c8ba0ca-8ddc-11f0-b67e-edb4be9dd75f','62cb2934-a58d-45bc-9143-9f1892d7b69a','delivered',NULL,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-10 00:23:23'),('5db7790c-8aa7-11f0-b67e-edb4be9dd75f','b39163d0-e0c2-48fb-bd97-15e81410ddde','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-05 22:26:28'),('603daf7a-8aa7-11f0-b67e-edb4be9dd75f','da39b6be-a278-4103-8e9e-50f38fbd9306','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-05 22:26:32'),('613ee678-8aa7-11f0-b67e-edb4be9dd75f','4ee29dcc-e633-47f4-b962-cac67703e6eb','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-05 22:26:34'),('61d53f7c-8991-11f0-b67e-edb4be9dd75f','94c9b408-6ad8-44e3-8288-1023bcf9f0b3','pending','Order created','5fde4ff3-1248-4a9f-9d78-6c54298aa535','2025-09-04 13:16:35'),('63f02a9e-8aa7-11f0-b67e-edb4be9dd75f','c6249715-c971-4408-8217-3deec7f2bf07','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-05 22:26:38'),('66a8db0a-8aa7-11f0-b67e-edb4be9dd75f','6ed040a6-c81d-4210-b5aa-262b0b5d67e7','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-05 22:26:43'),('67461d7c-8aaa-11f0-b67e-edb4be9dd75f','2abf8eb5-fde5-415e-a034-8fe63849e321','pending','Order created','9f9bfeac-8407-11f0-a1b3-084957d83787','2025-09-05 22:48:13'),('68c4b90e-8aa7-11f0-b67e-edb4be9dd75f','23c40393-6c4d-42e7-9d1e-f4f0cf7552fb','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-05 22:26:47'),('6930c3fe-8b08-11f0-b67e-edb4be9dd75f','78cce5ab-a6b4-485b-8487-d468f644383f','shipped',NULL,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-06 10:01:08'),('6b311e3a-8aa7-11f0-b67e-edb4be9dd75f','c6100180-7480-40f5-85e8-8eb66475183f','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-05 22:26:51'),('6c45cc6a-8b08-11f0-b67e-edb4be9dd75f','78cce5ab-a6b4-485b-8487-d468f644383f','delivered',NULL,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-06 10:01:14'),('6d117e02-8aa7-11f0-b67e-edb4be9dd75f','1bdc5e6a-fde0-44ca-88ef-3321ae122d9c','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-05 22:26:54'),('6f0938bc-8aa7-11f0-b67e-edb4be9dd75f','46b09c8d-dbb4-488b-beab-a4f71fdef2cf','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-05 22:26:57'),('70dc8ca2-8aa7-11f0-b67e-edb4be9dd75f','976b8b4d-1f5a-4f9a-9af7-25960e9546e9','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-05 22:27:00'),('752b8a7a-8aa6-11f0-b67e-edb4be9dd75f','1bdc5e6a-fde0-44ca-88ef-3321ae122d9c','pending','Order created','5fde4ff3-1248-4a9f-9d78-6c54298aa535','2025-09-05 22:19:58'),('78c631b4-8991-11f0-b67e-edb4be9dd75f','94c9b408-6ad8-44e3-8288-1023bcf9f0b3','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-04 13:17:13'),('7b99045a-8849-11f0-b67e-edb4be9dd75f','ord-4day-001','processing',NULL,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-02 22:09:23'),('7dfecef0-8849-11f0-b67e-edb4be9dd75f','ord-5day-001','processing',NULL,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-02 22:09:27'),('7e6997d2-8c34-11f0-b67e-edb4be9dd75f','e18864b7-3f2c-4e7c-8974-311355f24486','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-07 21:49:13'),('7e9dcbe4-8877-11f0-b67e-edb4be9dd75f','b39163d0-e0c2-48fb-bd97-15e81410ddde','pending','Order created','5fde4ff3-1248-4a9f-9d78-6c54298aa535','2025-09-03 03:38:45'),('8148b1ae-8c34-11f0-b67e-edb4be9dd75f','a8cafb93-5bf7-4f78-ade8-c6527648d083','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-07 21:49:18'),('8264035c-882b-11f0-a1b3-084957d83787','baa0994f-fc45-43c6-90d6-163ed7e731e7','pending','Order created','5fde4ff3-1248-4a9f-9d78-6c54298aa535','2025-09-02 18:34:50'),('84006252-8c34-11f0-b67e-edb4be9dd75f','5aed4dfc-33f8-4215-a028-8656381b9366','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-07 21:49:22'),('855c8e34-7c56-11f0-a1b3-084957d83787','ord-today-003','shipped',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 17:12:29'),('85f71f6a-8c34-11f0-b67e-edb4be9dd75f','c0385139-6a3f-4345-a76d-b2bc40477813','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-07 21:49:26'),('879493aa-7c2d-11f0-a1b3-084957d83787','ord-22day-001','pending',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 12:19:03'),('87d6ba52-8c34-11f0-b67e-edb4be9dd75f','cfbfb707-0e3b-4f1b-aa73-05e6ff7b7193','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-07 21:49:29'),('8865594c-8829-11f0-a1b3-084957d83787','2902aa54-ce16-4a4b-ad82-f64db9808efe','pending','Order created','5fde4ff3-1248-4a9f-9d78-6c54298aa535','2025-09-02 18:20:41'),('88b2ed2e-882e-11f0-a1b3-084957d83787','baa0994f-fc45-43c6-90d6-163ed7e731e7','processing',NULL,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-02 18:56:29'),('89b50074-7c56-11f0-a1b3-084957d83787','ord-today-003','delivered',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 17:12:36'),('8c14c18e-7c2d-11f0-a1b3-084957d83787','ord-today-003','shipped',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 12:19:11'),('8c1ae768-8aa5-11f0-b67e-edb4be9dd75f','6ed040a6-c81d-4210-b5aa-262b0b5d67e7','pending','Order created','5fde4ff3-1248-4a9f-9d78-6c54298aa535','2025-09-05 22:13:27'),('8f538ec0-7c2d-11f0-a1b3-084957d83787','ord-today-003','pending',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 12:19:16'),('90dba4e8-884f-11f0-b67e-edb4be9dd75f','540da825-bbe0-4a57-b1a2-bd74f2d6ee18','pending','Order created','5fde4ff3-1248-4a9f-9d78-6c54298aa535','2025-09-02 22:52:56'),('91669c14-8ab2-11f0-b67e-edb4be9dd75f','97c76a72-2d1a-4c8d-a8e0-9483a7d022cc','pending','Order created','9f9bfeac-8407-11f0-a1b3-084957d83787','2025-09-05 23:46:39'),('940854a0-7c2d-11f0-a1b3-084957d83787','ord-today-002','delivered',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 12:19:24'),('9a9dca10-8ab1-11f0-b67e-edb4be9dd75f','9d0b8669-7814-4180-b521-4366c04a4f34','pending','Order created','9f9bfeac-8407-11f0-a1b3-084957d83787','2025-09-05 23:39:45'),('9e5b1d1e-7c52-11f0-a1b3-084957d83787','ord-today-003','pending',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 16:44:33'),('a1524f60-8c33-11f0-b67e-edb4be9dd75f','ffc86d23-fafc-4a6e-b0fd-0378a648d84d','pending','Order created','0217bffe-8bdc-11f0-b67e-edb4be9dd75f','2025-09-07 21:43:02'),('a69133bc-8aa6-11f0-b67e-edb4be9dd75f','46b09c8d-dbb4-488b-beab-a4f71fdef2cf','pending','Order created','5fde4ff3-1248-4a9f-9d78-6c54298aa535','2025-09-05 22:21:21'),('a6d0f616-8c52-11f0-b67e-edb4be9dd75f','b8b57a30-7e2b-46c2-afea-a6982a1a7022','pending','Order created','5fde4ff3-1248-4a9f-9d78-6c54298aa535','2025-09-08 01:25:06'),('aacadf2a-8874-11f0-b67e-edb4be9dd75f','d53d0539-5596-40f5-8207-28facad4d438','pending','Order created','5fde4ff3-1248-4a9f-9d78-6c54298aa535','2025-09-03 03:18:31'),('ab66dae4-8bf1-11f0-b67e-edb4be9dd75f','5aed4dfc-33f8-4215-a028-8656381b9366','pending','Order created','0217bffe-8bdc-11f0-b67e-edb4be9dd75f','2025-09-07 13:50:52'),('acf2eae2-8aac-11f0-b67e-edb4be9dd75f','aa8d1544-93ef-47e4-abe3-4a08c55fc867','pending','Order created','9f9bfeac-8407-11f0-a1b3-084957d83787','2025-09-05 23:04:28'),('ad1438ae-8ab2-11f0-b67e-edb4be9dd75f','470bf538-5e58-47d7-88f8-9461539a75e4','pending','Order created','9f9bfeac-8407-11f0-a1b3-084957d83787','2025-09-05 23:47:26'),('b1c41c84-8c33-11f0-b67e-edb4be9dd75f','d927792e-65fe-4e9d-aed1-543067f876cd','pending','Order created','0217bffe-8bdc-11f0-b67e-edb4be9dd75f','2025-09-07 21:43:30'),('b4350db2-8ab1-11f0-b67e-edb4be9dd75f','79edccfb-d770-49c7-82de-1b245fd0e467','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-05 23:40:28'),('b6c1309c-8ab1-11f0-b67e-edb4be9dd75f','5e55a58f-d52a-4475-a1a4-9410a40dae62','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-05 23:40:32'),('b7a892b6-8ab1-11f0-b67e-edb4be9dd75f','62cb2934-a58d-45bc-9143-9f1892d7b69a','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-05 23:40:34'),('b8c47a5c-8ab1-11f0-b67e-edb4be9dd75f','aa8d1544-93ef-47e4-abe3-4a08c55fc867','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-05 23:40:36'),('bab2b34c-8ab1-11f0-b67e-edb4be9dd75f','2abf8eb5-fde5-415e-a034-8fe63849e321','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-05 23:40:39'),('bb13a8fc-8aa5-11f0-b67e-edb4be9dd75f','23c40393-6c4d-42e7-9d1e-f4f0cf7552fb','pending','Order created','5fde4ff3-1248-4a9f-9d78-6c54298aa535','2025-09-05 22:14:46'),('be970650-8dc9-11f0-b67e-edb4be9dd75f','a8cafb93-5bf7-4f78-ade8-c6527648d083','shipped',NULL,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-09 22:10:07'),('c05ac3d4-884f-11f0-b67e-edb4be9dd75f','e628383c-17fc-4791-89f7-fe06c918a053','pending','Order created','5fde4ff3-1248-4a9f-9d78-6c54298aa535','2025-09-02 22:54:15'),('c0791a12-8dc9-11f0-b67e-edb4be9dd75f','e18864b7-3f2c-4e7c-8974-311355f24486','delivered',NULL,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-09 22:10:10'),('c1c404bc-8aa5-11f0-b67e-edb4be9dd75f','c6100180-7480-40f5-85e8-8eb66475183f','pending','Order created','5fde4ff3-1248-4a9f-9d78-6c54298aa535','2025-09-05 22:14:57'),('c3b3e720-8c34-11f0-b67e-edb4be9dd75f','ccaf77bb-36d6-4d69-840a-503325dc8487','pending','Order created','9f9bfeac-8407-11f0-a1b3-084957d83787','2025-09-07 21:51:09'),('c959d072-884c-11f0-b67e-edb4be9dd75f','743a1df3-4bd1-48f1-bc5a-ba6e94a67a42','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-02 22:33:02'),('cc04656a-7f6b-11f0-a1b3-084957d83787','ord-4day-001','pending',NULL,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-08-22 15:22:20'),('cf524746-7f6b-11f0-a1b3-084957d83787','ord-5day-001','pending',NULL,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-08-22 15:22:26'),('d0e22694-8876-11f0-b67e-edb4be9dd75f','540da825-bbe0-4a57-b1a2-bd74f2d6ee18','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-03 03:33:54'),('d18a6a72-8aa9-11f0-b67e-edb4be9dd75f','62cb2934-a58d-45bc-9143-9f1892d7b69a','pending','Order created','9f9bfeac-8407-11f0-a1b3-084957d83787','2025-09-05 22:44:01'),('d2154002-7c30-11f0-a1b3-084957d83787','ord-today-001','shipped',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 12:42:37'),('d216d346-8c33-11f0-b67e-edb4be9dd75f','e70da776-748a-4f8d-93e6-c0b2e8df961d','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-07 21:44:24'),('d2bcb41e-8c33-11f0-b67e-edb4be9dd75f','9d0b8669-7814-4180-b521-4366c04a4f34','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-07 21:44:25'),('d3988270-7f6b-11f0-a1b3-084957d83787','ord-6day-001','processing',NULL,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-08-22 15:22:33'),('d7d2d318-7f6b-11f0-a1b3-084957d83787','ord-7day-001','cancelled',NULL,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-08-22 15:22:40'),('e2b7fa68-8c56-11f0-b67e-edb4be9dd75f','ffc86d23-fafc-4a6e-b0fd-0378a648d84d','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-08 01:55:24'),('e3364850-8c56-11f0-b67e-edb4be9dd75f','d927792e-65fe-4e9d-aed1-543067f876cd','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-08 01:55:25'),('e5790fe2-7c81-11f0-a1b3-084957d83787','ord-today-003','pending',NULL,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-08-18 22:22:59'),('e5e5b3b4-7c30-11f0-a1b3-084957d83787','ord-today-003','processing',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 12:43:10'),('e7b7d5a6-7c52-11f0-a1b3-084957d83787','ord-today-003','processing',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 16:46:36'),('ea5a18a2-8ab0-11f0-b67e-edb4be9dd75f','e70da776-748a-4f8d-93e6-c0b2e8df961d','pending','Order created','9f9bfeac-8407-11f0-a1b3-084957d83787','2025-09-05 23:34:49'),('eb4e5ab6-8aa6-11f0-b67e-edb4be9dd75f','976b8b4d-1f5a-4f9a-9af7-25960e9546e9','pending','Order created','9f9bfeac-8407-11f0-a1b3-084957d83787','2025-09-05 22:23:16'),('f07af9d4-8c56-11f0-b67e-edb4be9dd75f','97c76a72-2d1a-4c8d-a8e0-9483a7d022cc','processing','Payment confirmed by admin','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-08 01:55:47'),('f163b0fc-8b07-11f0-b67e-edb4be9dd75f','78cce5ab-a6b4-485b-8487-d468f644383f','pending','Order created','5fde4ff3-1248-4a9f-9d78-6c54298aa535','2025-09-06 09:57:47'),('f30be9a4-7c5e-11f0-a1b3-084957d83787','ord-1day-001','processing',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 18:12:49'),('f43e8fb4-884a-11f0-b67e-edb4be9dd75f','743a1df3-4bd1-48f1-bc5a-ba6e94a67a42','pending','Order created','5fde4ff3-1248-4a9f-9d78-6c54298aa535','2025-09-02 22:19:55'),('f64715d2-8aa3-11f0-b67e-edb4be9dd75f','da39b6be-a278-4103-8e9e-50f38fbd9306','pending','Order created','5fde4ff3-1248-4a9f-9d78-6c54298aa535','2025-09-05 22:02:06'),('fb619216-7c5e-11f0-a1b3-084957d83787','ord-1day-002','processing',NULL,'b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-18 18:13:03'),('fdc0e436-8dc9-11f0-b67e-edb4be9dd75f','976b8b4d-1f5a-4f9a-9af7-25960e9546e9','delivered',NULL,'163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-09 22:11:53'),('fdd1205a-8c55-11f0-b67e-edb4be9dd75f','c502d364-d723-4cc7-b0b6-f813788faa62','pending','Order created','5fde4ff3-1248-4a9f-9d78-6c54298aa535','2025-09-08 01:49:00');
/*!40000 ALTER TABLE `order_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `user_id` varchar(36) NOT NULL,
  `coupon_id` varchar(36) DEFAULT NULL,
  `coupon_code` varchar(50) DEFAULT NULL,
  `discount_amount` decimal(10,2) DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL,
  `shipping_address` json NOT NULL,
  `delivery_type` varchar(20) DEFAULT 'home',
  `delivery_cost` decimal(10,2) DEFAULT '0.00',
  `shipping_zone_id` varchar(36) DEFAULT NULL,
  `shipping_zone_name` varchar(100) DEFAULT NULL,
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `order_status` enum('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT 'paystack',
  `payment_reference` varchar(255) DEFAULT NULL,
  `tracking_number` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_payment_status` (`payment_status`),
  KEY `idx_order_status` (`order_status`),
  KEY `idx_payment_reference` (`payment_reference`),
  KEY `idx_created_at` (`created_at`),
  KEY `fk_orders_coupon` (`coupon_id`),
  KEY `idx_orders_delivery_type` (`delivery_type`),
  KEY `idx_shipping_zone` (`shipping_zone_id`),
  KEY `idx_shipping_zone_name` (`shipping_zone_name`),
  CONSTRAINT `fk_orders_shipping_zone` FOREIGN KEY (`shipping_zone_id`) REFERENCES `shipping_zones` (`id`) ON DELETE SET NULL,
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` (`id`, `user_id`, `coupon_id`, `coupon_code`, `discount_amount`, `total_amount`, `shipping_address`, `delivery_type`, `delivery_cost`, `shipping_zone_id`, `shipping_zone_name`, `payment_status`, `order_status`, `payment_method`, `payment_reference`, `tracking_number`, `created_at`, `updated_at`) VALUES ('1bdc5e6a-fde0-44ca-88ef-3321ae122d9c','5fde4ff3-1248-4a9f-9d78-6c54298aa535',NULL,'WELCOME10',0.00,7912.50,'{\"city\": \"Lekki\", \"email\": \"erickaser@gmail.com\", \"phone\": \"+2349834568939\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Kaser\", \"first_name\": \"Eric\", \"postal_code\": \"\", \"address_line_1\": \"Block 19 Ralph J Karienren Crescent Lekki Scheme 2\"}','home',4500.00,NULL,NULL,'paid','processing','bank_transfer','FC10798311128',NULL,'2025-09-05 22:19:58','2025-09-05 23:33:09'),('23c40393-6c4d-42e7-9d1e-f4f0cf7552fb','5fde4ff3-1248-4a9f-9d78-6c54298aa535',NULL,'WELCOME10',0.00,8400.00,'{\"city\": \"Lekki\", \"email\": \"erickaser@gmail.com\", \"phone\": \"+2349834568939\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Kaser\", \"first_name\": \"Eric\", \"postal_code\": \"\", \"address_line_1\": \"Block 19 Ralph J Karienren Crescent Lekki Scheme 2\"}','home',4500.00,NULL,NULL,'paid','processing','bank_transfer','FC10486082525',NULL,'2025-09-05 22:14:46','2025-09-05 23:33:09'),('2902aa54-ce16-4a4b-ad82-f64db9808efe','5fde4ff3-1248-4a9f-9d78-6c54298aa535',NULL,NULL,0.00,24462.50,'{\"city\": \"Lekki\", \"email\": \"erickaser@gmail.com\", \"phone\": \"+2349834568939\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Kaser\", \"first_name\": \"Eric\", \"postal_code\": \"\", \"address_line_1\": \"Block 19 Ralph J Karienren Crescent Lekki Scheme 2\"}','home',4500.00,NULL,NULL,'paid','processing','bank_transfer','FC37241148605',NULL,'2025-09-02 18:20:41','2025-09-05 23:33:09'),('2abf8eb5-fde5-415e-a034-8fe63849e321','9f9bfeac-8407-11f0-a1b3-084957d83787',NULL,NULL,0.00,10750.00,'{\"city\": \"Lekki\", \"email\": \"uyiabbe@gmail.com\", \"phone\": \"+2347678986543\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Abbe\", \"first_name\": \"Uyi\", \"postal_code\": \"\", \"address_line_1\": \"Block 112 plot 25 Adebisi Oguniyi Crescent\"}','home',4500.00,NULL,NULL,'paid','delivered','bank_transfer','FC12492981098',NULL,'2025-09-05 22:48:12','2025-09-10 00:23:17'),('46b09c8d-dbb4-488b-beab-a4f71fdef2cf','5fde4ff3-1248-4a9f-9d78-6c54298aa535',NULL,NULL,0.00,9337.50,'{\"city\": \"Lekki\", \"email\": \"erickaser@gmail.com\", \"phone\": \"+2349834568939\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Kaser\", \"first_name\": \"Eric\", \"postal_code\": \"\", \"address_line_1\": \"Block 19 Ralph J Karienren Crescent Lekki Scheme 2\"}','home',4500.00,NULL,NULL,'paid','processing','bank_transfer','FC10881200199',NULL,'2025-09-05 22:21:21','2025-09-05 23:33:09'),('470bf538-5e58-47d7-88f8-9461539a75e4','9f9bfeac-8407-11f0-a1b3-084957d83787',NULL,NULL,0.00,13637.50,'{\"city\": \"Lekki\", \"email\": \"uyiabbe@gmail.com\", \"phone\": \"+2347678986543\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Abbe\", \"first_name\": \"Uyi\", \"postal_code\": \"\", \"address_line_1\": \"Block 112 plot 25 Adebisi Oguniyi Crescent\"}','home',4500.00,NULL,NULL,'paid','processing','bank_transfer','FC16046078925',NULL,'2025-09-05 23:47:26','2025-09-10 00:23:02'),('4ee29dcc-e633-47f4-b962-cac67703e6eb','5fde4ff3-1248-4a9f-9d78-6c54298aa535',NULL,'WELCOME10',0.00,14250.00,'{\"city\": \"Lekki\", \"email\": \"erickaser@gmail.com\", \"phone\": \"+2349834568939\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Kaser\", \"first_name\": \"Eric\", \"postal_code\": \"\", \"address_line_1\": \"Block 19 Ralph J Karienren Crescent Lekki Scheme 2\"}','home',4500.00,NULL,NULL,'paid','processing','bank_transfer','FC10219548838',NULL,'2025-09-05 22:10:19','2025-09-05 23:33:09'),('540da825-bbe0-4a57-b1a2-bd74f2d6ee18','5fde4ff3-1248-4a9f-9d78-6c54298aa535',NULL,NULL,0.00,8762.50,'{\"city\": \"Lekki\", \"email\": \"erickaser@gmail.com\", \"phone\": \"+2349834568939\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Kaser\", \"first_name\": \"Eric\", \"postal_code\": \"\", \"address_line_1\": \"Block 19 Ralph J Karienren Crescent Lekki Scheme 2\"}','home',4500.00,NULL,NULL,'paid','processing','bank_transfer','FC53576248376',NULL,'2025-09-02 22:52:56','2025-09-05 23:33:09'),('5aed4dfc-33f8-4215-a028-8656381b9366','0217bffe-8bdc-11f0-b67e-edb4be9dd75f',NULL,'SAVE500',0.00,20072.50,'{\"city\": \"Lekki\", \"email\": \"marikosama@outlook.com\", \"phone\": \"+2347045556709\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Sama\", \"first_name\": \"Mariko\", \"postal_code\": \"\", \"address_line_1\": \"Block 112 plot 25 Adebisi Oguniyi Crescent\"}','pickup',0.00,NULL,NULL,'paid','delivered','bank_transfer','FC53052678631',NULL,'2025-09-07 13:50:52','2025-09-09 23:38:31'),('5ca183d2-15e2-4710-893d-bdb5749285ae','5fde4ff3-1248-4a9f-9d78-6c54298aa535',NULL,NULL,0.00,9837.50,'{\"city\": \"Lekki\", \"email\": \"erickaser@gmail.com\", \"phone\": \"+2349834568939\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Kaser\", \"first_name\": \"Eric\", \"postal_code\": \"\", \"address_line_1\": \"Block 19 Ralph J Karienren Crescent Lekki Scheme 2\"}','home',4500.00,NULL,NULL,'paid','processing','bank_transfer','FC48623156130',NULL,'2025-09-02 21:30:23','2025-09-05 23:33:09'),('5e55a58f-d52a-4475-a1a4-9410a40dae62','9f9bfeac-8407-11f0-a1b3-084957d83787',NULL,NULL,0.00,4837.50,'{\"city\": \"Lekki\", \"email\": \"uyiabbe@gmail.com\", \"phone\": \"+2347678986543\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Abbe\", \"first_name\": \"Uyi\", \"postal_code\": \"\", \"address_line_1\": \"Block 112 plot 25 Adebisi Oguniyi Crescent\"}','home',4500.00,NULL,NULL,'paid','processing','bank_transfer','FC11163790192',NULL,'2025-09-05 22:26:03','2025-09-05 23:40:32'),('62cb2934-a58d-45bc-9143-9f1892d7b69a','9f9bfeac-8407-11f0-a1b3-084957d83787',NULL,NULL,0.00,6450.00,'{\"city\": \"Lekki\", \"email\": \"uyiabbe@gmail.com\", \"phone\": \"+2347678986543\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Abbe\", \"first_name\": \"Uyi\", \"postal_code\": \"\", \"address_line_1\": \"Block 112 plot 25 Adebisi Oguniyi Crescent\"}','home',4500.00,NULL,NULL,'paid','delivered','bank_transfer','FC12241779026',NULL,'2025-09-05 22:44:01','2025-09-10 00:23:23'),('6ed040a6-c81d-4210-b5aa-262b0b5d67e7','5fde4ff3-1248-4a9f-9d78-6c54298aa535',NULL,'WELCOME10',0.00,8400.00,'{\"city\": \"Lekki\", \"email\": \"erickaser@gmail.com\", \"phone\": \"+2349834568939\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Kaser\", \"first_name\": \"Eric\", \"postal_code\": \"\", \"address_line_1\": \"Block 19 Ralph J Karienren Crescent Lekki Scheme 2\"}','home',4500.00,NULL,NULL,'paid','processing','bank_transfer','FC10407301590',NULL,'2025-09-05 22:13:27','2025-09-05 23:33:09'),('743a1df3-4bd1-48f1-bc5a-ba6e94a67a42','5fde4ff3-1248-4a9f-9d78-6c54298aa535',NULL,NULL,0.00,17900.00,'{\"city\": \"Lekki\", \"email\": \"erickaser@gmail.com\", \"phone\": \"+2349834568939\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Kaser\", \"first_name\": \"Eric\", \"postal_code\": \"\", \"address_line_1\": \"Block 19 Ralph J Karienren Crescent Lekki Scheme 2\"}','home',4500.00,NULL,NULL,'paid','processing','bank_transfer','FC51595501480',NULL,'2025-09-02 22:19:55','2025-09-05 23:33:09'),('78cce5ab-a6b4-485b-8487-d468f644383f','5fde4ff3-1248-4a9f-9d78-6c54298aa535',NULL,'SAVE500',0.00,8995.00,'{\"city\": \"Lekki\", \"email\": \"erickaser@gmail.com\", \"phone\": \"+2349834568939\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Kaser\", \"first_name\": \"Eric\", \"postal_code\": \"\", \"address_line_1\": \"Block 19 Ralph J Karienren Crescent Lekki Scheme 2\"}','pickup',0.00,NULL,NULL,'paid','delivered','bank_transfer','FC52667898719',NULL,'2025-09-06 09:57:47','2025-09-06 10:01:14'),('79edccfb-d770-49c7-82de-1b245fd0e467','9f9bfeac-8407-11f0-a1b3-084957d83787',NULL,'WELCOME10',0.00,3412.50,'{\"city\": \"Lekki\", \"email\": \"uyiabbe@gmail.com\", \"phone\": \"+2347678986543\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Abbe\", \"first_name\": \"Uyi\", \"postal_code\": \"\", \"address_line_1\": \"Block 112 plot 25 Adebisi Oguniyi Crescent\"}','home',4500.00,NULL,NULL,'paid','processing','bank_transfer','FC11108562770',NULL,'2025-09-05 22:25:08','2025-09-05 23:40:28'),('94c9b408-6ad8-44e3-8288-1023bcf9f0b3','5fde4ff3-1248-4a9f-9d78-6c54298aa535',NULL,'WELCOME10',0.00,3412.50,'{\"city\": \"Lekki\", \"email\": \"erickaser@gmail.com\", \"phone\": \"+2349834568939\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Kaser\", \"first_name\": \"Eric\", \"postal_code\": \"\", \"address_line_1\": \"Block 19 Ralph J Karienren Crescent Lekki Scheme 2\"}','home',4500.00,NULL,NULL,'paid','processing','bank_transfer','FC91795276290',NULL,'2025-09-04 13:16:35','2025-09-05 23:33:09'),('976b8b4d-1f5a-4f9a-9af7-25960e9546e9','9f9bfeac-8407-11f0-a1b3-084957d83787',NULL,'WELCOME10',0.00,11212.50,'{\"city\": \"Lekki\", \"email\": \"uyiabbe@gmail.com\", \"phone\": \"+2347678986543\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Abbe\", \"first_name\": \"Uyi\", \"postal_code\": \"\", \"address_line_1\": \"Block 112 plot 25 Adebisi Oguniyi Crescent\"}','home',4500.00,NULL,NULL,'paid','delivered','bank_transfer','FC10996520115',NULL,'2025-09-05 22:23:16','2025-09-09 22:11:53'),('97c76a72-2d1a-4c8d-a8e0-9483a7d022cc','9f9bfeac-8407-11f0-a1b3-084957d83787',NULL,NULL,0.00,14512.50,'{\"city\": \"Lekki\", \"email\": \"uyiabbe@gmail.com\", \"phone\": \"+2347678986543\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Abbe\", \"first_name\": \"Uyi\", \"postal_code\": \"\", \"address_line_1\": \"Block 112 plot 25 Adebisi Oguniyi Crescent\"}','pickup',0.00,NULL,NULL,'paid','processing','bank_transfer','FC15999648630',NULL,'2025-09-05 23:46:39','2025-09-08 01:55:47'),('9d0b8669-7814-4180-b521-4366c04a4f34','9f9bfeac-8407-11f0-a1b3-084957d83787',NULL,NULL,0.00,9337.50,'{\"city\": \"Lekki\", \"email\": \"uyiabbe@gmail.com\", \"phone\": \"+2347678986543\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Abbe\", \"first_name\": \"Uyi\", \"postal_code\": \"\", \"address_line_1\": \"Block 112 plot 25 Adebisi Oguniyi Crescent\"}','home',4500.00,NULL,NULL,'paid','processing','bank_transfer','FC15585608601',NULL,'2025-09-05 23:39:45','2025-09-07 21:44:25'),('a8cafb93-5bf7-4f78-ade8-c6527648d083','9f9bfeac-8407-11f0-a1b3-084957d83787',NULL,NULL,0.00,13975.00,'{\"city\": \"Lekki\", \"email\": \"uyiabbe@gmail.com\", \"phone\": \"+2347678986543\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Abbe\", \"first_name\": \"Uyi\", \"postal_code\": \"\", \"address_line_1\": \"Block 112 plot 25 Adebisi Oguniyi Crescent\"}','pickup',0.00,NULL,NULL,'paid','shipped','bank_transfer','FC15907908739',NULL,'2025-09-05 23:45:07','2025-09-09 22:10:07'),('aa8d1544-93ef-47e4-abe3-4a08c55fc867','9f9bfeac-8407-11f0-a1b3-084957d83787',NULL,NULL,0.00,3762.50,'{\"city\": \"Lekki\", \"email\": \"uyiabbe@gmail.com\", \"phone\": \"+2347678986543\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Abbe\", \"first_name\": \"Uyi\", \"postal_code\": \"\", \"address_line_1\": \"Block 112 plot 25 Adebisi Oguniyi Crescent\"}','home',4500.00,NULL,NULL,'paid','processing','bank_transfer','FC13468868007',NULL,'2025-09-05 23:04:28','2025-09-05 23:40:36'),('b39163d0-e0c2-48fb-bd97-15e81410ddde','5fde4ff3-1248-4a9f-9d78-6c54298aa535',NULL,NULL,0.00,9924.44,'{\"city\": \"Lekki\", \"email\": \"erickaser@gmail.com\", \"phone\": \"+2349834568939\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Kaser\", \"first_name\": \"Eric\", \"postal_code\": \"\", \"address_line_1\": \"Block 19 Ralph J Karienren Crescent Lekki Scheme 2\"}','home',4500.00,NULL,NULL,'paid','processing','bank_transfer','FC70725488901',NULL,'2025-09-03 03:38:45','2025-09-05 23:33:09'),('b8b57a30-7e2b-46c2-afea-a6982a1a7022','5fde4ff3-1248-4a9f-9d78-6c54298aa535',NULL,NULL,0.00,7912.50,'{\"city\": \"Lekki\", \"email\": \"erickaser@gmail.com\", \"phone\": \"+2349834568939\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Kaser\", \"first_name\": \"Eric\", \"postal_code\": \"\", \"address_line_1\": \"Block 19 Ralph J Karienren Crescent Lekki Scheme 2\"}','home',0.00,NULL,NULL,'pending','pending','bank_transfer','FC94706214100',NULL,'2025-09-08 01:25:06','2025-09-08 01:25:06'),('baa0994f-fc45-43c6-90d6-163ed7e731e7','5fde4ff3-1248-4a9f-9d78-6c54298aa535',NULL,NULL,0.00,14787.50,'{\"city\": \"Lekki\", \"email\": \"erickaser@gmail.com\", \"phone\": \"+2349834568939\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Kaser\", \"first_name\": \"Eric\", \"postal_code\": \"\", \"address_line_1\": \"Block 19 Ralph J Karienren Crescent Lekki Scheme 2\"}','home',4500.00,NULL,NULL,'paid','processing','bank_transfer','FC38090054395',NULL,'2025-09-02 18:34:50','2025-09-05 23:33:09'),('c0385139-6a3f-4345-a76d-b2bc40477813','0217bffe-8bdc-11f0-b67e-edb4be9dd75f',NULL,NULL,0.00,16105.00,'{\"city\": \"Lekki\", \"email\": \"marikosama@outlook.com\", \"phone\": \"+2347045556709\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Sama\", \"first_name\": \"Mariko\", \"postal_code\": \"\", \"address_line_1\": \"Block 112 plot 25 Adebisi Oguniyi Crescent\"}','home',4500.00,NULL,NULL,'paid','cancelled','bank_transfer','FC53702028372',NULL,'2025-09-07 14:01:42','2025-09-09 23:39:13'),('c502d364-d723-4cc7-b0b6-f813788faa62','5fde4ff3-1248-4a9f-9d78-6c54298aa535',NULL,NULL,0.00,16400.00,'{\"city\": \"Lekki\", \"email\": \"erickaser@gmail.com\", \"phone\": \"+2349834568939\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Kaser\", \"first_name\": \"Eric\", \"postal_code\": \"\", \"address_line_1\": \"Block 19 Ralph J Karienren Crescent Lekki Scheme 2\"}','home',3500.00,NULL,NULL,'pending','pending','bank_transfer','FC96140665719',NULL,'2025-09-08 01:49:00','2025-09-08 01:49:00'),('c6100180-7480-40f5-85e8-8eb66475183f','5fde4ff3-1248-4a9f-9d78-6c54298aa535',NULL,'WELCOME10',0.00,8400.00,'{\"city\": \"Lekki\", \"email\": \"erickaser@gmail.com\", \"phone\": \"+2349834568939\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Kaser\", \"first_name\": \"Eric\", \"postal_code\": \"\", \"address_line_1\": \"Block 19 Ralph J Karienren Crescent Lekki Scheme 2\"}','home',4500.00,NULL,NULL,'paid','processing','bank_transfer','FC10497345222',NULL,'2025-09-05 22:14:57','2025-09-05 23:33:09'),('c6249715-c971-4408-8217-3deec7f2bf07','5fde4ff3-1248-4a9f-9d78-6c54298aa535',NULL,'WELCOME10',0.00,18150.00,'{\"city\": \"Lekki\", \"email\": \"erickaser@gmail.com\", \"phone\": \"+2349834568939\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Kaser\", \"first_name\": \"Eric\", \"postal_code\": \"\", \"address_line_1\": \"Block 19 Ralph J Karienren Crescent Lekki Scheme 2\"}','home',4500.00,NULL,NULL,'paid','processing','bank_transfer','FC10301464520',NULL,'2025-09-05 22:11:41','2025-09-05 23:33:09'),('ccaf77bb-36d6-4d69-840a-503325dc8487','9f9bfeac-8407-11f0-a1b3-084957d83787',NULL,'WELCOME10',0.00,13527.50,'{\"city\": \"Lekki\", \"email\": \"uyiabbe@gmail.com\", \"phone\": \"+2347678986543\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Abbe\", \"first_name\": \"Uyi\", \"postal_code\": \"\", \"address_line_1\": \"Block 112 plot 25 Adebisi Oguniyi Crescent\"}','home',3500.00,NULL,NULL,'paid','processing','bank_transfer','FC81869781541',NULL,'2025-09-07 21:51:09','2025-09-09 23:32:26'),('cfbfb707-0e3b-4f1b-aa73-05e6ff7b7193','0217bffe-8bdc-11f0-b67e-edb4be9dd75f',NULL,NULL,0.00,8775.00,'{\"city\": \"Lekki\", \"email\": \"marikosama@outlook.com\", \"phone\": \"+2347045556709\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Sama\", \"first_name\": \"Mariko\", \"postal_code\": \"\", \"address_line_1\": \"Block 112 plot 25 Adebisi Oguniyi Crescent\"}','home',3500.00,NULL,NULL,'paid','delivered','bank_transfer','FC79453261468',NULL,'2025-09-07 21:10:53','2025-09-09 23:39:30'),('d53d0539-5596-40f5-8207-28facad4d438','5fde4ff3-1248-4a9f-9d78-6c54298aa535',NULL,NULL,0.00,17400.00,'{\"city\": \"Lekki\", \"email\": \"erickaser@gmail.com\", \"phone\": \"+2349834568939\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Kaser\", \"first_name\": \"Eric\", \"postal_code\": \"\", \"address_line_1\": \"Block 19 Ralph J Karienren Crescent Lekki Scheme 2\"}','home',4500.00,NULL,NULL,'paid','processing','bank_transfer','FC69511125255',NULL,'2025-09-03 03:18:31','2025-09-05 23:33:09'),('d927792e-65fe-4e9d-aed1-543067f876cd','0217bffe-8bdc-11f0-b67e-edb4be9dd75f',NULL,NULL,0.00,17242.50,'{\"city\": \"Lekki\", \"email\": \"marikosama@outlook.com\", \"phone\": \"+2347045556709\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Sama\", \"first_name\": \"Mariko\", \"postal_code\": \"\", \"address_line_1\": \"Block 112 plot 25 Adebisi Oguniyi Crescent\"}','home',3000.00,NULL,NULL,'paid','shipped','bank_transfer','FC81410205899',NULL,'2025-09-07 21:43:30','2025-09-09 23:38:27'),('da39b6be-a278-4103-8e9e-50f38fbd9306','5fde4ff3-1248-4a9f-9d78-6c54298aa535',NULL,'WELCOME10',0.00,10350.00,'{\"city\": \"Lekki\", \"email\": \"erickaser@gmail.com\", \"phone\": \"+2349834568939\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Kaser\", \"first_name\": \"Eric\", \"postal_code\": \"\", \"address_line_1\": \"Block 19 Ralph J Karienren Crescent Lekki Scheme 2\"}','home',4500.00,NULL,NULL,'paid','processing','bank_transfer','FC09726415757',NULL,'2025-09-05 22:02:06','2025-09-05 23:33:09'),('e18864b7-3f2c-4e7c-8974-311355f24486','9f9bfeac-8407-11f0-a1b3-084957d83787',NULL,NULL,0.00,15250.00,'{\"city\": \"Lekki\", \"email\": \"uyiabbe@gmail.com\", \"phone\": \"+2347678986543\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Abbe\", \"first_name\": \"Uyi\", \"postal_code\": \"\", \"address_line_1\": \"Block 112 plot 25 Adebisi Oguniyi Crescent\"}','home',4500.00,NULL,NULL,'paid','delivered','bank_transfer','FC15768375477',NULL,'2025-09-05 23:42:48','2025-09-09 22:10:10'),('e48f8807-f40f-4b3c-8890-4dec3069c81d','5fde4ff3-1248-4a9f-9d78-6c54298aa535',NULL,NULL,0.00,46387.50,'{\"city\": \"Lekki\", \"email\": \"erickaser@gmail.com\", \"phone\": \"+2349834568939\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Kaser\", \"first_name\": \"Eric\", \"postal_code\": \"\", \"address_line_1\": \"Block 19 Ralph J Karienren Crescent Lekki Scheme 2\"}','home',4500.00,NULL,NULL,'paid','processing','bank_transfer','FC50777312937',NULL,'2025-09-02 22:06:17','2025-09-05 23:33:09'),('e628383c-17fc-4791-89f7-fe06c918a053','5fde4ff3-1248-4a9f-9d78-6c54298aa535',NULL,NULL,0.00,21125.00,'{\"city\": \"Lekki\", \"email\": \"erickaser@gmail.com\", \"phone\": \"+2349834568939\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Kaser\", \"first_name\": \"Eric\", \"postal_code\": \"\", \"address_line_1\": \"Block 19 Ralph J Karienren Crescent Lekki Scheme 2\"}','home',4500.00,NULL,NULL,'paid','processing','bank_transfer','FC53655940886',NULL,'2025-09-02 22:54:15','2025-09-05 23:33:09'),('e70da776-748a-4f8d-93e6-c0b2e8df961d','9f9bfeac-8407-11f0-a1b3-084957d83787',NULL,NULL,0.00,2150.00,'{\"city\": \"Lekki\", \"email\": \"uyiabbe@gmail.com\", \"phone\": \"+2347678986543\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Abbe\", \"first_name\": \"Uyi\", \"postal_code\": \"\", \"address_line_1\": \"Block 112 plot 25 Adebisi Oguniyi Crescent\"}','pickup',0.00,NULL,NULL,'paid','delivered','bank_transfer','FC15289823051',NULL,'2025-09-05 23:34:49','2025-09-10 00:23:10'),('f5567e22-514b-4679-b497-e3cebd3818ec','5fde4ff3-1248-4a9f-9d78-6c54298aa535',NULL,NULL,0.00,8762.50,'{\"city\": \"Lekki\", \"email\": \"erickaser@gmail.com\", \"phone\": \"+2349834568939\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Kaser\", \"first_name\": \"Eric\", \"postal_code\": \"\", \"address_line_1\": \"Block 19 Ralph J Karienren Crescent Lekki Scheme 2\"}','home',4500.00,NULL,NULL,'paid','processing','bank_transfer','FC50421842345',NULL,'2025-09-02 22:00:21','2025-09-05 23:33:09'),('ffc86d23-fafc-4a6e-b0fd-0378a648d84d','0217bffe-8bdc-11f0-b67e-edb4be9dd75f',NULL,NULL,0.00,11077.50,'{\"city\": \"Lekki\", \"email\": \"marikosama@outlook.com\", \"phone\": \"+2347045556709\", \"state\": \"Lagos\", \"country\": \"Nigeria\", \"last_name\": \"Sama\", \"first_name\": \"Mariko\", \"postal_code\": \"\", \"address_line_1\": \"Block 112 plot 25 Adebisi Oguniyi Crescent\"}','pickup',0.00,NULL,NULL,'paid','delivered','bank_transfer','FC81382583542',NULL,'2025-09-07 21:43:02','2025-09-09 23:39:45'),('ord-10day-001','cust-004',NULL,NULL,0.00,312.45,'{\"city\": \"Lagos\", \"address\": \"321 Elm Rd\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','delivered','paystack',NULL,NULL,'2025-08-08 11:58:23','2025-09-05 23:33:09'),('ord-120day-001','cust-005',NULL,NULL,0.00,345.60,'{\"city\": \"Lagos\", \"address\": \"654 Maple Dr\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','delivered','paystack',NULL,NULL,'2025-04-20 11:58:23','2025-09-05 23:33:09'),('ord-12day-001','cust-005',NULL,NULL,0.00,175.20,'{\"city\": \"Lagos\", \"address\": \"654 Maple Dr\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','delivered','paystack',NULL,NULL,'2025-08-06 11:58:23','2025-09-05 23:33:09'),('ord-150day-001','cust-001',NULL,NULL,0.00,223.75,'{\"city\": \"Lagos\", \"address\": \"123 Main St\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','delivered','paystack',NULL,NULL,'2025-03-21 11:58:23','2025-09-05 23:33:09'),('ord-15day-001','cust-001',NULL,NULL,0.00,298.90,'{\"city\": \"Lagos\", \"address\": \"123 Main St\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','delivered','paystack',NULL,NULL,'2025-08-03 11:58:23','2025-09-05 23:33:09'),('ord-180day-001','cust-002',NULL,NULL,0.00,189.40,'{\"city\": \"Lagos\", \"address\": \"456 Oak Ave\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','delivered','paystack',NULL,NULL,'2025-02-19 11:58:23','2025-09-05 23:33:09'),('ord-18day-001','cust-002',NULL,NULL,0.00,186.35,'{\"city\": \"Lagos\", \"address\": \"456 Oak Ave\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','delivered','paystack',NULL,NULL,'2025-07-31 11:58:23','2025-09-05 23:33:09'),('ord-1day-001','cust-004',NULL,NULL,0.00,178.90,'{\"city\": \"Lagos\", \"address\": \"321 Elm Rd\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','processing','paystack',NULL,NULL,'2025-08-17 11:58:23','2025-09-05 23:33:09'),('ord-1day-002','cust-005',NULL,NULL,0.00,267.25,'{\"city\": \"Lagos\", \"address\": \"654 Maple Dr\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','processing','paystack',NULL,NULL,'2025-08-17 11:58:23','2025-09-05 23:33:09'),('ord-20day-001','cust-003',NULL,NULL,0.00,243.60,'{\"city\": \"Lagos\", \"address\": \"789 Pine St\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','delivered','paystack',NULL,NULL,'2025-07-29 11:58:23','2025-09-05 23:33:09'),('ord-210day-001','cust-003',NULL,NULL,0.00,267.85,'{\"city\": \"Lagos\", \"address\": \"789 Pine St\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','delivered','paystack',NULL,NULL,'2025-01-20 11:58:23','2025-09-05 23:33:09'),('ord-22day-001','cust-004',NULL,NULL,0.00,167.80,'{\"city\": \"Lagos\", \"address\": \"321 Elm Rd\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','delivered','paystack',NULL,NULL,'2025-07-27 11:58:23','2025-09-05 23:33:09'),('ord-240day-001','cust-004',NULL,NULL,0.00,195.20,'{\"city\": \"Lagos\", \"address\": \"321 Elm Rd\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','delivered','paystack',NULL,NULL,'2024-12-21 11:58:23','2025-09-05 23:33:09'),('ord-25day-001','cust-005',NULL,NULL,0.00,334.15,'{\"city\": \"Lagos\", \"address\": \"654 Maple Dr\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','delivered','paystack',NULL,NULL,'2025-07-24 11:58:23','2025-09-05 23:33:09'),('ord-270day-001','cust-005',NULL,NULL,0.00,278.65,'{\"city\": \"Lagos\", \"address\": \"654 Maple Dr\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','delivered','paystack',NULL,NULL,'2024-11-21 11:58:23','2025-09-05 23:33:09'),('ord-28day-001','cust-001',NULL,NULL,0.00,291.50,'{\"city\": \"Lagos\", \"address\": \"123 Main St\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','delivered','paystack',NULL,NULL,'2025-07-21 11:58:23','2025-09-05 23:33:09'),('ord-2day-001','cust-001',NULL,NULL,0.00,145.85,'{\"city\": \"Lagos\", \"address\": \"123 Main St\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','cancelled','paystack',NULL,NULL,'2025-08-16 11:58:23','2025-09-05 23:33:09'),('ord-2day-002','cust-002',NULL,NULL,0.00,191.20,'{\"city\": \"Lagos\", \"address\": \"456 Oak Ave\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','cancelled','paystack',NULL,NULL,'2025-08-16 11:58:23','2025-09-05 23:33:09'),('ord-300day-001','cust-001',NULL,NULL,0.00,234.90,'{\"city\": \"Lagos\", \"address\": \"123 Main St\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','delivered','paystack',NULL,NULL,'2024-10-22 11:58:23','2025-09-05 23:33:09'),('ord-30day-001','cust-002',NULL,NULL,0.00,178.25,'{\"city\": \"Lagos\", \"address\": \"456 Oak Ave\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','delivered','paystack',NULL,NULL,'2025-07-19 11:58:23','2025-09-05 23:33:09'),('ord-330day-001','cust-002',NULL,NULL,0.00,176.35,'{\"city\": \"Lagos\", \"address\": \"456 Oak Ave\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','delivered','paystack',NULL,NULL,'2024-09-22 11:58:23','2025-09-05 23:33:09'),('ord-35day-001','cust-003',NULL,NULL,0.00,256.70,'{\"city\": \"Lagos\", \"address\": \"789 Pine St\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','delivered','paystack',NULL,NULL,'2025-07-14 11:58:23','2025-09-05 23:33:09'),('ord-360day-001','cust-003',NULL,NULL,0.00,303.50,'{\"city\": \"Lagos\", \"address\": \"789 Pine St\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','delivered','paystack',NULL,NULL,'2024-08-23 11:58:23','2025-09-05 23:33:09'),('ord-3day-001','cust-003',NULL,NULL,0.00,356.30,'{\"city\": \"Lagos\", \"address\": \"789 Pine St\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','shipped','paystack',NULL,NULL,'2025-08-15 11:58:23','2025-09-05 23:33:09'),('ord-40day-001','cust-004',NULL,NULL,0.00,189.95,'{\"city\": \"Lagos\", \"address\": \"321 Elm Rd\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','delivered','paystack',NULL,NULL,'2025-07-09 11:58:23','2025-09-05 23:33:09'),('ord-45day-001','cust-005',NULL,NULL,0.00,313.40,'{\"city\": \"Lagos\", \"address\": \"654 Maple Dr\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','delivered','paystack',NULL,NULL,'2025-07-04 11:58:23','2025-09-05 23:33:09'),('ord-4day-001','cust-004',NULL,NULL,0.00,278.95,'{\"city\": \"Lagos\", \"address\": \"321 Elm Rd\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','processing','paystack',NULL,NULL,'2025-08-14 11:58:23','2025-09-05 23:33:09'),('ord-4day-002','cust-005',NULL,NULL,0.00,103.40,'{\"city\": \"Lagos\", \"address\": \"654 Maple Dr\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','shipped','paystack',NULL,NULL,'2025-08-14 11:58:23','2025-09-05 23:33:09'),('ord-50day-001','cust-001',NULL,NULL,0.00,174.85,'{\"city\": \"Lagos\", \"address\": \"123 Main St\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','delivered','paystack',NULL,NULL,'2025-06-29 11:58:23','2025-09-05 23:33:09'),('ord-55day-001','cust-002',NULL,NULL,0.00,267.20,'{\"city\": \"Lagos\", \"address\": \"456 Oak Ave\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','delivered','paystack',NULL,NULL,'2025-06-24 11:58:23','2025-09-05 23:33:09'),('ord-5day-001','cust-001',NULL,NULL,0.00,234.75,'{\"city\": \"Lagos\", \"address\": \"123 Main St\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','processing','paystack',NULL,NULL,'2025-08-13 11:58:23','2025-09-05 23:33:09'),('ord-60day-001','cust-003',NULL,NULL,0.00,193.60,'{\"city\": \"Lagos\", \"address\": \"789 Pine St\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','delivered','paystack',NULL,NULL,'2025-06-19 11:58:23','2025-09-05 23:33:09'),('ord-65day-001','cust-004',NULL,NULL,0.00,245.75,'{\"city\": \"Lagos\", \"address\": \"321 Elm Rd\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','delivered','paystack',NULL,NULL,'2025-06-14 11:58:23','2025-09-05 23:33:09'),('ord-6day-001','cust-002',NULL,NULL,0.00,189.60,'{\"city\": \"Lagos\", \"address\": \"456 Oak Ave\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','processing','paystack',NULL,NULL,'2025-08-12 11:58:23','2025-09-05 23:33:09'),('ord-70day-001','cust-005',NULL,NULL,0.00,182.30,'{\"city\": \"Lagos\", \"address\": \"654 Maple Dr\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','delivered','paystack',NULL,NULL,'2025-06-09 11:58:23','2025-09-05 23:33:09'),('ord-75day-001','cust-001',NULL,NULL,0.00,298.45,'{\"city\": \"Lagos\", \"address\": \"123 Main St\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','delivered','paystack',NULL,NULL,'2025-06-04 11:58:23','2025-09-05 23:33:09'),('ord-7day-001','cust-003',NULL,NULL,0.00,167.85,'{\"city\": \"Lagos\", \"address\": \"789 Pine St\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','cancelled','paystack',NULL,NULL,'2025-08-11 11:58:23','2025-09-05 23:33:09'),('ord-80day-001','cust-002',NULL,NULL,0.00,176.90,'{\"city\": \"Lagos\", \"address\": \"456 Oak Ave\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','delivered','paystack',NULL,NULL,'2025-05-30 11:58:23','2025-09-05 23:33:09'),('ord-85day-001','cust-003',NULL,NULL,0.00,234.85,'{\"city\": \"Lagos\", \"address\": \"789 Pine St\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','delivered','paystack',NULL,NULL,'2025-05-25 11:58:23','2025-09-05 23:33:09'),('ord-90day-001','cust-004',NULL,NULL,0.00,167.25,'{\"city\": \"Lagos\", \"address\": \"321 Elm Rd\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','delivered','paystack',NULL,NULL,'2025-05-20 11:58:23','2025-09-05 23:33:09'),('ord-today-001','cust-001',NULL,NULL,0.00,145.50,'{\"city\": \"Lagos\", \"address\": \"123 Main St\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','processing','paystack',NULL,NULL,'2025-08-18 11:58:23','2025-09-05 23:33:09'),('ord-today-002','cust-002',NULL,NULL,0.00,232.75,'{\"city\": \"Lagos\", \"address\": \"456 Oak Ave\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','processing','paystack',NULL,NULL,'2025-08-18 11:58:23','2025-09-05 23:33:09'),('ord-today-003','cust-003',NULL,NULL,0.00,89.25,'{\"city\": \"Lagos\", \"address\": \"789 Pine St\", \"country\": \"Nigeria\"}','home',4500.00,NULL,NULL,'paid','processing','paystack',NULL,NULL,'2025-08-18 11:58:23','2025-09-05 23:33:09');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `page_versions`
--

DROP TABLE IF EXISTS `page_versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `page_versions` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `page_id` varchar(36) NOT NULL,
  `version_number` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text,
  `meta_keywords` text,
  `status` enum('draft','published','archived') NOT NULL,
  `created_by` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_page_version` (`page_id`,`version_number`),
  KEY `idx_page_id` (`page_id`),
  KEY `idx_version_number` (`version_number`),
  KEY `idx_created_at` (`created_at`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `page_versions_ibfk_1` FOREIGN KEY (`page_id`) REFERENCES `website_pages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `page_versions_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `page_versions`
--

LOCK TABLES `page_versions` WRITE;
/*!40000 ALTER TABLE `page_versions` DISABLE KEYS */;
INSERT INTO `page_versions` (`id`, `page_id`, `version_number`, `title`, `content`, `meta_title`, `meta_description`, `meta_keywords`, `status`, `created_by`, `created_at`) VALUES ('075212f5-44e3-4afe-8b39-1aae6aedbdcc','834c3486-da40-4f47-8081-463e614a7af4',4,'Privacy Policy','This is our policy. Please read','','','','published','b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-21 13:05:33'),('116c5e45-72fd-494c-9185-6560644af9b9','f1fa9770-f145-43db-a47f-dfe577dec2c0',7,'Cancellation Policy','<h2>INTRODUCTION</h2>\nThe Cancellation Policy outlines the terms and conditions for cancelling orders placed through FreshCounty. We understand that circumstances may change, and we strive to provide flexible options for our customers.\n<br/>\nPlease read this policy carefully to understand when and how you can cancel your orders, and any associated fees or restrictions that may apply.<br/>\n\nThis policy should be read in conjunction with our Terms of Service and other applicable policies.<br/>\n\n<h2>ORDER CANCELLATION WINDOW</h2>\nOrders can be cancelled within 30 minutes of placement, provided the order has not yet been processed for preparation or dispatch. This allows us sufficient time to prevent unnecessary food preparation and waste.<br/>\n\nOnce an order enters the preparation phase (typically within 30-60 minutes of placement, depending on demand), cancellation may not be possible or may incur additional fees. <br/>\n\nFor scheduled orders placed in advance, cancellations must be made at least 2 hours before the planned preparation time to avoid cancellation fees.<br/>\n\n<h2>HOW TO CANCEL YOUR ORDER</h2>\nTo cancel your order, please contact our customer service team immediately at +234-809-967-748 or email support@freshcounty.com. Please have your order number ready when contacting us.<br/>\n\nYou may also cancel your order through your account dashboard if the cancellation window is still open. Look for the \'Cancel Order\' button next to your active orders.<br/>\n\nFor urgent cancellation requests, we recommend calling our customer service line directly, as this is the fastest way to process your cancellation request.<br/>\n\n<h2>CANCELLATION FEES</h2>\nOrders cancelled within the free cancellation window (30 minutes) will receive a full refund with no cancellation fees applied.<br/>\n\nOrders cancelled after the free window but before preparation begins may be subject to a 10% cancellation fee to cover administrative costs.<br/>\n\nOrders cancelled after preparation has begun may be subject to a 25% cancellation fee, or in some cases, the full order amount if the food has already been prepared.<br/>\n\n<h2>REFUND PROCESSING</h2>\nEligible refunds will be processed within 3-5 business days and will be credited back to your original payment method. The exact timing may depend on your bank or payment provider. <br/>\n\nFor orders paid with digital wallets or online payment platforms, refunds may be processed faster, typically within 24-48 hours.<br/>\n\nWe will send you an email confirmation once your refund has been processed, including details about when you can expect to see the credit in your account.<br/>\n\n<h2>NON-CANCELLABLE ORDERS</h2>\nOrders that have been delivered and received by the customer cannot be cancelled. However, if you have concerns about product quality or other issues, please contact us within 24 hours of delivery.<br/>\n\nCustom or specially prepared orders may have different cancellation terms and may not be eligible for cancellation once preparation begins.<br/>\n\nOrders placed during peak hours or special promotional periods may have modified cancellation windows due to increased processing times.<br/>\n\n<h2>FORCE MAJEURE AND SERVICE DISRUPTIONS</h2>\nIn cases of unexpected events such as severe weather, natural disasters, or other circumstances beyond our control, we may need to cancel orders on our end. In such cases, full refunds will be provided automatically.<br/>\n\nIf we need to cancel your order due to ingredient availability, supplier issues, or operational problems, we will contact you immediately and provide a full refund or offer to reschedule your order.<br/>\n\nWe are not liable for any consequential damages or additional costs you may incur due to order cancellations caused by circumstances beyond our control.<br/>\n\n<h2>SUBSCRIPTION AND RECURRING ORDERS</h2>\nFor subscription services or recurring orders, you may cancel your subscription at any time through your account settings or by contacting customer service.<br/>\n\nCancellation of subscription services will take effect from the next billing cycle. You will continue to receive scheduled deliveries until the end of your current billing period.<br/>\n\nIndividual orders within an active subscription can be skipped or cancelled according to the same terms outlined in this policy, but this will not affect your overall subscription status.<br/>\n\n<h2>CONTACT INFORMATION</h2>\nFor any questions about cancellations, refunds, or this Cancellation Policy, please contact us:<br/>\n\nCustomer Service: +234-809-967-748 (Available 7 days a week, 8 AM - 10 PM)<br/>\n\nEmail: support@freshcounty.com<br/>\n\nLive Chat: Available on our website and mobile app during business hours<br/>\n\nOur customer service team is trained to help you with cancellations and will work with you to find the best solution for your situation.','','','','published','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-08 16:16:41'),('119c2b79-b2d2-4d78-ae2f-e612f6246ba6','834c3486-da40-4f47-8081-463e614a7af4',8,'Privacy Policy','INTRODUCTION\nThis Privacy Policy outlines the terms and conditions for cancelling orders placed through FreshCounty. We understand that circumstances may change, and we strive to provide flexible options for our customers.\n\nPlease read this policy carefully to understand when and how you can cancel your orders, and any associated fees or restrictions that may apply.\n\nThis policy should be read in conjunction with our Terms of Service and other applicable policies.\n\nORDER CANCELLATION WINDOW\nOrders can be cancelled within 30 minutes of placement, provided the order has not yet been processed for preparation or dispatch. This allows us sufficient time to prevent unnecessary food preparation and waste.\n\nOnce an order enters the preparation phase (typically within 30-60 minutes of placement depending on demand), cancellation may not be possible or may be subject to additional fees.\n\nFor scheduled orders placed in advance, cancellations must be made at least 2 hours before the scheduled preparation time to avoid cancellation fees.\n\nHOW TO CANCEL YOUR ORDER\nTo cancel your order, please contact our customer service team immediately at +234-809-967-748 or email support@freshcounty.com. Please have your order number ready when contacting us.\n\nYou may also cancel your order through your account dashboard if the cancellation window is still open. Look for the \'Cancel Order\' button next to your active orders.\n\nFor urgent cancellation requests, we recommend calling our customer service line directly, as this is the fastest way to process your cancellation request.\n\nCANCELLATION FEES\nOrders cancelled within the free cancellation window (30 minutes) will receive a full refund with no cancellation fees applied.\n\nOrders cancelled after the free window but before preparation begins may be subject to a 10% cancellation fee to cover administrative costs.\n\nOrders cancelled after preparation has begun may be subject to a 25% cancellation fee, or in some cases, the full order amount if the food has already been prepared.\n\nREFUND PROCESSING\nEligible refunds will be processed within 3-5 business days and will be credited back to your original payment method. The exact timing may depend on your bank or payment provider.\n\nFor orders paid with digital wallets or online payment platforms, refunds may be processed faster, typically within 24-48 hours.\n\nWe will send you an email confirmation once your refund has been processed, including details about when you can expect to see the credit in your account.\n\nNON-CANCELLABLE ORDERS\nOrders that have been delivered and received by the customer cannot be cancelled. However, if you have concerns about product quality or other issues, please contact us within 24 hours of delivery.\n\nCustom or specially prepared orders may have different cancellation terms and may not be eligible for cancellation once preparation begins.\n\nOrders placed during peak hours or special promotional periods may have modified cancellation windows due to increased processing times.\n\nFORCE MAJEURE AND SERVICE DISRUPTIONS\nIn cases of unexpected events such as severe weather, natural disasters, or other circumstances beyond our control, we may need to cancel orders on our end. In such cases, full refunds will be provided automatically.\n\nIf we need to cancel your order due to ingredient availability, supplier issues, or operational problems, we will contact you immediately and provide a full refund or offer to reschedule your order.\n\nWe are not liable for any consequential damages or additional costs you may incur due to order cancellations caused by circumstances beyond our control.\n\nSUBSCRIPTION AND RECURRING ORDERS\nFor subscription services or recurring orders, you may cancel your subscription at any time through your account settings or by contacting customer service.\n\nCancellation of subscription services will take effect from the next billing cycle. You will continue to receive scheduled deliveries until the end of your current billing period.\n\nIndividual orders within an active subscription can be skipped or cancelled according to the same terms outlined in this policy, but this will not affect your overall subscription status.\n\nCONTACT INFORMATION\nFor any questions about cancellations, refunds, or this Cancellation Policy, please contact us:\n\nCustomer Service: +234-809-967-748 (Available 7 days a week, 8 AM - 10 PM)\n\nEmail: support@freshcounty.com\n\nLive Chat: Available on our website and mobile app during business hours\n\nOur customer service team is trained to help you with cancellations and will work with you to find the best solution for your situation.','','','','published','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-08 14:51:24'),('24015ecc-bd30-4c31-9be7-7ad6f2dbf38f','f1fa9770-f145-43db-a47f-dfe577dec2c0',6,'Cancellation Policy','<h2>INTRODUCTION</h2>\nThe Cancellation Policy outlines the terms and conditions for cancelling orders placed through FreshCounty. We understand that circumstances may change, and we strive to provide flexible options for our customers.\n<br/>\nPlease read this policy carefully to understand when and how you can cancel your orders, and any associated fees or restrictions that may apply.\n\nThis policy should be read in conjunction with our Terms of Service and other applicable policies.\n\nORDER CANCELLATION WINDOW\nOrders can be cancelled within 30 minutes of placement, provided the order has not yet been processed for preparation or dispatch. This allows us sufficient time to prevent unnecessary food preparation and waste.\n\nOnce an order enters the preparation phase (typically within 30-60 minutes of placement depending on demand), cancellation may not be possible or may be subject to additional fees.\n\nFor scheduled orders placed in advance, cancellations must be made at least 2 hours before the scheduled preparation time to avoid cancellation fees.\n\nHOW TO CANCEL YOUR ORDER\nTo cancel your order, please contact our customer service team immediately at +234-809-967-748 or email support@freshcounty.com. Please have your order number ready when contacting us.\n\nYou may also cancel your order through your account dashboard if the cancellation window is still open. Look for the \'Cancel Order\' button next to your active orders.\n\nFor urgent cancellation requests, we recommend calling our customer service line directly, as this is the fastest way to process your cancellation request.\n\nCANCELLATION FEES\nOrders cancelled within the free cancellation window (30 minutes) will receive a full refund with no cancellation fees applied.\n\nOrders cancelled after the free window but before preparation begins may be subject to a 10% cancellation fee to cover administrative costs.\n\nOrders cancelled after preparation has begun may be subject to a 25% cancellation fee, or in some cases, the full order amount if the food has already been prepared.\n\nREFUND PROCESSING\nEligible refunds will be processed within 3-5 business days and will be credited back to your original payment method. The exact timing may depend on your bank or payment provider.\n\nFor orders paid with digital wallets or online payment platforms, refunds may be processed faster, typically within 24-48 hours.\n\nWe will send you an email confirmation once your refund has been processed, including details about when you can expect to see the credit in your account.\n\nNON-CANCELLABLE ORDERS\nOrders that have been delivered and received by the customer cannot be cancelled. However, if you have concerns about product quality or other issues, please contact us within 24 hours of delivery.\n\nCustom or specially prepared orders may have different cancellation terms and may not be eligible for cancellation once preparation begins.\n\nOrders placed during peak hours or special promotional periods may have modified cancellation windows due to increased processing times.\n\nFORCE MAJEURE AND SERVICE DISRUPTIONS\nIn cases of unexpected events such as severe weather, natural disasters, or other circumstances beyond our control, we may need to cancel orders on our end. In such cases, full refunds will be provided automatically.\n\nIf we need to cancel your order due to ingredient availability, supplier issues, or operational problems, we will contact you immediately and provide a full refund or offer to reschedule your order.\n\nWe are not liable for any consequential damages or additional costs you may incur due to order cancellations caused by circumstances beyond our control.\n\nSUBSCRIPTION AND RECURRING ORDERS\nFor subscription services or recurring orders, you may cancel your subscription at any time through your account settings or by contacting customer service.\n\nCancellation of subscription services will take effect from the next billing cycle. You will continue to receive scheduled deliveries until the end of your current billing period.\n\nIndividual orders within an active subscription can be skipped or cancelled according to the same terms outlined in this policy, but this will not affect your overall subscription status.\n\nCONTACT INFORMATION\nFor any questions about cancellations, refunds, or this Cancellation Policy, please contact us:\n\nCustomer Service: +234-809-967-748 (Available 7 days a week, 8 AM - 10 PM)\n\nEmail: support@freshcounty.com\n\nLive Chat: Available on our website and mobile app during business hours\n\nOur customer service team is trained to help you with cancellations and will work with you to find the best solution for your situation.','','','','published','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-08 16:13:39'),('4830c3f3-8a8f-45b7-a732-f5099601d108','f1fa9770-f145-43db-a47f-dfe577dec2c0',1,'Cancellation Policy','Cancellation Policy','','','','draft','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-08-27 20:16:35'),('7118def7-0961-4f44-b6b8-1c8de72cb1a4','834c3486-da40-4f47-8081-463e614a7af4',2,'Privacy Policy','This is our policy','','','','published','b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-21 13:03:53'),('72fd5fe7-d74c-4fd7-b5e4-ea5319e8ff63','834c3486-da40-4f47-8081-463e614a7af4',9,'Privacy Policy','INTRODUCTION\nThis Privacy Policy outlines the terms and conditions for cancelling orders placed through FreshCounty. We understand that circumstances may change, and we strive to provide flexible options for our customers.\n\nPlease read this policy carefully to understand when and how you can cancel your orders, and any associated fees or restrictions that may apply.\n\nThis policy should be read in conjunction with our Terms of Service and other applicable policies.\n\nORDER CANCELLATION WINDOW\nOrders can be cancelled within 30 minutes of placement, provided the order has not yet been processed for preparation or dispatch. This allows us sufficient time to prevent unnecessary food preparation and waste.\n\nOnce an order enters the preparation phase (typically within 30-60 minutes of placement depending on demand), cancellation may not be possible or may be subject to additional fees.\n\nFor scheduled orders placed in advance, cancellations must be made at least 2 hours before the scheduled preparation time to avoid cancellation fees.\n\nHOW TO CANCEL YOUR ORDER\nTo cancel your order, please contact our customer service team immediately at +234-809-967-748 or email support@freshcounty.com. Please have your order number ready when contacting us.\n\nYou may also cancel your order through your account dashboard if the cancellation window is still open. Look for the \'Cancel Order\' button next to your active orders.\n\nFor urgent cancellation requests, we recommend calling our customer service line directly, as this is the fastest way to process your cancellation request.\n\nCANCELLATION FEES\nOrders cancelled within the free cancellation window (30 minutes) will receive a full refund with no cancellation fees applied.\n\nOrders cancelled after the free window but before preparation begins may be subject to a 10% cancellation fee to cover administrative costs.\n\nOrders cancelled after preparation has begun may be subject to a 25% cancellation fee, or in some cases, the full order amount if the food has already been prepared.\n\nREFUND PROCESSING\nEligible refunds will be processed within 3-5 business days and will be credited back to your original payment method. The exact timing may depend on your bank or payment provider.\n\nFor orders paid with digital wallets or online payment platforms, refunds may be processed faster, typically within 24-48 hours.\n\nWe will send you an email confirmation once your refund has been processed, including details about when you can expect to see the credit in your account.\n\nNON-CANCELLABLE ORDERS\nOrders that have been delivered and received by the customer cannot be cancelled. However, if you have concerns about product quality or other issues, please contact us within 24 hours of delivery.\n\nCustom or specially prepared orders may have different cancellation terms and may not be eligible for cancellation once preparation begins.\n\nOrders placed during peak hours or special promotional periods may have modified cancellation windows due to increased processing times.\n\nFORCE MAJEURE AND SERVICE DISRUPTIONS\nIn cases of unexpected events such as severe weather, natural disasters, or other circumstances beyond our control, we may need to cancel orders on our end. In such cases, full refunds will be provided automatically.\n\nIf we need to cancel your order due to ingredient availability, supplier issues, or operational problems, we will contact you immediately and provide a full refund or offer to reschedule your order.\n\nWe are not liable for any consequential damages or additional costs you may incur due to order cancellations caused by circumstances beyond our control.\n\nSUBSCRIPTION AND RECURRING ORDERS\nFor subscription services or recurring orders, you may cancel your subscription at any time through your account settings or by contacting customer service.\n\nCancellation of subscription services will take effect from the next billing cycle. You will continue to receive scheduled deliveries until the end of your current billing period.\n\nIndividual orders within an active subscription can be skipped or cancelled according to the same terms outlined in this policy, but this will not affect your overall subscription status.\n\nCONTACT INFORMATION\nFor any questions about cancellations, refunds, or this Cancellation Policy, please contact us:\n\nCustomer Service: +234-809-967-748 (Available 7 days a week, 8 AM - 10 PM)\n\nEmail: support@freshcounty.com\n\nLive Chat: Available on our website and mobile app during business hours\n\nOur customer service team is trained to help you with cancellations and will work with you to find the best solution for your situation.','','','','published','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-08 15:55:53'),('766691f1-f120-4510-971b-9891083680ba','de1639e8-aae9-49c7-b3e4-835068f0d2e3',3,'Terms of Service','INTRODUCTION\nThis Terms of Service outlines the terms and conditions for cancelling orders placed through FreshCounty. We understand that circumstances may change, and we strive to provide flexible options for our customers.\n\nPlease read this policy carefully to understand when and how you can cancel your orders, and any associated fees or restrictions that may apply.\n\nThis policy should be read in conjunction with our Terms of Service and other applicable policies.\n\nORDER CANCELLATION WINDOW\nOrders can be cancelled within 30 minutes of placement, provided the order has not yet been processed for preparation or dispatch. This allows us sufficient time to prevent unnecessary food preparation and waste.\n\nOnce an order enters the preparation phase (typically within 30-60 minutes of placement depending on demand), cancellation may not be possible or may be subject to additional fees.\n\nFor scheduled orders placed in advance, cancellations must be made at least 2 hours before the scheduled preparation time to avoid cancellation fees.\n\nHOW TO CANCEL YOUR ORDER\nTo cancel your order, please contact our customer service team immediately at +234-809-967-748 or email support@freshcounty.com. Please have your order number ready when contacting us.\n\nYou may also cancel your order through your account dashboard if the cancellation window is still open. Look for the \'Cancel Order\' button next to your active orders.\n\nFor urgent cancellation requests, we recommend calling our customer service line directly, as this is the fastest way to process your cancellation request.\n\nCANCELLATION FEES\nOrders cancelled within the free cancellation window (30 minutes) will receive a full refund with no cancellation fees applied.\n\nOrders cancelled after the free window but before preparation begins may be subject to a 10% cancellation fee to cover administrative costs.\n\nOrders cancelled after preparation has begun may be subject to a 25% cancellation fee, or in some cases, the full order amount if the food has already been prepared.\n\nREFUND PROCESSING\nEligible refunds will be processed within 3-5 business days and will be credited back to your original payment method. The exact timing may depend on your bank or payment provider.\n\nFor orders paid with digital wallets or online payment platforms, refunds may be processed faster, typically within 24-48 hours.\n\nWe will send you an email confirmation once your refund has been processed, including details about when you can expect to see the credit in your account.\n\nNON-CANCELLABLE ORDERS\nOrders that have been delivered and received by the customer cannot be cancelled. However, if you have concerns about product quality or other issues, please contact us within 24 hours of delivery.\n\nCustom or specially prepared orders may have different cancellation terms and may not be eligible for cancellation once preparation begins.\n\nOrders placed during peak hours or special promotional periods may have modified cancellation windows due to increased processing times.\n\nFORCE MAJEURE AND SERVICE DISRUPTIONS\nIn cases of unexpected events such as severe weather, natural disasters, or other circumstances beyond our control, we may need to cancel orders on our end. In such cases, full refunds will be provided automatically.\n\nIf we need to cancel your order due to ingredient availability, supplier issues, or operational problems, we will contact you immediately and provide a full refund or offer to reschedule your order.\n\nWe are not liable for any consequential damages or additional costs you may incur due to order cancellations caused by circumstances beyond our control.\n\nSUBSCRIPTION AND RECURRING ORDERS\nFor subscription services or recurring orders, you may cancel your subscription at any time through your account settings or by contacting customer service.\n\nCancellation of subscription services will take effect from the next billing cycle. You will continue to receive scheduled deliveries until the end of your current billing period.\n\nIndividual orders within an active subscription can be skipped or cancelled according to the same terms outlined in this policy, but this will not affect your overall subscription status.\n\nCONTACT INFORMATION\nFor any questions about cancellations, refunds, or this Cancellation Policy, please contact us:\n\nCustomer Service: +234-809-967-748 (Available 7 days a week, 8 AM - 10 PM)\n\nEmail: support@freshcounty.com\n\nLive Chat: Available on our website and mobile app during business hours\n\nOur customer service team is trained to help you with cancellations and will work with you to find the best solution for your situation.','','','','published','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-08 14:51:05'),('837a6f71-6f8e-4e86-8e60-0d5e590be00f','834c3486-da40-4f47-8081-463e614a7af4',3,'Privacy Policy','This is our policy.','','','','published','b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-21 13:05:11'),('840e586a-93a3-4c96-9f84-7d21dc77201b','834c3486-da40-4f47-8081-463e614a7af4',1,'Privacy Policy','This is our policy','','','','draft','b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-21 13:03:44'),('853d5b77-0227-433f-b7bc-dd446c8667c6','f1fa9770-f145-43db-a47f-dfe577dec2c0',3,'Cancellation Policy','INTRODUCTION\nThis Cancellation Policy outlines the terms and conditions for cancelling orders placed through FreshCounty. We understand that circumstances may change, and we strive to provide flexible options for our customers.\n\nPlease read this policy carefully to understand when and how you can cancel your orders, and any associated fees or restrictions that may apply.\n\nThis policy should be read in conjunction with our Terms of Service and other applicable policies.\n\nORDER CANCELLATION WINDOW\nOrders can be cancelled within 30 minutes of placement, provided the order has not yet been processed for preparation or dispatch. This allows us sufficient time to prevent unnecessary food preparation and waste.\n\nOnce an order enters the preparation phase (typically within 30-60 minutes of placement depending on demand), cancellation may not be possible or may be subject to additional fees.\n\nFor scheduled orders placed in advance, cancellations must be made at least 2 hours before the scheduled preparation time to avoid cancellation fees.\n\nHOW TO CANCEL YOUR ORDER\nTo cancel your order, please contact our customer service team immediately at +234-809-967-748 or email support@freshcounty.com. Please have your order number ready when contacting us.\n\nYou may also cancel your order through your account dashboard if the cancellation window is still open. Look for the \'Cancel Order\' button next to your active orders.\n\nFor urgent cancellation requests, we recommend calling our customer service line directly, as this is the fastest way to process your cancellation request.\n\nCANCELLATION FEES\nOrders cancelled within the free cancellation window (30 minutes) will receive a full refund with no cancellation fees applied.\n\nOrders cancelled after the free window but before preparation begins may be subject to a 10% cancellation fee to cover administrative costs.\n\nOrders cancelled after preparation has begun may be subject to a 25% cancellation fee, or in some cases, the full order amount if the food has already been prepared.\n\nREFUND PROCESSING\nEligible refunds will be processed within 3-5 business days and will be credited back to your original payment method. The exact timing may depend on your bank or payment provider.\n\nFor orders paid with digital wallets or online payment platforms, refunds may be processed faster, typically within 24-48 hours.\n\nWe will send you an email confirmation once your refund has been processed, including details about when you can expect to see the credit in your account.\n\nNON-CANCELLABLE ORDERS\nOrders that have been delivered and received by the customer cannot be cancelled. However, if you have concerns about product quality or other issues, please contact us within 24 hours of delivery.\n\nCustom or specially prepared orders may have different cancellation terms and may not be eligible for cancellation once preparation begins.\n\nOrders placed during peak hours or special promotional periods may have modified cancellation windows due to increased processing times.\n\nFORCE MAJEURE AND SERVICE DISRUPTIONS\nIn cases of unexpected events such as severe weather, natural disasters, or other circumstances beyond our control, we may need to cancel orders on our end. In such cases, full refunds will be provided automatically.\n\nIf we need to cancel your order due to ingredient availability, supplier issues, or operational problems, we will contact you immediately and provide a full refund or offer to reschedule your order.\n\nWe are not liable for any consequential damages or additional costs you may incur due to order cancellations caused by circumstances beyond our control.\n\nSUBSCRIPTION AND RECURRING ORDERS\nFor subscription services or recurring orders, you may cancel your subscription at any time through your account settings or by contacting customer service.\n\nCancellation of subscription services will take effect from the next billing cycle. You will continue to receive scheduled deliveries until the end of your current billing period.\n\nIndividual orders within an active subscription can be skipped or cancelled according to the same terms outlined in this policy, but this will not affect your overall subscription status.\n\nCONTACT INFORMATION\nFor any questions about cancellations, refunds, or this Cancellation Policy, please contact us:\n\nCustomer Service: +234-809-967-748 (Available 7 days a week, 8 AM - 10 PM)\n\nEmail: support@freshcounty.com\n\nLive Chat: Available on our website and mobile app during business hours\n\nOur customer service team is trained to help you with cancellations and will work with you to find the best solution for your situation.','','','','published','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-08 14:29:34'),('96671653-0c97-48fd-96d1-fb72eaae315a','f1fa9770-f145-43db-a47f-dfe577dec2c0',4,'Cancellation Policy','INTRODUCTION\nThe Cancellation Policy outlines the terms and conditions for cancelling orders placed through FreshCounty. We understand that circumstances may change, and we strive to provide flexible options for our customers.\n\nPlease read this policy carefully to understand when and how you can cancel your orders, and any associated fees or restrictions that may apply.\n\nThis policy should be read in conjunction with our Terms of Service and other applicable policies.\n\nORDER CANCELLATION WINDOW\nOrders can be cancelled within 30 minutes of placement, provided the order has not yet been processed for preparation or dispatch. This allows us sufficient time to prevent unnecessary food preparation and waste.\n\nOnce an order enters the preparation phase (typically within 30-60 minutes of placement depending on demand), cancellation may not be possible or may be subject to additional fees.\n\nFor scheduled orders placed in advance, cancellations must be made at least 2 hours before the scheduled preparation time to avoid cancellation fees.\n\nHOW TO CANCEL YOUR ORDER\nTo cancel your order, please contact our customer service team immediately at +234-809-967-748 or email support@freshcounty.com. Please have your order number ready when contacting us.\n\nYou may also cancel your order through your account dashboard if the cancellation window is still open. Look for the \'Cancel Order\' button next to your active orders.\n\nFor urgent cancellation requests, we recommend calling our customer service line directly, as this is the fastest way to process your cancellation request.\n\nCANCELLATION FEES\nOrders cancelled within the free cancellation window (30 minutes) will receive a full refund with no cancellation fees applied.\n\nOrders cancelled after the free window but before preparation begins may be subject to a 10% cancellation fee to cover administrative costs.\n\nOrders cancelled after preparation has begun may be subject to a 25% cancellation fee, or in some cases, the full order amount if the food has already been prepared.\n\nREFUND PROCESSING\nEligible refunds will be processed within 3-5 business days and will be credited back to your original payment method. The exact timing may depend on your bank or payment provider.\n\nFor orders paid with digital wallets or online payment platforms, refunds may be processed faster, typically within 24-48 hours.\n\nWe will send you an email confirmation once your refund has been processed, including details about when you can expect to see the credit in your account.\n\nNON-CANCELLABLE ORDERS\nOrders that have been delivered and received by the customer cannot be cancelled. However, if you have concerns about product quality or other issues, please contact us within 24 hours of delivery.\n\nCustom or specially prepared orders may have different cancellation terms and may not be eligible for cancellation once preparation begins.\n\nOrders placed during peak hours or special promotional periods may have modified cancellation windows due to increased processing times.\n\nFORCE MAJEURE AND SERVICE DISRUPTIONS\nIn cases of unexpected events such as severe weather, natural disasters, or other circumstances beyond our control, we may need to cancel orders on our end. In such cases, full refunds will be provided automatically.\n\nIf we need to cancel your order due to ingredient availability, supplier issues, or operational problems, we will contact you immediately and provide a full refund or offer to reschedule your order.\n\nWe are not liable for any consequential damages or additional costs you may incur due to order cancellations caused by circumstances beyond our control.\n\nSUBSCRIPTION AND RECURRING ORDERS\nFor subscription services or recurring orders, you may cancel your subscription at any time through your account settings or by contacting customer service.\n\nCancellation of subscription services will take effect from the next billing cycle. You will continue to receive scheduled deliveries until the end of your current billing period.\n\nIndividual orders within an active subscription can be skipped or cancelled according to the same terms outlined in this policy, but this will not affect your overall subscription status.\n\nCONTACT INFORMATION\nFor any questions about cancellations, refunds, or this Cancellation Policy, please contact us:\n\nCustomer Service: +234-809-967-748 (Available 7 days a week, 8 AM - 10 PM)\n\nEmail: support@freshcounty.com\n\nLive Chat: Available on our website and mobile app during business hours\n\nOur customer service team is trained to help you with cancellations and will work with you to find the best solution for your situation.','','','','published','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-08 15:49:07'),('98fe08f6-5e3f-4308-ba68-dbb615da8761','834c3486-da40-4f47-8081-463e614a7af4',5,'Privacy Policy','This is our policy. Please read','','','','draft','b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-21 13:05:55'),('b063066c-0c3a-4ef2-be4b-1fb452c6ca1d','de1639e8-aae9-49c7-b3e4-835068f0d2e3',2,'Terms of Service','INTRODUCTION\nThis Cancellation Policy outlines the terms and conditions for cancelling orders placed through FreshCounty. We understand that circumstances may change, and we strive to provide flexible options for our customers.\n\nPlease read this policy carefully to understand when and how you can cancel your orders, and any associated fees or restrictions that may apply.\n\nThis policy should be read in conjunction with our Terms of Service and other applicable policies.\n\nORDER CANCELLATION WINDOW\nOrders can be cancelled within 30 minutes of placement, provided the order has not yet been processed for preparation or dispatch. This allows us sufficient time to prevent unnecessary food preparation and waste.\n\nOnce an order enters the preparation phase (typically within 30-60 minutes of placement depending on demand), cancellation may not be possible or may be subject to additional fees.\n\nFor scheduled orders placed in advance, cancellations must be made at least 2 hours before the scheduled preparation time to avoid cancellation fees.\n\nHOW TO CANCEL YOUR ORDER\nTo cancel your order, please contact our customer service team immediately at +234-809-967-748 or email support@freshcounty.com. Please have your order number ready when contacting us.\n\nYou may also cancel your order through your account dashboard if the cancellation window is still open. Look for the \'Cancel Order\' button next to your active orders.\n\nFor urgent cancellation requests, we recommend calling our customer service line directly, as this is the fastest way to process your cancellation request.\n\nCANCELLATION FEES\nOrders cancelled within the free cancellation window (30 minutes) will receive a full refund with no cancellation fees applied.\n\nOrders cancelled after the free window but before preparation begins may be subject to a 10% cancellation fee to cover administrative costs.\n\nOrders cancelled after preparation has begun may be subject to a 25% cancellation fee, or in some cases, the full order amount if the food has already been prepared.\n\nREFUND PROCESSING\nEligible refunds will be processed within 3-5 business days and will be credited back to your original payment method. The exact timing may depend on your bank or payment provider.\n\nFor orders paid with digital wallets or online payment platforms, refunds may be processed faster, typically within 24-48 hours.\n\nWe will send you an email confirmation once your refund has been processed, including details about when you can expect to see the credit in your account.\n\nNON-CANCELLABLE ORDERS\nOrders that have been delivered and received by the customer cannot be cancelled. However, if you have concerns about product quality or other issues, please contact us within 24 hours of delivery.\n\nCustom or specially prepared orders may have different cancellation terms and may not be eligible for cancellation once preparation begins.\n\nOrders placed during peak hours or special promotional periods may have modified cancellation windows due to increased processing times.\n\nFORCE MAJEURE AND SERVICE DISRUPTIONS\nIn cases of unexpected events such as severe weather, natural disasters, or other circumstances beyond our control, we may need to cancel orders on our end. In such cases, full refunds will be provided automatically.\n\nIf we need to cancel your order due to ingredient availability, supplier issues, or operational problems, we will contact you immediately and provide a full refund or offer to reschedule your order.\n\nWe are not liable for any consequential damages or additional costs you may incur due to order cancellations caused by circumstances beyond our control.\n\nSUBSCRIPTION AND RECURRING ORDERS\nFor subscription services or recurring orders, you may cancel your subscription at any time through your account settings or by contacting customer service.\n\nCancellation of subscription services will take effect from the next billing cycle. You will continue to receive scheduled deliveries until the end of your current billing period.\n\nIndividual orders within an active subscription can be skipped or cancelled according to the same terms outlined in this policy, but this will not affect your overall subscription status.\n\nCONTACT INFORMATION\nFor any questions about cancellations, refunds, or this Cancellation Policy, please contact us:\n\nCustomer Service: +234-809-967-748 (Available 7 days a week, 8 AM - 10 PM)\n\nEmail: support@freshcounty.com\n\nLive Chat: Available on our website and mobile app during business hours\n\nOur customer service team is trained to help you with cancellations and will work with you to find the best solution for your situation.','','','','published','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-08 14:29:44'),('b0c55bb5-fc03-48ce-ba54-c5078e0418e9','f1fa9770-f145-43db-a47f-dfe577dec2c0',5,'Cancellation Policy','<h2>INTRODUCTION</h2>\nThe Cancellation Policy outlines the terms and conditions for cancelling orders placed through FreshCounty. We understand that circumstances may change, and we strive to provide flexible options for our customers.\n\nPlease read this policy carefully to understand when and how you can cancel your orders, and any associated fees or restrictions that may apply.\n\nThis policy should be read in conjunction with our Terms of Service and other applicable policies.\n\nORDER CANCELLATION WINDOW\nOrders can be cancelled within 30 minutes of placement, provided the order has not yet been processed for preparation or dispatch. This allows us sufficient time to prevent unnecessary food preparation and waste.\n\nOnce an order enters the preparation phase (typically within 30-60 minutes of placement depending on demand), cancellation may not be possible or may be subject to additional fees.\n\nFor scheduled orders placed in advance, cancellations must be made at least 2 hours before the scheduled preparation time to avoid cancellation fees.\n\nHOW TO CANCEL YOUR ORDER\nTo cancel your order, please contact our customer service team immediately at +234-809-967-748 or email support@freshcounty.com. Please have your order number ready when contacting us.\n\nYou may also cancel your order through your account dashboard if the cancellation window is still open. Look for the \'Cancel Order\' button next to your active orders.\n\nFor urgent cancellation requests, we recommend calling our customer service line directly, as this is the fastest way to process your cancellation request.\n\nCANCELLATION FEES\nOrders cancelled within the free cancellation window (30 minutes) will receive a full refund with no cancellation fees applied.\n\nOrders cancelled after the free window but before preparation begins may be subject to a 10% cancellation fee to cover administrative costs.\n\nOrders cancelled after preparation has begun may be subject to a 25% cancellation fee, or in some cases, the full order amount if the food has already been prepared.\n\nREFUND PROCESSING\nEligible refunds will be processed within 3-5 business days and will be credited back to your original payment method. The exact timing may depend on your bank or payment provider.\n\nFor orders paid with digital wallets or online payment platforms, refunds may be processed faster, typically within 24-48 hours.\n\nWe will send you an email confirmation once your refund has been processed, including details about when you can expect to see the credit in your account.\n\nNON-CANCELLABLE ORDERS\nOrders that have been delivered and received by the customer cannot be cancelled. However, if you have concerns about product quality or other issues, please contact us within 24 hours of delivery.\n\nCustom or specially prepared orders may have different cancellation terms and may not be eligible for cancellation once preparation begins.\n\nOrders placed during peak hours or special promotional periods may have modified cancellation windows due to increased processing times.\n\nFORCE MAJEURE AND SERVICE DISRUPTIONS\nIn cases of unexpected events such as severe weather, natural disasters, or other circumstances beyond our control, we may need to cancel orders on our end. In such cases, full refunds will be provided automatically.\n\nIf we need to cancel your order due to ingredient availability, supplier issues, or operational problems, we will contact you immediately and provide a full refund or offer to reschedule your order.\n\nWe are not liable for any consequential damages or additional costs you may incur due to order cancellations caused by circumstances beyond our control.\n\nSUBSCRIPTION AND RECURRING ORDERS\nFor subscription services or recurring orders, you may cancel your subscription at any time through your account settings or by contacting customer service.\n\nCancellation of subscription services will take effect from the next billing cycle. You will continue to receive scheduled deliveries until the end of your current billing period.\n\nIndividual orders within an active subscription can be skipped or cancelled according to the same terms outlined in this policy, but this will not affect your overall subscription status.\n\nCONTACT INFORMATION\nFor any questions about cancellations, refunds, or this Cancellation Policy, please contact us:\n\nCustomer Service: +234-809-967-748 (Available 7 days a week, 8 AM - 10 PM)\n\nEmail: support@freshcounty.com\n\nLive Chat: Available on our website and mobile app during business hours\n\nOur customer service team is trained to help you with cancellations and will work with you to find the best solution for your situation.','','','','published','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-08 16:12:47'),('ba821a5c-f08f-4ec4-a909-f49b600ed0f6','834c3486-da40-4f47-8081-463e614a7af4',6,'Privacy Policy','This is our policy. Please read','','','','published','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-08-27 20:16:50'),('e08d6fb6-0e77-4e51-a766-14762ef0806c','834c3486-da40-4f47-8081-463e614a7af4',7,'Privacy Policy','INTRODUCTION\nThis Cancellation Policy outlines the terms and conditions for cancelling orders placed through FreshCounty. We understand that circumstances may change, and we strive to provide flexible options for our customers.\n\nPlease read this policy carefully to understand when and how you can cancel your orders, and any associated fees or restrictions that may apply.\n\nThis policy should be read in conjunction with our Terms of Service and other applicable policies.\n\nORDER CANCELLATION WINDOW\nOrders can be cancelled within 30 minutes of placement, provided the order has not yet been processed for preparation or dispatch. This allows us sufficient time to prevent unnecessary food preparation and waste.\n\nOnce an order enters the preparation phase (typically within 30-60 minutes of placement depending on demand), cancellation may not be possible or may be subject to additional fees.\n\nFor scheduled orders placed in advance, cancellations must be made at least 2 hours before the scheduled preparation time to avoid cancellation fees.\n\nHOW TO CANCEL YOUR ORDER\nTo cancel your order, please contact our customer service team immediately at +234-809-967-748 or email support@freshcounty.com. Please have your order number ready when contacting us.\n\nYou may also cancel your order through your account dashboard if the cancellation window is still open. Look for the \'Cancel Order\' button next to your active orders.\n\nFor urgent cancellation requests, we recommend calling our customer service line directly, as this is the fastest way to process your cancellation request.\n\nCANCELLATION FEES\nOrders cancelled within the free cancellation window (30 minutes) will receive a full refund with no cancellation fees applied.\n\nOrders cancelled after the free window but before preparation begins may be subject to a 10% cancellation fee to cover administrative costs.\n\nOrders cancelled after preparation has begun may be subject to a 25% cancellation fee, or in some cases, the full order amount if the food has already been prepared.\n\nREFUND PROCESSING\nEligible refunds will be processed within 3-5 business days and will be credited back to your original payment method. The exact timing may depend on your bank or payment provider.\n\nFor orders paid with digital wallets or online payment platforms, refunds may be processed faster, typically within 24-48 hours.\n\nWe will send you an email confirmation once your refund has been processed, including details about when you can expect to see the credit in your account.\n\nNON-CANCELLABLE ORDERS\nOrders that have been delivered and received by the customer cannot be cancelled. However, if you have concerns about product quality or other issues, please contact us within 24 hours of delivery.\n\nCustom or specially prepared orders may have different cancellation terms and may not be eligible for cancellation once preparation begins.\n\nOrders placed during peak hours or special promotional periods may have modified cancellation windows due to increased processing times.\n\nFORCE MAJEURE AND SERVICE DISRUPTIONS\nIn cases of unexpected events such as severe weather, natural disasters, or other circumstances beyond our control, we may need to cancel orders on our end. In such cases, full refunds will be provided automatically.\n\nIf we need to cancel your order due to ingredient availability, supplier issues, or operational problems, we will contact you immediately and provide a full refund or offer to reschedule your order.\n\nWe are not liable for any consequential damages or additional costs you may incur due to order cancellations caused by circumstances beyond our control.\n\nSUBSCRIPTION AND RECURRING ORDERS\nFor subscription services or recurring orders, you may cancel your subscription at any time through your account settings or by contacting customer service.\n\nCancellation of subscription services will take effect from the next billing cycle. You will continue to receive scheduled deliveries until the end of your current billing period.\n\nIndividual orders within an active subscription can be skipped or cancelled according to the same terms outlined in this policy, but this will not affect your overall subscription status.\n\nCONTACT INFORMATION\nFor any questions about cancellations, refunds, or this Cancellation Policy, please contact us:\n\nCustomer Service: +234-809-967-748 (Available 7 days a week, 8 AM - 10 PM)\n\nEmail: support@freshcounty.com\n\nLive Chat: Available on our website and mobile app during business hours\n\nOur customer service team is trained to help you with cancellations and will work with you to find the best solution for your situation.','','','','published','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-08 14:29:48'),('ebec0dd8-120f-4260-8b1f-6013ed6aab7e','de1639e8-aae9-49c7-b3e4-835068f0d2e3',4,'Terms of Service','<h2>INTRODUCTION</h2>\nThe Terms of Service outlines the terms and conditions for cancelling orders placed through FreshCounty. We understand that circumstances may change, and we strive to provide flexible options for our customers.\n<br/>\nPlease read this policy carefully to understand when and how you can cancel your orders, and any associated fees or restrictions that may apply.<br/>\n\nThis policy should be read in conjunction with our Terms of Service and other applicable policies.<br/>\n\n<h2>ORDER CANCELLATION WINDOW</h2>\nOrders can be cancelled within 30 minutes of placement, provided the order has not yet been processed for preparation or dispatch. This allows us sufficient time to prevent unnecessary food preparation and waste.<br/>\n\nOnce an order enters the preparation phase (typically within 30-60 minutes of placement, depending on demand), cancellation may not be possible or may incur additional fees. <br/>\n\nFor scheduled orders placed in advance, cancellations must be made at least 2 hours before the planned preparation time to avoid cancellation fees.<br/>\n\n<h2>HOW TO CANCEL YOUR ORDER</h2>\nTo cancel your order, please contact our customer service team immediately at +234-809-967-748 or email support@freshcounty.com. Please have your order number ready when contacting us.<br/>\n\nYou may also cancel your order through your account dashboard if the cancellation window is still open. Look for the \'Cancel Order\' button next to your active orders.<br/>\n\nFor urgent cancellation requests, we recommend calling our customer service line directly, as this is the fastest way to process your cancellation request.<br/>\n\n<h2>CANCELLATION FEES</h2>\nOrders cancelled within the free cancellation window (30 minutes) will receive a full refund with no cancellation fees applied.<br/>\n\nOrders cancelled after the free window but before preparation begins may be subject to a 10% cancellation fee to cover administrative costs.<br/>\n\nOrders cancelled after preparation has begun may be subject to a 25% cancellation fee, or in some cases, the full order amount if the food has already been prepared.<br/>\n\n<h2>REFUND PROCESSING</h2>\nEligible refunds will be processed within 3-5 business days and will be credited back to your original payment method. The exact timing may depend on your bank or payment provider. <br/>\n\nFor orders paid with digital wallets or online payment platforms, refunds may be processed faster, typically within 24-48 hours.<br/>\n\nWe will send you an email confirmation once your refund has been processed, including details about when you can expect to see the credit in your account.<br/>\n\n<h2>NON-CANCELLABLE ORDERS</h2>\nOrders that have been delivered and received by the customer cannot be cancelled. However, if you have concerns about product quality or other issues, please contact us within 24 hours of delivery.<br/>\n\nCustom or specially prepared orders may have different cancellation terms and may not be eligible for cancellation once preparation begins.<br/>\n\nOrders placed during peak hours or special promotional periods may have modified cancellation windows due to increased processing times.<br/>\n\n<h2>FORCE MAJEURE AND SERVICE DISRUPTIONS</h2>\nIn cases of unexpected events such as severe weather, natural disasters, or other circumstances beyond our control, we may need to cancel orders on our end. In such cases, full refunds will be provided automatically.<br/>\n\nIf we need to cancel your order due to ingredient availability, supplier issues, or operational problems, we will contact you immediately and provide a full refund or offer to reschedule your order.<br/>\n\nWe are not liable for any consequential damages or additional costs you may incur due to order cancellations caused by circumstances beyond our control.<br/>\n\n<h2>SUBSCRIPTION AND RECURRING ORDERS</h2>\nFor subscription services or recurring orders, you may cancel your subscription at any time through your account settings or by contacting customer service.<br/>\n\nCancellation of subscription services will take effect from the next billing cycle. You will continue to receive scheduled deliveries until the end of your current billing period.<br/>\n\nIndividual orders within an active subscription can be skipped or cancelled according to the same terms outlined in this policy, but this will not affect your overall subscription status.<br/>\n\n<h2>CONTACT INFORMATION</h2>\nFor any questions about cancellations, refunds, or this Cancellation Policy, please contact us:<br/>\n\nCustomer Service: +234-809-967-748 (Available 7 days a week, 8 AM - 10 PM)<br/>\n\nEmail: support@freshcounty.com<br/>\n\nLive Chat: Available on our website and mobile app during business hours<br/>\n\nOur customer service team is trained to help you with cancellations and will work with you to find the best solution for your situation.','','','','published','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-08 16:18:39'),('ef71930d-a0ce-48ea-8162-c02301c159dd','834c3486-da40-4f47-8081-463e614a7af4',10,'Privacy Policy','<h2>INTRODUCTION</h2>\nThe Privacy Policy outlines the terms and conditions for cancelling orders placed through FreshCounty. We understand that circumstances may change, and we strive to provide flexible options for our customers.\n<br/>\nPlease read this policy carefully to understand when and how you can cancel your orders, and any associated fees or restrictions that may apply.<br/>\n\nThis policy should be read in conjunction with our Terms of Service and other applicable policies.<br/>\n\n<h2>ORDER CANCELLATION WINDOW</h2>\nOrders can be cancelled within 30 minutes of placement, provided the order has not yet been processed for preparation or dispatch. This allows us sufficient time to prevent unnecessary food preparation and waste.<br/>\n\nOnce an order enters the preparation phase (typically within 30-60 minutes of placement, depending on demand), cancellation may not be possible or may incur additional fees. <br/>\n\nFor scheduled orders placed in advance, cancellations must be made at least 2 hours before the planned preparation time to avoid cancellation fees.<br/>\n\n<h2>HOW TO CANCEL YOUR ORDER</h2>\nTo cancel your order, please contact our customer service team immediately at +234-809-967-748 or email support@freshcounty.com. Please have your order number ready when contacting us.<br/>\n\nYou may also cancel your order through your account dashboard if the cancellation window is still open. Look for the \'Cancel Order\' button next to your active orders.<br/>\n\nFor urgent cancellation requests, we recommend calling our customer service line directly, as this is the fastest way to process your cancellation request.<br/>\n\n<h2>CANCELLATION FEES</h2>\nOrders cancelled within the free cancellation window (30 minutes) will receive a full refund with no cancellation fees applied.<br/>\n\nOrders cancelled after the free window but before preparation begins may be subject to a 10% cancellation fee to cover administrative costs.<br/>\n\nOrders cancelled after preparation has begun may be subject to a 25% cancellation fee, or in some cases, the full order amount if the food has already been prepared.<br/>\n\n<h2>REFUND PROCESSING</h2>\nEligible refunds will be processed within 3-5 business days and will be credited back to your original payment method. The exact timing may depend on your bank or payment provider. <br/>\n\nFor orders paid with digital wallets or online payment platforms, refunds may be processed faster, typically within 24-48 hours.<br/>\n\nWe will send you an email confirmation once your refund has been processed, including details about when you can expect to see the credit in your account.<br/>\n\n<h2>NON-CANCELLABLE ORDERS</h2>\nOrders that have been delivered and received by the customer cannot be cancelled. However, if you have concerns about product quality or other issues, please contact us within 24 hours of delivery.<br/>\n\nCustom or specially prepared orders may have different cancellation terms and may not be eligible for cancellation once preparation begins.<br/>\n\nOrders placed during peak hours or special promotional periods may have modified cancellation windows due to increased processing times.<br/>\n\n<h2>FORCE MAJEURE AND SERVICE DISRUPTIONS</h2>\nIn cases of unexpected events such as severe weather, natural disasters, or other circumstances beyond our control, we may need to cancel orders on our end. In such cases, full refunds will be provided automatically.<br/>\n\nIf we need to cancel your order due to ingredient availability, supplier issues, or operational problems, we will contact you immediately and provide a full refund or offer to reschedule your order.<br/>\n\nWe are not liable for any consequential damages or additional costs you may incur due to order cancellations caused by circumstances beyond our control.<br/>\n\n<h2>SUBSCRIPTION AND RECURRING ORDERS</h2>\nFor subscription services or recurring orders, you may cancel your subscription at any time through your account settings or by contacting customer service.<br/>\n\nCancellation of subscription services will take effect from the next billing cycle. You will continue to receive scheduled deliveries until the end of your current billing period.<br/>\n\nIndividual orders within an active subscription can be skipped or cancelled according to the same terms outlined in this policy, but this will not affect your overall subscription status.<br/>\n\n<h2>CONTACT INFORMATION</h2>\nFor any questions about cancellations, refunds, or this Cancellation Policy, please contact us:<br/>\n\nCustomer Service: +234-809-967-748 (Available 7 days a week, 8 AM - 10 PM)<br/>\n\nEmail: support@freshcounty.com<br/>\n\nLive Chat: Available on our website and mobile app during business hours<br/>\n\nOur customer service team is trained to help you with cancellations and will work with you to find the best solution for your situation.','','','','published','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-09-08 16:18:50'),('f6aa5584-b650-4360-bd1b-d5bee156fca3','f1fa9770-f145-43db-a47f-dfe577dec2c0',2,'Cancellation Policy','Cancellation Policy','','','','published','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-08-27 20:16:40'),('fe8ad29e-12ed-4be5-b111-22418f23eb95','de1639e8-aae9-49c7-b3e4-835068f0d2e3',1,'Terms of Service','These are our terms','','','','published','b4f5d6b6-720e-11f0-9e14-dddbb3f09727','2025-08-21 13:05:03');
/*!40000 ALTER TABLE `page_versions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variation_combinations`
--

DROP TABLE IF EXISTS `product_variation_combinations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variation_combinations` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `product_variation_id` varchar(36) NOT NULL,
  `variation_option_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_combination` (`product_variation_id`,`variation_option_id`),
  KEY `variation_option_id` (`variation_option_id`),
  CONSTRAINT `product_variation_combinations_ibfk_1` FOREIGN KEY (`product_variation_id`) REFERENCES `product_variations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_variation_combinations_ibfk_2` FOREIGN KEY (`variation_option_id`) REFERENCES `product_variation_options` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variation_combinations`
--

LOCK TABLES `product_variation_combinations` WRITE;
/*!40000 ALTER TABLE `product_variation_combinations` DISABLE KEYS */;
INSERT INTO `product_variation_combinations` (`id`, `product_variation_id`, `variation_option_id`, `created_at`) VALUES ('69225d52-89e4-11f0-b67e-edb4be9dd75f','69221efa-89e4-11f0-b67e-edb4be9dd75f',16,'2025-09-04 23:10:55'),('6922b9be-89e4-11f0-b67e-edb4be9dd75f','6922a7b2-89e4-11f0-b67e-edb4be9dd75f',17,'2025-09-04 23:10:55'),('8976e2ba-8a5e-11f0-b67e-edb4be9dd75f','8976a1c4-8a5e-11f0-b67e-edb4be9dd75f',18,'2025-09-05 13:45:08'),('8977b74e-8a5e-11f0-b67e-edb4be9dd75f','89777f22-8a5e-11f0-b67e-edb4be9dd75f',19,'2025-09-05 13:45:08'),('fe5bff28-8b05-11f0-b67e-edb4be9dd75f','fe5b7abc-8b05-11f0-b67e-edb4be9dd75f',20,'2025-09-06 09:43:50');
/*!40000 ALTER TABLE `product_variation_combinations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variation_options`
--

DROP TABLE IF EXISTS `product_variation_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variation_options` (
  `id` int NOT NULL AUTO_INCREMENT,
  `variation_type_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `color_hex` varchar(7) DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_option_per_type` (`variation_type_id`,`slug`),
  CONSTRAINT `product_variation_options_ibfk_1` FOREIGN KEY (`variation_type_id`) REFERENCES `product_variation_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variation_options`
--

LOCK TABLES `product_variation_options` WRITE;
/*!40000 ALTER TABLE `product_variation_options` DISABLE KEYS */;
INSERT INTO `product_variation_options` (`id`, `variation_type_id`, `name`, `slug`, `display_name`, `color_hex`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES (1,1,'xs','xs','Extra Small',NULL,1,1,'2025-09-03 22:52:53','2025-09-03 22:52:53'),(2,1,'small','small','Small',NULL,2,1,'2025-09-03 22:52:53','2025-09-03 22:52:53'),(3,1,'medium','medium','Medium',NULL,3,1,'2025-09-03 22:52:53','2025-09-03 22:52:53'),(4,1,'large','large','Large',NULL,4,1,'2025-09-03 22:52:53','2025-09-03 22:52:53'),(5,1,'xl','xl','Extra Large',NULL,5,1,'2025-09-03 22:52:53','2025-09-03 22:52:53'),(6,1,'xxl','xxl','Extra Extra Large',NULL,6,1,'2025-09-03 22:52:53','2025-09-03 22:52:53'),(7,2,'red','red','Red','#FF0000',1,1,'2025-09-03 22:52:53','2025-09-03 22:52:53'),(8,2,'blue','blue','Blue','#0000FF',2,1,'2025-09-03 22:52:53','2025-09-03 22:52:53'),(9,2,'green','green','Green','#008000',3,1,'2025-09-03 22:52:53','2025-09-03 22:52:53'),(10,2,'black','black','Black','#000000',4,1,'2025-09-03 22:52:53','2025-09-03 22:52:53'),(11,2,'white','white','White','#FFFFFF',5,1,'2025-09-03 22:52:53','2025-09-03 22:52:53'),(12,2,'yellow','yellow','Yellow','#FFFF00',6,1,'2025-09-03 22:52:53','2025-09-03 22:52:53'),(16,8,'Medium','medium','Medium',NULL,0,1,'2025-09-04 22:28:09','2025-09-04 22:28:09'),(17,8,'Large','large','Large',NULL,1,1,'2025-09-04 22:28:09','2025-09-04 22:28:09'),(18,9,'Medium','medium','Medium',NULL,0,1,'2025-09-05 13:45:00','2025-09-05 13:45:00'),(19,9,'Large','large','Large',NULL,1,1,'2025-09-05 13:45:00','2025-09-05 13:45:00'),(20,1,'very large','very-large','very large',NULL,0,1,'2025-09-06 09:43:50','2025-09-06 09:43:50');
/*!40000 ALTER TABLE `product_variation_options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variation_types`
--

DROP TABLE IF EXISTS `product_variation_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variation_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `sort_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variation_types`
--

LOCK TABLES `product_variation_types` WRITE;
/*!40000 ALTER TABLE `product_variation_types` DISABLE KEYS */;
INSERT INTO `product_variation_types` (`id`, `name`, `slug`, `display_name`, `description`, `is_active`, `sort_order`, `created_at`, `updated_at`) VALUES (1,'size','size','Size','Product size variations',1,1,'2025-09-03 22:52:53','2025-09-03 22:52:53'),(2,'color','color','Color','Product color variations',1,2,'2025-09-03 22:52:53','2025-09-03 22:52:53'),(3,'material','material','Material','Product material variations',1,3,'2025-09-03 22:52:53','2025-09-03 22:52:53'),(4,'style','style','Style','Product style variations',1,4,'2025-09-03 22:52:53','2025-09-03 22:52:53'),(8,'Cup Size','cup-size','Cup Size',NULL,1,0,'2025-09-04 22:28:09','2025-09-04 22:28:09'),(9,'Jar Size','jar-size','Jar Size',NULL,1,0,'2025-09-05 13:45:00','2025-09-05 13:45:00');
/*!40000 ALTER TABLE `product_variation_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variations`
--

DROP TABLE IF EXISTS `product_variations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variations` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `product_id` varchar(36) NOT NULL,
  `sku` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `sale_price` decimal(10,2) DEFAULT NULL,
  `stock_quantity` int NOT NULL DEFAULT '0',
  `stock_status` enum('in_stock','out_of_stock','low_stock') DEFAULT 'in_stock',
  `weight` decimal(8,2) DEFAULT NULL,
  `dimensions` json DEFAULT NULL,
  `images` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `idx_product_variations_product` (`product_id`),
  KEY `idx_product_variations_sku` (`sku`),
  CONSTRAINT `product_variations_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variations`
--

LOCK TABLES `product_variations` WRITE;
/*!40000 ALTER TABLE `product_variations` DISABLE KEYS */;
INSERT INTO `product_variations` (`id`, `product_id`, `sku`, `price`, `sale_price`, `stock_quantity`, `stock_status`, `weight`, `dimensions`, `images`, `is_active`, `is_default`, `created_at`, `updated_at`) VALUES ('69221efa-89e4-11f0-b67e-edb4be9dd75f','98746c9c-880b-11f0-a1b3-084957d83787','SMO-HIB-383217-CUME-5785',6500.00,NULL,994,'in_stock',NULL,NULL,NULL,1,1,'2025-09-04 23:10:55','2025-09-04 23:10:55'),('6922a7b2-89e4-11f0-b67e-edb4be9dd75f','98746c9c-880b-11f0-a1b3-084957d83787','SMO-HIB-383217-CULA-5790',8000.00,NULL,994,'in_stock',NULL,NULL,NULL,1,0,'2025-09-04 23:10:55','2025-09-04 23:10:55'),('8976a1c4-8a5e-11f0-b67e-edb4be9dd75f','84c51732-8a5e-11f0-b67e-edb4be9dd75f','SMO-CAR-900749-JAME-8628',6000.00,NULL,1000,'in_stock',NULL,NULL,NULL,1,1,'2025-09-05 13:45:08','2025-09-05 13:45:08'),('89777f22-8a5e-11f0-b67e-edb4be9dd75f','84c51732-8a5e-11f0-b67e-edb4be9dd75f','SMO-CAR-900749-JALA-8633',10000.00,NULL,1000,'in_stock',NULL,NULL,NULL,1,0,'2025-09-05 13:45:08','2025-09-05 13:45:08'),('fe5b7abc-8b05-11f0-b67e-edb4be9dd75f','04fa32c0-880c-11f0-a1b3-084957d83787','KEB-KEB-565288--0694',10500.00,NULL,1987,'in_stock',NULL,NULL,NULL,1,1,'2025-09-06 09:43:50','2025-09-06 09:43:50');
/*!40000 ALTER TABLE `product_variations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `description` text,
  `short_description` varchar(500) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `sale_price` decimal(10,2) DEFAULT NULL,
  `discount_price` decimal(10,2) DEFAULT NULL,
  `category_id` varchar(36) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `sku` varchar(100) NOT NULL,
  `stock` int DEFAULT '0',
  `stock_quantity` int DEFAULT '0',
  `stock_status` enum('in_stock','out_of_stock','low_stock') DEFAULT 'in_stock',
  `images` json DEFAULT NULL,
  `featured_image` varchar(255) DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `status` enum('active','inactive','draft') DEFAULT 'active',
  `featured` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_name` (`name`),
  KEY `idx_category` (`category_id`),
  KEY `idx_brand` (`brand`),
  KEY `idx_sku` (`sku`),
  KEY `idx_active` (`is_active`),
  KEY `idx_price` (`price`),
  KEY `idx_status` (`status`),
  KEY `idx_featured` (`featured`),
  KEY `idx_stock_status` (`stock_status`),
  KEY `idx_slug` (`slug`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` (`id`, `name`, `slug`, `description`, `short_description`, `price`, `sale_price`, `discount_price`, `category_id`, `brand`, `sku`, `stock`, `stock_quantity`, `stock_status`, `images`, `featured_image`, `meta_title`, `meta_description`, `is_active`, `status`, `featured`, `created_at`, `updated_at`) VALUES ('04fa32c0-880c-11f0-a1b3-084957d83787','Kebab','kebab','Kebab','Kebab',3500.00,NULL,NULL,'1f1adc81-277d-4820-9cc3-77045222b509',NULL,'KEB-KEB-565288',0,1983,'in_stock','[]','http://localhost:3001/uploads/products/product-1756824551326-494992761-kebab.jpg',NULL,NULL,1,'active',0,'2025-09-02 14:49:25','2025-09-07 21:43:02'),('7db49918-880b-11f0-a1b3-084957d83787','Meatpies','meatpies','Meatpies','Meatpies',2000.00,NULL,NULL,'9daa084a-901a-40ad-bb0d-0e4a7420f374',NULL,'SNA-MEA-338341',0,97,'in_stock','[]','http://localhost:3001/uploads/products/product-1756824315758-908460275-snacks.jpg',NULL,NULL,1,'active',0,'2025-09-02 14:45:38','2025-09-05 23:47:26'),('84c51732-8a5e-11f0-b67e-edb4be9dd75f','Carogin','carogin','Sweet Carogin','Carogin',4000.00,NULL,NULL,'c35a3ce1-c8fd-4055-8e71-8904808411d9',NULL,'SMO-CAR-900749',0,986,'in_stock','[]','http://localhost:3001/uploads/products/product-1757079835766-228632783-Screenshot_2025-09-05_at_1.24.11___pm.png',NULL,NULL,1,'active',0,'2025-09-05 13:45:00','2025-09-07 21:51:09'),('98746c9c-880b-11f0-a1b3-084957d83787','Hibiscus smoothie','hibiscus-smoothie','Hibiscus smoothieeee description','Hibiscus smoothieaaa',5000.00,NULL,NULL,'c35a3ce1-c8fd-4055-8e71-8904808411d9',NULL,'SMO-HIB-383217',0,983,'in_stock','[]','http://localhost:3001/uploads/products/product-1756824370701-362623140-smoothie.jpg',NULL,NULL,1,'active',0,'2025-09-02 14:46:23','2025-09-07 21:51:09'),('aaece6f4-7c64-11f0-a1b3-084957d83787','Orange Juice','orange-juice','Orange Juice','Orange Juice',12000.00,NULL,NULL,'068ba45e-7c2a-11f0-a1b3-084957d83787',NULL,'FRU-ORA-225460',0,87,'in_stock','[]','http://localhost:3001/uploads/products/product-1755551327860-407889430-salad.jpg',NULL,NULL,1,'active',1,'2025-08-18 18:53:45','2025-09-08 01:49:00'),('b7b29bb0-880b-11f0-a1b3-084957d83787','Avocado Salad','avocado-salad','Avocado Salad','Avocado Salad',7500.00,NULL,NULL,'185cef9d-a545-4336-b685-144ae1cf9e50',NULL,'SAL-AVO-435637',0,993,'in_stock','[]','http://localhost:3001/uploads/products/product-1756824424363-318049418-veg.jpg',NULL,NULL,1,'active',0,'2025-09-02 14:47:15','2025-09-08 01:25:06'),('d1db432a-880b-11f0-a1b3-084957d83787','Sweet Macaroons','sweet-macaroons','Sweet Macaroons','Sweet Macaroons',4500.00,NULL,NULL,'2edc97e4-c67d-4965-a43d-52f12df20db9',NULL,'MAC-SWE-479530',0,987,'in_stock','[]','http://localhost:3001/uploads/products/product-1756824457553-380674890-macaroons.jpg',NULL,NULL,1,'active',0,'2025-09-02 14:47:59','2025-09-07 21:43:30'),('prod-bananas','Fresh Bananas (dozen)','fresh-bananas-dozen','Sweet ripe bananas','',6.99,NULL,NULL,'068ba45e-7c2a-11f0-a1b3-084957d83787',NULL,'FRT-001',150,0,'out_of_stock',NULL,NULL,NULL,NULL,1,'inactive',1,'2025-08-18 12:02:58','2025-08-18 13:08:27'),('prod-chicken','Chicken Breast (1kg)','chicken-breast-1kg','Organic chicken breast','',45.99,NULL,NULL,'068ba68e-7c2a-11f0-a1b3-084957d83787',NULL,'MEA-001',25,99,'in_stock',NULL,'http://localhost:3001/uploads/products/product-1755522538180-428054726-gyoghurt.jpg',NULL,NULL,1,'active',1,'2025-08-18 12:02:58','2025-09-03 03:38:45'),('prod-dai-001','Fresh Farm Eggs (12pcs)','fresh-farm-eggs-12pcs','Free-range farm fresh eggs from happy hens. Rich in protein.',NULL,25.99,NULL,NULL,'068ba5a8-7c2a-11f0-a1b3-084957d83787',NULL,'DAI-EGG-001',80,0,'in_stock',NULL,NULL,NULL,NULL,1,'active',0,'2025-08-18 12:02:16','2025-09-02 14:31:43'),('prod-dai-002','Organic Whole Milk (1L)','organic-whole-milk-1l','Fresh organic whole milk from grass-fed cows. Rich and creamy.',NULL,18.99,NULL,NULL,'068ba5a8-7c2a-11f0-a1b3-084957d83787',NULL,'DAI-MIL-002',45,0,'in_stock',NULL,NULL,NULL,NULL,1,'active',0,'2025-08-18 12:02:16','2025-09-02 14:31:43'),('prod-dai-003','Natural Greek Yogurt (500g)','natural-greek-yogurt-500g','Thick creamy Greek yogurt, high in protein and probiotics.',NULL,28.99,NULL,NULL,'068ba5a8-7c2a-11f0-a1b3-084957d83787',NULL,'DAI-YOG-003',35,0,'in_stock',NULL,NULL,NULL,NULL,1,'active',0,'2025-08-18 12:02:16','2025-09-02 14:31:43'),('prod-eggs','Farm Fresh Eggs (12)','farm-fresh-eggs-12','Free-range eggs','',25.99,NULL,NULL,'068ba5a8-7c2a-11f0-a1b3-084957d83787',NULL,'DAI-001',80,80,'in_stock',NULL,'http://localhost:3001/uploads/products/product-1755522552365-81793381-gyoghurt2.jpg',NULL,NULL,1,'inactive',0,'2025-08-18 12:02:58','2025-08-24 17:28:31'),('prod-frt-001','Fresh Bananas (1 dozen)','fresh-bananas-1-dozen','Sweet ripe bananas, rich in potassium. Perfect for breakfast and smoothies.',NULL,6.99,NULL,NULL,'068ba45e-7c2a-11f0-a1b3-084957d83787',NULL,'FRT-BAN-001',150,0,'in_stock',NULL,NULL,NULL,NULL,1,'active',0,'2025-08-18 12:02:16','2025-09-02 14:31:43'),('prod-frt-002','Red Apples (6pcs)','red-apples-6pcs','Crisp red apples, perfect for snacking. High in fiber and vitamins.',NULL,14.99,NULL,NULL,'068ba45e-7c2a-11f0-a1b3-084957d83787',NULL,'FRT-APP-002',200,0,'in_stock',NULL,NULL,NULL,NULL,1,'active',0,'2025-08-18 12:02:16','2025-09-02 14:31:43'),('prod-frt-003','Fresh Oranges (6pcs)','fresh-oranges-6pcs','Juicy oranges packed with vitamin C. Perfect for fresh juice.',NULL,16.99,NULL,NULL,'068ba45e-7c2a-11f0-a1b3-084957d83787',NULL,'FRT-ORA-003',180,0,'in_stock',NULL,NULL,NULL,NULL,1,'active',0,'2025-08-18 12:02:16','2025-09-02 14:31:43'),('prod-frt-004','Strawberries (500g)','strawberries-500g','Sweet fresh strawberries, perfect for desserts and breakfast.',NULL,22.99,NULL,NULL,'068ba45e-7c2a-11f0-a1b3-084957d83787',NULL,'FRT-STR-004',75,0,'in_stock',NULL,NULL,NULL,NULL,1,'active',0,'2025-08-18 12:02:16','2025-09-02 14:31:43'),('prod-gra-001','Organic Brown Rice (2kg)','organic-brown-rice-2kg','Nutritious organic brown rice, whole grain with natural fiber.',NULL,19.99,NULL,NULL,'068ba76a-7c2a-11f0-a1b3-084957d83787',NULL,'GRA-RIC-001',90,0,'in_stock',NULL,NULL,NULL,NULL,1,'active',0,'2025-08-18 12:02:16','2025-09-02 14:31:43'),('prod-gra-002','Steel Cut Oats (1kg)','steel-cut-oats-1kg','Premium steel cut oats, perfect for healthy breakfast bowls.',NULL,16.99,NULL,NULL,'068ba76a-7c2a-11f0-a1b3-084957d83787',NULL,'GRA-OAT-002',65,0,'in_stock',NULL,NULL,NULL,NULL,1,'active',0,'2025-08-18 12:02:16','2025-09-02 14:31:43'),('prod-gra-003','Quinoa Seeds (500g)','quinoa-seeds-500g','Super grain quinoa, high in protein and gluten-free.',NULL,32.99,NULL,NULL,'068ba76a-7c2a-11f0-a1b3-084957d83787',NULL,'GRA-QUI-003',40,0,'in_stock',NULL,NULL,NULL,NULL,1,'active',0,'2025-08-18 12:02:16','2025-09-02 14:31:43'),('prod-mea-001','Organic Chicken Breast (1kg)','organic-chicken-breast-1kg','Premium organic chicken breast, free-range and hormone-free.',NULL,45.99,NULL,NULL,'068ba68e-7c2a-11f0-a1b3-084957d83787',NULL,'MEA-CHI-001',25,0,'in_stock',NULL,NULL,NULL,NULL,1,'inactive',0,'2025-08-18 12:02:16','2025-09-02 14:31:43'),('prod-mea-002','Fresh Fish Fillet (500g)','fresh-fish-fillet-500g','Fresh locally caught fish fillet, perfect for grilling.',NULL,38.99,NULL,NULL,'068ba68e-7c2a-11f0-a1b3-084957d83787',NULL,'MEA-FSH-002',30,0,'in_stock',NULL,NULL,NULL,NULL,1,'active',0,'2025-08-18 12:02:16','2025-09-02 14:31:43'),('prod-mea-003','Grass-Fed Beef (500g)','grass-fed-beef-500g','Premium grass-fed beef, tender and flavorful.',NULL,55.99,NULL,NULL,'068ba68e-7c2a-11f0-a1b3-084957d83787',NULL,'MEA-BEF-003',20,0,'in_stock',NULL,NULL,NULL,NULL,1,'active',0,'2025-08-18 12:02:16','2025-09-02 14:31:43'),('prod-rice','Brown Rice (2kg)','brown-rice-2kg','Organic brown rice',NULL,19.99,NULL,NULL,'068ba76a-7c2a-11f0-a1b3-084957d83787',NULL,'GRA-001',90,0,'in_stock',NULL,NULL,NULL,NULL,1,'active',0,'2025-08-18 12:02:58','2025-09-02 14:31:43'),('prod-spinach','Organic Spinach (500g)','organic-spinach-500g','Fresh organic spinach leaves',NULL,12.99,NULL,NULL,'068b835c-7c2a-11f0-a1b3-084957d83787',NULL,'VEG-001',85,0,'in_stock',NULL,NULL,NULL,NULL,1,'active',0,'2025-08-18 12:02:58','2025-09-02 14:31:43'),('prod-veg-001','Organic Spinach (500g)','organic-spinach-500g-1','Fresh organic spinach leaves, rich in iron and nutrients. Perfect for salads and smoothies.',NULL,12.99,NULL,NULL,'068b835c-7c2a-11f0-a1b3-084957d83787',NULL,'VEG-SPN-001',85,0,'in_stock',NULL,NULL,NULL,NULL,1,'active',0,'2025-08-18 12:02:16','2025-09-02 14:31:43'),('prod-veg-002','Baby Carrots (1kg)','baby-carrots-1kg','Sweet baby carrots, perfect for snacking or cooking. Locally grown and pesticide-free.',NULL,8.99,NULL,NULL,'068b835c-7c2a-11f0-a1b3-084957d83787',NULL,'VEG-CAR-002',120,0,'in_stock',NULL,NULL,NULL,NULL,1,'active',0,'2025-08-18 12:02:16','2025-09-02 14:31:43'),('prod-veg-003','Fresh Kale Bunch','fresh-kale-bunch','Nutrient-dense kale leaves, perfect for healthy smoothies and salads.',NULL,15.99,NULL,NULL,'068b835c-7c2a-11f0-a1b3-084957d83787',NULL,'VEG-KAL-003',60,0,'in_stock',NULL,NULL,NULL,NULL,1,'active',0,'2025-08-18 12:02:16','2025-09-02 14:31:43'),('prod-veg-004','Red Bell Peppers (3pcs)','red-bell-peppers-3pcs','Crisp red bell peppers, perfect for stir-fries and salads.',NULL,18.99,NULL,NULL,'068b835c-7c2a-11f0-a1b3-084957d83787',NULL,'VEG-PEP-004',95,0,'in_stock',NULL,NULL,NULL,NULL,1,'active',0,'2025-08-18 12:02:16','2025-09-02 14:31:43');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `product_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `rating` int NOT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product_review` (`user_id`,`product_id`),
  KEY `idx_product` (`product_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_rating` (`rating`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shipping_zones`
--

DROP TABLE IF EXISTS `shipping_zones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipping_zones` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(100) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_name` (`name`),
  KEY `idx_active` (`is_active`),
  KEY `idx_price` (`price`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipping_zones`
--

LOCK TABLES `shipping_zones` WRITE;
/*!40000 ALTER TABLE `shipping_zones` DISABLE KEYS */;
INSERT INTO `shipping_zones` (`id`, `name`, `description`, `price`, `is_active`, `created_at`, `updated_at`) VALUES ('06a8e93d-6222-425c-aaa1-873c70a35b9e','Yaba','Yaba - Educational and tech hub area',2300.00,1,'2025-09-07 20:55:39','2025-09-07 21:31:32'),('097ae20c-8c28-11f0-b67e-edb4be9dd75f','Victoria Island','Victoria Island, Lagos - Premium business district',2000.00,1,'2025-09-07 20:20:03','2025-09-07 20:20:03'),('097b1a2e-8c28-11f0-b67e-edb4be9dd75f','Lekki Phase 1','Lekki Phase 1 - Residential and commercial area',2500.00,1,'2025-09-07 20:20:03','2025-09-07 20:20:03'),('097b1bfa-8c28-11f0-b67e-edb4be9dd75f','Lekki Phase 2','Lekki Phase 2 - Extended Lekki residential area',3000.00,1,'2025-09-07 20:20:03','2025-09-07 20:20:03'),('097b1c9a-8c28-11f0-b67e-edb4be9dd75f','Ikeja','Ikeja - Lagos commercial hub and airport area',1500.00,1,'2025-09-07 20:20:03','2025-09-07 21:31:13'),('097b1d30-8c28-11f0-b67e-edb4be9dd75f','Maryland','Maryland - Residential area near Ikeja',1800.00,1,'2025-09-07 20:20:03','2025-09-07 21:31:20'),('097b1dc6-8c28-11f0-b67e-edb4be9dd75f','Surulere','Surulere - Central Lagos residential area',1700.00,1,'2025-09-07 20:20:03','2025-09-07 21:31:25'),('097b1eca-8c28-11f0-b67e-edb4be9dd75f','Lagos Island','Lagos Island - Historic commercial center',2200.00,1,'2025-09-07 20:20:03','2025-09-07 20:20:03'),('097b1f56-8c28-11f0-b67e-edb4be9dd75f','Gbagada','Gbagada - Mainland residential area',1900.00,1,'2025-09-07 20:20:03','2025-09-07 20:20:03'),('097b1fce-8c28-11f0-b67e-edb4be9dd75f','Ajah','Ajah - Expanding residential area towards Lekki',3500.00,1,'2025-09-07 20:20:03','2025-09-07 20:20:03'),('097b2046-8c28-11f0-b67e-edb4be9dd75f','Ikoyi','Ikoyi - Upscale residential area',1800.00,1,'2025-09-07 20:20:03','2025-09-07 20:20:03'),('097b20d2-8c28-11f0-b67e-edb4be9dd75f','Apapa','Apapa - Port and industrial area',2500.00,0,'2025-09-07 20:20:03','2025-09-07 20:54:05'),('097b214a-8c28-11f0-b67e-edb4be9dd75f','Festac Town','Festac Town - Large residential estate',2800.00,0,'2025-09-07 20:20:03','2025-09-07 20:53:58'),('097b21fe-8c28-11f0-b67e-edb4be9dd75f','Isolo','Isolo - Airport vicinity residential area',2000.00,0,'2025-09-07 20:20:03','2025-09-07 20:53:43'),('097b2280-8c28-11f0-b67e-edb4be9dd75f','Ogba','Ogba - Mainland residential and commercial area',2100.00,0,'2025-09-07 20:20:03','2025-09-07 20:53:29');
/*!40000 ALTER TABLE `shipping_zones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `setting_key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` text COLLATE utf8mb4_unicode_ci,
  `description` text COLLATE utf8mb4_unicode_ci,
  `category` enum('general','tax_shipping','email','security','payment','blog') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  `data_type` enum('text','number','email','select','boolean') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'text',
  `options` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`),
  KEY `idx_category` (`category`),
  KEY `idx_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `description`, `category`, `data_type`, `options`, `created_at`, `updated_at`) VALUES ('26319030-7cf6-11f0-a1b3-084957d83787','site_name','Fresh County','Site name displayed throughout the application','general','text',NULL,'2025-08-19 12:15:09','2025-09-08 13:15:32'),('26323ac6-7cf6-11f0-a1b3-084957d83787','currency','NGN','Default currency for the application','general','select','[\"NGN\", \"USD\", \"EUR\"]','2025-08-19 12:15:09','2025-09-08 13:15:32'),('26323e04-7cf6-11f0-a1b3-084957d83787','timezone','Africa/Lagos','Default timezone for the application','general','select','[\"Africa/Lagos\", \"UTC\", \"America/New_York\"]','2025-08-19 12:15:09','2025-09-08 13:15:32'),('26323f80-7cf6-11f0-a1b3-084957d83787','tax_rate','7.5','Default tax rate percentage','tax_shipping','number',NULL,'2025-08-19 12:15:09','2025-09-08 13:15:32'),('26324926-7cf6-11f0-a1b3-084957d83787','shipping_cost_standard','4500','Standard shipping cost','tax_shipping','number',NULL,'2025-08-19 12:15:09','2025-09-06 09:57:32'),('26324a98-7cf6-11f0-a1b3-084957d83787','free_shipping_threshold','50000','Minimum order value for free shipping','tax_shipping','number',NULL,'2025-08-19 12:15:09','2025-09-08 13:15:32'),('26324b9c-7cf6-11f0-a1b3-084957d83787','admin_email','info@freshcounty.ng','Primary admin email address','email','email',NULL,'2025-08-19 12:15:09','2025-09-08 13:15:32'),('26324c8c-7cf6-11f0-a1b3-084957d83787','support_email','support@freshcounty.ng','Customer support email address','email','email',NULL,'2025-08-19 12:15:09','2025-09-08 13:15:32'),('26325394-7cf6-11f0-a1b3-084957d83787','smtp_host','sandbox.smtp.mailtrap.io','SMTP server hostname','email','text',NULL,'2025-08-19 12:15:09','2025-09-08 13:15:32'),('263254d4-7cf6-11f0-a1b3-084957d83787','smtp_port','587','SMTP server port','email','number',NULL,'2025-08-19 12:15:09','2025-09-08 13:15:32'),('26325614-7cf6-11f0-a1b3-084957d83787','smtp_username','a22dc16e59ecfe','SMTP server username','email','text',NULL,'2025-08-19 12:15:09','2025-09-08 13:15:32'),('2632570e-7cf6-11f0-a1b3-084957d83787','password_min_length','8','Minimum password length requirement','security','number',NULL,'2025-08-19 12:15:09','2025-09-08 13:15:32'),('2632581c-7cf6-11f0-a1b3-084957d83787','session_timeout','60','Session timeout in minutes','security','number',NULL,'2025-08-19 12:15:09','2025-09-08 13:15:32'),('26325952-7cf6-11f0-a1b3-084957d83787','max_login_attempts','5','Maximum login attempts before lockout','security','number',NULL,'2025-08-19 12:15:09','2025-09-08 13:15:32'),('26325a38-7cf6-11f0-a1b3-084957d83787','paystack_public_key','','Paystack public key for payments','payment','text',NULL,'2025-08-19 12:15:09','2025-09-08 13:15:32'),('26325b28-7cf6-11f0-a1b3-084957d83787','paystack_secret_key','','Paystack secret key for payments','payment','text',NULL,'2025-08-19 12:15:09','2025-09-08 13:15:32'),('26325c18-7cf6-11f0-a1b3-084957d83787','payment_methods_enabled','bank_transfer','Enabled payment methods','payment','text',NULL,'2025-08-19 12:15:09','2025-09-08 13:15:32'),('3de57dc2-8c55-11f0-b67e-edb4be9dd75f','under_construction_mode','false','Enable to show maintenance page to visitors while keeping admin access','general','boolean',NULL,'2025-09-08 01:43:38','2025-09-08 13:15:32'),('5f0d1714-8ce4-11f0-b67e-edb4be9dd75f','blog_page_title','BLOG LISTS','Title displayed on the main blog page','blog','text',NULL,'2025-09-08 18:48:12','2025-09-08 19:27:50'),('5f0d86d6-8ce4-11f0-b67e-edb4be9dd75f','blog_page_subtitle','Get the latest info on our products and healthy options','Subtitle displayed on the main blog page','blog','text',NULL,'2025-09-08 18:48:12','2025-09-08 19:27:50'),('81bbe6a0-7d12-11f0-a1b3-084957d83787','smtp_password','3155ca4c1db620','SMTP server password for email authentication','email','text',NULL,'2025-08-19 15:38:08','2025-09-08 13:15:32'),('8263828a-8752-11f0-a1b3-084957d83787','bank_name','Moniepoint','Name of the bank where Fresh County business account is held','payment','text',NULL,'2025-09-01 16:41:29','2025-09-08 13:15:32'),('82660e24-8752-11f0-a1b3-084957d83787','account_number','9041236007','Fresh County business account number for customer payments','payment','text',NULL,'2025-09-01 16:41:29','2025-09-08 13:15:32'),('826642f4-8752-11f0-a1b3-084957d83787','account_name','Fresh County Nigeria Limited','Account holder name for the business bank account','payment','text',NULL,'2025-09-01 16:41:29','2025-09-08 13:15:32');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `role` enum('customer','staff','manager','admin') DEFAULT 'customer',
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `zip_code` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_active` tinyint(1) DEFAULT '1',
  `password_reset_token` varchar(255) DEFAULT NULL,
  `password_reset_expires` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`id`, `email`, `password`, `first_name`, `last_name`, `role`, `phone`, `address`, `city`, `state`, `country`, `zip_code`, `created_at`, `updated_at`, `is_active`, `password_reset_token`, `password_reset_expires`) VALUES ('0217bffe-8bdc-11f0-b67e-edb4be9dd75f','marikosama@outlook.com','$2b$12$fuKbFiCO8t1FH5MVhlH/V.KJj5NQnqhfNLcteog/fYrLahaWLN1Si','Mariko','Sama','customer','+2347045556709','Block 112 plot 25 Adebisi Oguniyi Crescent','Lekki','Lagos','Nigeria','105102','2025-09-07 11:15:49','2025-09-07 11:28:15',1,NULL,NULL),('163d4fa0-53bd-4f8c-924c-32deb0e9eebf','erhunabbe@gmail.com','$2b$12$/r8IG4spqHbnz7EPDcmmyO9hphmFeqdmWRhnV1cAOxi00oYy6uA8e','Erhun','Abbe','admin','07037138919',NULL,NULL,NULL,NULL,NULL,'2025-08-18 21:59:47','2025-09-07 14:05:14',1,NULL,NULL),('5fde4ff3-1248-4a9f-9d78-6c54298aa535','erickaser@gmail.com','$2b$12$hKCduIa/f7eU12oDyGm3hO/you8yxf6GL2UpXaRWKGHcqw7Av4utu','Eric','Kaser','customer','+2349834568939','Block 19 Ralph J Karienren Crescent Lekki Scheme 2','Lekki','Lagos','Nigeria','105102','2025-08-28 09:49:59','2025-08-31 23:44:46',1,NULL,NULL),('9f9bfeac-8407-11f0-a1b3-084957d83787','uyiabbe@gmail.com','$2b$12$GAukvnbOUkXnrIGM.kgnTOGTnx8smIbKgsh9lmY08Z38cMuRZm.lm','Uyi','Abbe','staff','+2347678986543','Block 112 plot 25 Adebisi Oguniyi Crescent','Lekki','Lagos','Nigeria','105102','2025-08-28 12:07:52','2025-09-06 09:29:45',1,NULL,NULL),('b4f5d6b6-720e-11f0-9e14-dddbb3f09727','admin@example.com','$2b$12$vKqN5JcF6OC9qd1xWrI.qua7NSKxw3mfJ88Gv3i41sC2UM8piOao2','Admin','User','admin','09088877765',NULL,NULL,NULL,NULL,NULL,'2025-08-05 15:13:13','2025-09-02 22:42:02',1,NULL,NULL),('cust-001','alice@test.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LxJ5PxAb.7xWvGp6q','Alice','Johnson','customer',NULL,NULL,NULL,NULL,NULL,NULL,'2025-08-18 11:58:23','2025-08-18 23:32:02',1,NULL,NULL),('cust-002','bob@test.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LxJ5PxAb.7xWvGp6q','Bob','Smith','customer',NULL,NULL,NULL,NULL,NULL,NULL,'2025-08-18 11:58:23','2025-08-18 11:58:23',1,NULL,NULL),('cust-003','carol@test.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LxJ5PxAb.7xWvGp6q','Carol','Davis','customer',NULL,NULL,NULL,NULL,NULL,NULL,'2025-08-18 11:58:23','2025-08-18 11:58:23',1,NULL,NULL),('cust-004','dave@test.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LxJ5PxAb.7xWvGp6q','Dave','Wilson','customer',NULL,NULL,NULL,NULL,NULL,NULL,'2025-08-18 11:58:23','2025-08-18 11:58:23',1,NULL,NULL),('cust-005','eva@test.com','$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LxJ5PxAb.7xWvGp6q','Eva','Brown','customer',NULL,NULL,NULL,NULL,NULL,NULL,'2025-08-18 11:58:23','2025-08-18 11:58:23',1,NULL,NULL),('de7f1e23-a9a8-4c3b-a996-22fa854cbfc0','iamerhun@gmail.com','$2b$12$IB96HaFppjXOvRHCQC4Ezuj1UePXo/Cs7ESu1RdPA/NQCyLL0vR5y','Jennifer','Bond','manager',NULL,NULL,NULL,NULL,NULL,NULL,'2025-08-18 21:58:59','2025-08-22 15:51:40',1,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `website_pages`
--

DROP TABLE IF EXISTS `website_pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `website_pages` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `page_type` enum('faq','privacy_policy','terms_of_service','about_us','contact','shipping_policy','return_policy','custom') NOT NULL DEFAULT 'custom',
  `content` longtext NOT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text,
  `meta_keywords` text,
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
  `is_featured` tinyint(1) DEFAULT '0',
  `display_order` int DEFAULT '0',
  `template` varchar(100) DEFAULT 'default',
  `created_by` varchar(36) NOT NULL,
  `updated_by` varchar(36) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_slug` (`slug`),
  KEY `idx_page_type` (`page_type`),
  KEY `idx_status` (`status`),
  KEY `idx_display_order` (`display_order`),
  KEY `idx_created_at` (`created_at`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `website_pages_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `website_pages_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `website_pages`
--

LOCK TABLES `website_pages` WRITE;
/*!40000 ALTER TABLE `website_pages` DISABLE KEYS */;
INSERT INTO `website_pages` (`id`, `title`, `slug`, `page_type`, `content`, `meta_title`, `meta_description`, `meta_keywords`, `status`, `is_featured`, `display_order`, `template`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES ('834c3486-da40-4f47-8081-463e614a7af4','Privacy Policy','privacy-policy','privacy_policy','<h2>INTRODUCTION</h2>\nThe Privacy Policy outlines the terms and conditions for cancelling orders placed through FreshCounty. We understand that circumstances may change, and we strive to provide flexible options for our customers.\n<br/>\nPlease read this policy carefully to understand when and how you can cancel your orders, and any associated fees or restrictions that may apply.<br/>\n\nThis policy should be read in conjunction with our Terms of Service and other applicable policies.<br/>\n\n<h2>ORDER CANCELLATION WINDOW</h2>\nOrders can be cancelled within 30 minutes of placement, provided the order has not yet been processed for preparation or dispatch. This allows us sufficient time to prevent unnecessary food preparation and waste.<br/>\n\nOnce an order enters the preparation phase (typically within 30-60 minutes of placement, depending on demand), cancellation may not be possible or may incur additional fees. <br/>\n\nFor scheduled orders placed in advance, cancellations must be made at least 2 hours before the planned preparation time to avoid cancellation fees.<br/>\n\n<h2>HOW TO CANCEL YOUR ORDER</h2>\nTo cancel your order, please contact our customer service team immediately at +234-809-967-748 or email support@freshcounty.com. Please have your order number ready when contacting us.<br/>\n\nYou may also cancel your order through your account dashboard if the cancellation window is still open. Look for the \'Cancel Order\' button next to your active orders.<br/>\n\nFor urgent cancellation requests, we recommend calling our customer service line directly, as this is the fastest way to process your cancellation request.<br/>\n\n<h2>CANCELLATION FEES</h2>\nOrders cancelled within the free cancellation window (30 minutes) will receive a full refund with no cancellation fees applied.<br/>\n\nOrders cancelled after the free window but before preparation begins may be subject to a 10% cancellation fee to cover administrative costs.<br/>\n\nOrders cancelled after preparation has begun may be subject to a 25% cancellation fee, or in some cases, the full order amount if the food has already been prepared.<br/>\n\n<h2>REFUND PROCESSING</h2>\nEligible refunds will be processed within 3-5 business days and will be credited back to your original payment method. The exact timing may depend on your bank or payment provider. <br/>\n\nFor orders paid with digital wallets or online payment platforms, refunds may be processed faster, typically within 24-48 hours.<br/>\n\nWe will send you an email confirmation once your refund has been processed, including details about when you can expect to see the credit in your account.<br/>\n\n<h2>NON-CANCELLABLE ORDERS</h2>\nOrders that have been delivered and received by the customer cannot be cancelled. However, if you have concerns about product quality or other issues, please contact us within 24 hours of delivery.<br/>\n\nCustom or specially prepared orders may have different cancellation terms and may not be eligible for cancellation once preparation begins.<br/>\n\nOrders placed during peak hours or special promotional periods may have modified cancellation windows due to increased processing times.<br/>\n\n<h2>FORCE MAJEURE AND SERVICE DISRUPTIONS</h2>\nIn cases of unexpected events such as severe weather, natural disasters, or other circumstances beyond our control, we may need to cancel orders on our end. In such cases, full refunds will be provided automatically.<br/>\n\nIf we need to cancel your order due to ingredient availability, supplier issues, or operational problems, we will contact you immediately and provide a full refund or offer to reschedule your order.<br/>\n\nWe are not liable for any consequential damages or additional costs you may incur due to order cancellations caused by circumstances beyond our control.<br/>\n\n<h2>SUBSCRIPTION AND RECURRING ORDERS</h2>\nFor subscription services or recurring orders, you may cancel your subscription at any time through your account settings or by contacting customer service.<br/>\n\nCancellation of subscription services will take effect from the next billing cycle. You will continue to receive scheduled deliveries until the end of your current billing period.<br/>\n\nIndividual orders within an active subscription can be skipped or cancelled according to the same terms outlined in this policy, but this will not affect your overall subscription status.<br/>\n\n<h2>CONTACT INFORMATION</h2>\nFor any questions about cancellations, refunds, or this Cancellation Policy, please contact us:<br/>\n\nCustomer Service: +234-809-967-748 (Available 7 days a week, 8 AM - 10 PM)<br/>\n\nEmail: support@freshcounty.com<br/>\n\nLive Chat: Available on our website and mobile app during business hours<br/>\n\nOur customer service team is trained to help you with cancellations and will work with you to find the best solution for your situation.','','','','published',0,0,'default','b4f5d6b6-720e-11f0-9e14-dddbb3f09727','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-08-21 13:03:44','2025-09-08 16:18:50'),('de1639e8-aae9-49c7-b3e4-835068f0d2e3','Terms of Service','terms','terms_of_service','<h2>INTRODUCTION</h2>\nThe Terms of Service outlines the terms and conditions for cancelling orders placed through FreshCounty. We understand that circumstances may change, and we strive to provide flexible options for our customers.\n<br/>\nPlease read this policy carefully to understand when and how you can cancel your orders, and any associated fees or restrictions that may apply.<br/>\n\nThis policy should be read in conjunction with our Terms of Service and other applicable policies.<br/>\n\n<h2>ORDER CANCELLATION WINDOW</h2>\nOrders can be cancelled within 30 minutes of placement, provided the order has not yet been processed for preparation or dispatch. This allows us sufficient time to prevent unnecessary food preparation and waste.<br/>\n\nOnce an order enters the preparation phase (typically within 30-60 minutes of placement, depending on demand), cancellation may not be possible or may incur additional fees. <br/>\n\nFor scheduled orders placed in advance, cancellations must be made at least 2 hours before the planned preparation time to avoid cancellation fees.<br/>\n\n<h2>HOW TO CANCEL YOUR ORDER</h2>\nTo cancel your order, please contact our customer service team immediately at +234-809-967-748 or email support@freshcounty.com. Please have your order number ready when contacting us.<br/>\n\nYou may also cancel your order through your account dashboard if the cancellation window is still open. Look for the \'Cancel Order\' button next to your active orders.<br/>\n\nFor urgent cancellation requests, we recommend calling our customer service line directly, as this is the fastest way to process your cancellation request.<br/>\n\n<h2>CANCELLATION FEES</h2>\nOrders cancelled within the free cancellation window (30 minutes) will receive a full refund with no cancellation fees applied.<br/>\n\nOrders cancelled after the free window but before preparation begins may be subject to a 10% cancellation fee to cover administrative costs.<br/>\n\nOrders cancelled after preparation has begun may be subject to a 25% cancellation fee, or in some cases, the full order amount if the food has already been prepared.<br/>\n\n<h2>REFUND PROCESSING</h2>\nEligible refunds will be processed within 3-5 business days and will be credited back to your original payment method. The exact timing may depend on your bank or payment provider. <br/>\n\nFor orders paid with digital wallets or online payment platforms, refunds may be processed faster, typically within 24-48 hours.<br/>\n\nWe will send you an email confirmation once your refund has been processed, including details about when you can expect to see the credit in your account.<br/>\n\n<h2>NON-CANCELLABLE ORDERS</h2>\nOrders that have been delivered and received by the customer cannot be cancelled. However, if you have concerns about product quality or other issues, please contact us within 24 hours of delivery.<br/>\n\nCustom or specially prepared orders may have different cancellation terms and may not be eligible for cancellation once preparation begins.<br/>\n\nOrders placed during peak hours or special promotional periods may have modified cancellation windows due to increased processing times.<br/>\n\n<h2>FORCE MAJEURE AND SERVICE DISRUPTIONS</h2>\nIn cases of unexpected events such as severe weather, natural disasters, or other circumstances beyond our control, we may need to cancel orders on our end. In such cases, full refunds will be provided automatically.<br/>\n\nIf we need to cancel your order due to ingredient availability, supplier issues, or operational problems, we will contact you immediately and provide a full refund or offer to reschedule your order.<br/>\n\nWe are not liable for any consequential damages or additional costs you may incur due to order cancellations caused by circumstances beyond our control.<br/>\n\n<h2>SUBSCRIPTION AND RECURRING ORDERS</h2>\nFor subscription services or recurring orders, you may cancel your subscription at any time through your account settings or by contacting customer service.<br/>\n\nCancellation of subscription services will take effect from the next billing cycle. You will continue to receive scheduled deliveries until the end of your current billing period.<br/>\n\nIndividual orders within an active subscription can be skipped or cancelled according to the same terms outlined in this policy, but this will not affect your overall subscription status.<br/>\n\n<h2>CONTACT INFORMATION</h2>\nFor any questions about cancellations, refunds, or this Cancellation Policy, please contact us:<br/>\n\nCustomer Service: +234-809-967-748 (Available 7 days a week, 8 AM - 10 PM)<br/>\n\nEmail: support@freshcounty.com<br/>\n\nLive Chat: Available on our website and mobile app during business hours<br/>\n\nOur customer service team is trained to help you with cancellations and will work with you to find the best solution for your situation.','','','','published',0,0,'default','b4f5d6b6-720e-11f0-9e14-dddbb3f09727','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-08-21 13:05:03','2025-09-08 16:18:39'),('f1fa9770-f145-43db-a47f-dfe577dec2c0','Cancellation Policy','cancellation-policy','terms_of_service','<h2>INTRODUCTION</h2>\nThe Cancellation Policy outlines the terms and conditions for cancelling orders placed through FreshCounty. We understand that circumstances may change, and we strive to provide flexible options for our customers.\n<br/>\nPlease read this policy carefully to understand when and how you can cancel your orders, and any associated fees or restrictions that may apply.<br/>\n\nThis policy should be read in conjunction with our Terms of Service and other applicable policies.<br/>\n\n<h2>ORDER CANCELLATION WINDOW</h2>\nOrders can be cancelled within 30 minutes of placement, provided the order has not yet been processed for preparation or dispatch. This allows us sufficient time to prevent unnecessary food preparation and waste.<br/>\n\nOnce an order enters the preparation phase (typically within 30-60 minutes of placement, depending on demand), cancellation may not be possible or may incur additional fees. <br/>\n\nFor scheduled orders placed in advance, cancellations must be made at least 2 hours before the planned preparation time to avoid cancellation fees.<br/>\n\n<h2>HOW TO CANCEL YOUR ORDER</h2>\nTo cancel your order, please contact our customer service team immediately at +234-809-967-748 or email support@freshcounty.com. Please have your order number ready when contacting us.<br/>\n\nYou may also cancel your order through your account dashboard if the cancellation window is still open. Look for the \'Cancel Order\' button next to your active orders.<br/>\n\nFor urgent cancellation requests, we recommend calling our customer service line directly, as this is the fastest way to process your cancellation request.<br/>\n\n<h2>CANCELLATION FEES</h2>\nOrders cancelled within the free cancellation window (30 minutes) will receive a full refund with no cancellation fees applied.<br/>\n\nOrders cancelled after the free window but before preparation begins may be subject to a 10% cancellation fee to cover administrative costs.<br/>\n\nOrders cancelled after preparation has begun may be subject to a 25% cancellation fee, or in some cases, the full order amount if the food has already been prepared.<br/>\n\n<h2>REFUND PROCESSING</h2>\nEligible refunds will be processed within 3-5 business days and will be credited back to your original payment method. The exact timing may depend on your bank or payment provider. <br/>\n\nFor orders paid with digital wallets or online payment platforms, refunds may be processed faster, typically within 24-48 hours.<br/>\n\nWe will send you an email confirmation once your refund has been processed, including details about when you can expect to see the credit in your account.<br/>\n\n<h2>NON-CANCELLABLE ORDERS</h2>\nOrders that have been delivered and received by the customer cannot be cancelled. However, if you have concerns about product quality or other issues, please contact us within 24 hours of delivery.<br/>\n\nCustom or specially prepared orders may have different cancellation terms and may not be eligible for cancellation once preparation begins.<br/>\n\nOrders placed during peak hours or special promotional periods may have modified cancellation windows due to increased processing times.<br/>\n\n<h2>FORCE MAJEURE AND SERVICE DISRUPTIONS</h2>\nIn cases of unexpected events such as severe weather, natural disasters, or other circumstances beyond our control, we may need to cancel orders on our end. In such cases, full refunds will be provided automatically.<br/>\n\nIf we need to cancel your order due to ingredient availability, supplier issues, or operational problems, we will contact you immediately and provide a full refund or offer to reschedule your order.<br/>\n\nWe are not liable for any consequential damages or additional costs you may incur due to order cancellations caused by circumstances beyond our control.<br/>\n\n<h2>SUBSCRIPTION AND RECURRING ORDERS</h2>\nFor subscription services or recurring orders, you may cancel your subscription at any time through your account settings or by contacting customer service.<br/>\n\nCancellation of subscription services will take effect from the next billing cycle. You will continue to receive scheduled deliveries until the end of your current billing period.<br/>\n\nIndividual orders within an active subscription can be skipped or cancelled according to the same terms outlined in this policy, but this will not affect your overall subscription status.<br/>\n\n<h2>CONTACT INFORMATION</h2>\nFor any questions about cancellations, refunds, or this Cancellation Policy, please contact us:<br/>\n\nCustomer Service: +234-809-967-748 (Available 7 days a week, 8 AM - 10 PM)<br/>\n\nEmail: support@freshcounty.com<br/>\n\nLive Chat: Available on our website and mobile app during business hours<br/>\n\nOur customer service team is trained to help you with cancellations and will work with you to find the best solution for your situation.','','','','published',0,0,'default','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','163d4fa0-53bd-4f8c-924c-32deb0e9eebf','2025-08-27 20:16:35','2025-09-08 16:16:41');
/*!40000 ALTER TABLE `website_pages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'ecommerce_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-10  8:48:52
