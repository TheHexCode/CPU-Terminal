<?php
require('dbConnect.php');

$userID = $_POST["userID"];
$funcIDArray = $_POST["funcs"] ?? array();
$itemIDArray = $_POST["items"] ?? array();

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

if(count($funcIDArray) > 0)
{
    $srFuncQuery = "INSERT INTO cpu_term.user_selfreport
                                (user_id, mlFunction_id)
                        VALUES ( ?,? " . str_repeat('), ( ?,? ',count($funcIDArray)-1) .")";

    $srFuncStatement = $pdo->prepare($srFuncQuery);
    $srFuncStatement->execute($srFuncArray);
}

/////////////////////////////////////////////////////////////////////////////////

$delItemQuery = "   DELETE FROM cpu_term.user_items
                    WHERE user_id = :userID";

$delItemStatement = $pdo->prepare($delItemQuery);
$delItemStatement->execute([':userID' => $userID]);

$srItemArray = array();

foreach($itemIDArray as $itemID)
{
    array_push($srItemArray,$userID,$itemID);
}

if(count($itemIDArray) > 0)
{
    $srItemQuery = "INSERT INTO cpu_term.user_items
                                (user_id, item_id)
                        VALUES ( ?,? " . str_repeat('), ( ?,? ',count($itemIDArray)-1) .")";

    $srItemStatement = $pdo->prepare($srItemQuery);
    $srItemStatement->execute($srItemArray);
}

echo json_encode("Success!");