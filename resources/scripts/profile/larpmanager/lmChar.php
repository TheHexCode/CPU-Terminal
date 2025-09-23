<?php

require('../db/dbConnect.php');
require('../db/setUser.php');

$lmEmail = $_POST["lmEmail"];
$lmPass = $_POST["lmPass"];
$lmCharID = $_POST["lmCharID"];
$lmCharName = $_POST["lmCharName"];

$dbCharQuery = "SELECT * FROM {$dbName}.users
                WHERE lm_id = :lmID;";

$dbCharStatement = $pdo->prepare($dbCharQuery);
$dbCharStatement->execute([':lmID' => $lmCharID]);

$dbCharResponse = $dbCharStatement->fetch(PDO::FETCH_ASSOC);

if($dbCharResponse === false)
{
    /*
    $userCode = generateCode($pdo, $dbName);

    addUser($pdo,$dbName,$mlCharID, $userCode,$mlCharName);

    $dbCharStatement = $pdo->prepare($dbCharQuery);
    $dbCharStatement->execute([':mlID' => $mlCharID]);

    $dbCharResponse = $dbCharStatement->fetch(PDO::FETCH_ASSOC);
    */
}
else
{    
    $userCode = $dbCharResponse["userCode"];

    //updateUser($pdo,$dbName,$dbCharResponse["ml_id"],$mlCharName);
}

// FUNCTIONS
// ROLES
// ITEMS

echo json_encode(array(  "id" => $dbCharResponse["lm_id"],
                                "name" => $mlCharName,
                                "userCode" => $userCode,
                                //"origin" => $dbCharResponse["origin"],
                                //"functions" => $functionResponse,
                                //"discoveries" => $discoResponse,
                                //"roles" => $roleResponse,
                                /*"items" => $itemResponse*/ ));