<?php

require('../../resources/scripts/terminal/db/dbConnect.php');

$newCode = htmlentities(trim($_POST["newCode"]));

$codeQuery = "  UPDATE {$dbName}.sim_active_codes
                SET jobCode=:newCode";

$codeStatement = $pdo->prepare($codeQuery);
$codeStatement->execute([':newCode' => strtoupper($newCode)]);

echo json_encode("Success!");