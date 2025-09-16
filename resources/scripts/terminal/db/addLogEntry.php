<?php
require('dbConnect.php');

$termID = $_POST["termID"];
$userID = $_POST["userID"];
$userMask = $_POST["userMask"];
$userTags = $_POST["userTags"];

$userNameQuery = "  SELECT charName from {$dbName}.users
                    WHERE ml_id = :userID";

$userNameStatement = $pdo->prepare($userNameQuery);
$userNameStatement->execute([':userID' => $userID]);
$userName = $userNameStatement->fetch(PDO::FETCH_COLUMN);

$newLogQuery = "INSERT INTO {$dbName}.sim_access_logs
                    (terminal_id, user_id, mask, state, tags)
                VALUES (:termID, :userID, :mask, 'initial', :userTags)";

$newLogStatement = $pdo->prepare($newLogQuery);

$newLogStatement->execute([':termID' => $termID, ':userID' => $userID, ':mask' => ($userMask === "false" ? NULL : $userMask), ':userTags' => $userTags]);
$newLogID = $pdo->lastInsertId();

//SEND INTERRUPT CODE
$prevErrLvl = error_reporting(0);

require '../listener/composer/vendor/autoload.php';
use WebSocket;

try
{
    $tempClient = new WebSocket\Client("ws://localhost:8767");

    $tempClient->addMiddleware(new WebSocket\Middleware\CloseHandler());
    $tempClient->addMiddleware(new WebSocket\Middleware\PingResponder());

    $message = json_encode(array(
                                    "actionType" => "log",
                                    "targetID" => intval($newLogID),
                                    "userID" => intval($userID),
                                    "newData" => ($userMask === "false" ? $userName : $userMask)
                                    ));

    $tempClient->text($message);


    $tempClient->close();
}
catch(Exception $error)
{
    //Ignore Errors Here
}
error_reporting($prevErrLvl);
//////////////////////////////////////////////////////

echo $newLogID;