<?php
require('dbConnect.php');

$userID = $_POST["userID"];
$targetID = $_POST["targetID"];
$action = $_POST["action"];
$newState = $_POST["newState"];
$actionCost = $_POST["actionCost"];
$global = $_POST["global"];

$actionQuery = "INSERT INTO {$dbName}.sim_user_actions
                            (time, user_id, target_type, target_id, action, newState, cost, global)
                VALUES ( UTC_TIMESTAMP(), ?, ?, ?, ?, ?, ?, ? )";

switch($action)
{
    case("Access"):
    case("Modify"):
    case("Break"):
    case("Sleaze"):
        $targetType = "entry";
        break;
    case("Reassign"):
    case("Wipe Tracks"):
        $targetType = "log";
        break;
    case("Brick"):
    case("Rig"):
    case("Root"):
    case("Masher"): //$newState = masher's ID
    case("Siphon Charge"):
    case("Refresh"):
        $targetType = "terminal";
        break;
    case("Use Deck"):
    case("Play"):
        $targetType = "item";
        $action = "Item";
        break;
}

$actionStatement = $pdo->prepare($actionQuery);
$actionStatement->execute([$userID, $targetType, $targetID, $action, $newState, $actionCost, ($global === 'true' ? 1 : 0)]);