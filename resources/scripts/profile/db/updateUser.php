<?php
require('dbConnect.php');

$userID = $_POST["userID"];
$userOrigin = $_POST["userOrigin"];
$functionArray = $_POST["userFunctions"];
$itemArray = $_POST["userItems"] ?? array();

#############################################################################################################################

$originQuery = "UPDATE {$dbName}.users
                SET origin = :originID
                WHERE ml_id = :userID";

$originStatement = $pdo->prepare($originQuery);
$originStatement->execute([':originID' => intval($userOrigin), ':userID' => $userID]);

#############################################################################################################################

$deleteFuncQuery = "DELETE FROM {$dbName}.user_functions
                    WHERE user_id = :userID";

$deleteFuncStatement = $pdo->prepare($deleteFuncQuery);
$deleteFuncStatement->execute([':userID' => $userID]);

$userFuncArray = array();

foreach($functionArray as $function)
{
    array_push($userFuncArray,$userID, intval($function["funcID"]), ($function["kwID"] === "" ? null : intval($function["kwID"])), ($function["kwType"] === "" ? null : $function["kwType"]));
}

$userFuncQuery = "  INSERT INTO {$dbName}.user_functions
                                (user_id, function_id, keyword_id, keyword_type)
                    VALUES ( ?,?,?,? " . str_repeat('), ( ?,?,?,? ',count($functionArray)-1) .")";

$userFuncStatement = $pdo->prepare($userFuncQuery);
$userFuncStatement->execute($userFuncArray);

#############################################################################################################################

$deleteItemQuery = "DELETE FROM {$dbName}.user_items
                WHERE user_id = :userID";

$deleteItemStatement = $pdo->prepare($deleteItemQuery);
$deleteItemStatement->execute([':userID' => $userID]);

$userItemArray = array();

foreach($itemArray as $item)
{
    array_push($userItemArray,$userID, $item["abbr"], (empty($item["count"]) ? null : $item["count"]));
}

if(count($userItemArray) > 0)
{
    $userItemQuery = "  INSERT INTO {$dbName}.user_items
                                    (user_id, item_abbr, count)
                        VALUES ( ?,?,? " . str_repeat('), ( ?,?,? ',count($itemArray)-1) .")";

    $userItemStatement = $pdo->prepare($userItemQuery);
    $userItemStatement->execute($userItemArray);
}

#############################################################################################################################

echo json_encode("Success!");