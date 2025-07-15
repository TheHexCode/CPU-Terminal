<?php
require('dbConnect.php');

$userID = $_POST["userID"];
$functions = $_POST["userFunctions"];

$deleteQuery = "DELETE FROM {$dbName}.user_functions
                WHERE user_id = :userID";

$deleteStatement = $pdo->prepare($deleteQuery);
$deleteStatement->execute([':userID' => $userID]);


