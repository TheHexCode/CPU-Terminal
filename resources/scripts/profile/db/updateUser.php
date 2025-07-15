<?php
require('dbConnect.php');

$userID = $_POST["userID"];
$functionArray = $_POST["userFunctions"];
$itemArray = $_POST["userItems"] ?? array();

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