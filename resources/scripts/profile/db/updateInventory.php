<?php
require('dbConnect.php');

$userID = $_POST["userID"];
$itemIDArray = $_POST["items"] ?? array();

$deleteQuery = "DELETE FROM {$dbName}.user_items
                WHERE user_id = :userID";

$deleteStatement = $pdo->prepare($deleteQuery);
$deleteStatement->execute([':userID' => $userID]);

$userItemArray = array();

foreach($itemIDArray as $itemID)
{
    array_push($userItemArray,$userID,$itemID);
}

if(count($itemIDArray) > 0)
{
    $userItemQuery = "  INSERT INTO {$dbName}.user_items
                                    (user_id, item_id)
                        VALUES ( ?,? " . str_repeat('), ( ?,? ',count($itemIDArray)-1) .")";

    $userItemStatement = $pdo->prepare($userItemQuery);
    $userItemStatement->execute($userItemArray);
}

echo json_encode("Success!");