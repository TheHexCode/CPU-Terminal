<?php

include('E:/Personal/Projects/CPU/dbConfig/dbConfig.php');

$userCode = $_POST["userCode"];

$pdo = new PDO('sqlsrv:Server='.DBHOST.',1433;Database='.DBNAME, DBUSER,DBPWD);

$userQuery = 'SELECT * FROM CPU_Terminal.dbo.users WHERE userCode = :userCode';

$userStatement = $pdo->prepare($userQuery);
$userStatement->execute([':userCode' => $userCode]);
$userResponse = $userStatement->fetchAll();