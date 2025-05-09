<?php

require('dbConfig/dbConfig.php');

$pdo = new PDO('mysql: host='.DBHOST.';port=3306;dbname='.DBNAME,DBUSER,DBPWD);