<?php
require('dbConnect.php');

$userID = $_POST["userID"];
$itemArray = $_POST["items"] ?? array();

$deleteQuery = "DELETE FROM {$dbName}.user_items
                WHERE user_id = :userID";

$deleteStatement = $pdo->prepare($deleteQuery);
$deleteStatement->execute([':userID' => $userID]);

$userItemArray = array();

foreach($itemArray as $item)
{
    array_push($userItemArray,$userID, $item["id"], (empty($item["count"]) ? null : $item["count"]));
}

if(count($userItemArray) > 0)
{
    $userItemQuery = "  INSERT INTO {$dbName}.user_items
                                    (user_id, item_id, count)
                        VALUES ( ?,?,? " . str_repeat('), ( ?,?,? ',count($itemArray)-1) .")";

    $userItemStatement = $pdo->prepare($userItemQuery);
    $userItemStatement->execute($userItemArray);
}

echo json_encode("Success!");