<?php
require('dbConnect.php');

$userID = $_POST["userID"];
$targetID = $_POST["targetID"];
$action = $_POST["action"];
$actionType = $_POST["actionType"];
$newState = $_POST["newState"];
$actionCost = $_POST["actionCost"];
$global = $_POST["global"];

$actionQuery = "INSERT INTO {$dbName}.sim_user_actions
                            (time, user_id, target_type, target_id, action, newState, cost, global)
                VALUES ( UTC_TIMESTAMP(), ?, ?, ?, ?, ?, ?, ? )";

switch($actionType)
{
    case("entry"):
    case("ice"):
        $targetType = "entry";
        break;
    case("log"):
        $targetType = "log";
        break;
    case("puzzle"):
        $targetType = "puzzle";
        break;
    case("brick"):
    case("rig"):
    case("root"):
    case("masher"): //$newState = masher's ID
    case("siph"):
    case("refresh"):
    case("external"):
        $targetType = "terminal";
        break;
    case("item"):
    case("pet_play"):
        $targetType = "item";
        $action = "Item";
        break;
}

$actionStatement = $pdo->prepare($actionQuery);
$actionStatement->execute([$userID, $targetType, $targetID, $action, $newState, $actionCost, ($global === 'true' ? 1 : 0)]);