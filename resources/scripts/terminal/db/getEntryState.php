<?php

require('dbConnect.php');

$entryID = $_GET["id"];

$entryQuery = "SELECT * FROM {$dbName}.sim_entries
                WHERE id=:entryID";

$entryStatement = $pdo->prepare($entryQuery);
$entryStatement->execute([':entryID' => $entryID]);
$entry = $entryStatement->fetch(PDO::FETCH_ASSOC);

echo json_encode($entry);