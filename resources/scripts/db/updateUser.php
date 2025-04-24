<?php
require('dbConnect.php');

$userCode = $_POST["userCode"];
$itemIDArray = $_POST["items"];

$deleteQuery = "DELETE cpu_term.user_items
                FROM cpu_term.user_items JOIN cpu_term.users
                ON user_id=users.id
                WHERE users.userCode = :userCode";

$deleteStatement = $pdo->prepare($deleteQuery);
$deleteStatement->execute([':userCode' => $userCode]);

$userItemArray = array();

foreach($itemIDArray as $itemID)
{
    array_push($userItemArray,$userCode,$itemID);
}

$userItemQuery = "  INSERT INTO cpu_term.user_items
                                (user_id, item_id)
                    VALUES ( ?,? " . str_repeat('), ( ?,? ',count($itemIDArray)-1) .")";

$userItemStatement = $pdo->prepare($userItemQuery);
$userItemStatement->execute($userItemArray);