CREATE TABLE `aliases` (
  `id` int(11) NOT NULL,
  `mail_from` varchar(200) NOT NULL,
  `mail_to` mediumtext,
  `is_on` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `aliases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mail_from` (`mail_from`);