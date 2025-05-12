<?php

require('../../resources/scripts/db/dbConnect.php');

$newCode = htmlentities(trim($_POST["newCode"]));

$codeQuery = "  UPDATE {$dbName}.activeJob
                SET jobCode=:newCode";

$codeStatement = $pdo->prepare($codeQuery);
$codeStatement->execute([':newCode' => $newCode]);

echo json_encode("Success!");