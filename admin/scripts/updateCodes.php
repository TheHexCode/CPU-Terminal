<?php

require('../../resources/scripts/terminal/db/dbConnect.php');

$newSimCode = htmlentities(trim($_POST["newSim"]));
$newJobCode = htmlentities(trim($_POST["newJob"]));

$codeQuery = "  UPDATE {$dbName}.sim_active_codes
                SET simCode=:newSim,
                    jobCode=:newJob";

$codeStatement = $pdo->prepare($codeQuery);
$codeStatement->execute([':newSim' => strtoupper($newSimCode), ':newJob' => strtoupper($newJobCode)]);

echo json_encode("Success!");