<?php
require('dbConnect.php');

$termID = $_POST["termID"];
$userID = $_POST["userID"];
$userMask = $_POST["userMask"];
$userTags = $_POST["userTags"];

$newLogQuery = "INSERT INTO {$dbName}.accessLogs
                    (terminal_id, user_id, mask, state, tags)
                VALUES (:termID, :userID, :mask, 'initial', :userTags)";

$newLogStatement = $pdo->prepare($newLogQuery);

$newLogStatement->execute([':termID' => $termID, ':userID' => $userID, ':mask' => ($userMask === "false" ? NULL : $userMask), ':userTags' => $userTags]);
$newLogID = $pdo->lastInsertId();

echo $newLogID;