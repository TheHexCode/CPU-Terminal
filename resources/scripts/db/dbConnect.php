<?php

require('dbConfig/dbConfig.php');

$dbName = 'dbiykpinec1m8s';
$pdo = new PDO('mysql: host='.DBHOST.';port=3306;dbname='.DBNAME,DBUSER,DBPWD);