<?php

require('dbConfig/dbConfig.php');

$dbName = DBNAME;
$pdo = new PDO('mysql: host='.DBHOST.';port=3306;dbname='.DBNAME,DBUSER,DBPWD);