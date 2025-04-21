<?php
require('dbConnect.php');

$termID = $_POST["termID"];
$userID = $_POST["userID"];
$userMask = $_POST["userMask"];

$newLogQuery = "INSERT INTO CPU_Terminal.dbo.accessLogs
                    (terminal_id, user_id, mask, state)
                VALUES (:termID, :userID, :mask, 'initial')";

$newLogStatement = $pdo->prepare($newLogQuery);

$newLogStatement->execute([':termID' => $termID, ':userID' => $userID, ':mask' => ($userMask === "false" ? NULL : $userMask)]);
$newLogID = $pdo->lastInsertId();

echo $newLogID;