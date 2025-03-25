<?php

include('E:/Personal/Projects/CPU/dbConfig/dbConfig.php');

$pdo = new PDO('sqlsrv:Server='.DBHOST.',1433;Database='.DBNAME, DBUSER,DBPWD);