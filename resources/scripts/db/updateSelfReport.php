<?php
require('dbConnect.php');

$userID = $_POST["userID"];
$funcIDArray = $_POST["funcs"];
$itemIDArray = $_POST["items"];

/////////////////////////////////////////////////////////////////////////////////

$delFuncQuery = "   DELETE FROM cpu_term.user_selfreport
                    WHERE user_id = :userID";

$delFuncStatement = $pdo->prepare($delFuncQuery);
$delFuncStatement->execute([':userID' => $userID]);

$srFuncArray = array();

foreach($funcIDArray as $funcID)
{
    array_push($srFuncArray,$userID, $funcID);
}

$srFuncQuery = "  INSERT INTO cpu_term.user_selfreport
                                (user_id, mlFunction_id)
                    VALUES ( ?,? " . str_repeat('), ( ?,? ',count($funcIDArray)-1) .")";

echo var_dump($srFuncQuery);

$srFuncStatement = $pdo->prepare($srFuncQuery);
$srFuncStatement->execute($srFuncArray);

/////////////////////////////////////////////////////////////////////////////////

$deleteQuery = "DELETE FROM cpu_term.user_items
                WHERE user_id = :userID";

$deleteStatement = $pdo->prepare($deleteQuery);
$deleteStatement->execute([':userID' => $userID]);

$userItemArray = array();

foreach($itemIDArray as $itemID)
{
    array_push($userItemArray,$userID,$itemID);
}

$userItemQuery = "  INSERT INTO cpu_term.user_items
                                (user_id, item_id)
                    VALUES ( ?,? " . str_repeat('), ( ?,? ',count($itemIDArray)-1) .")";

$userItemStatement = $pdo->prepare($userItemQuery);
$userItemStatement->execute($userItemArray);

echo json_encode("Success!");