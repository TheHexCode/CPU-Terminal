<?php
require('dbConnect.php');

$actionType = $_POST["actionType"];
$targetID = $_POST["targetID"];
$userID = $_POST["userID"];
$newData = $_POST["newData"];
$oldData = $_POST["oldData"];

$userName = null;

if($actionType === "brick")
{
    $userQuery = "  SELECT charName
                    FROM {$dbName}.users
                    WHERE ml_id=:userID";

    $userStatement = $pdo->prepare($userQuery);
    $userStatement->execute([':userID' => $userID]);

    $userName = $userStatement->fetch(PDO::FETCH_COLUMN);
}

//SEND INTERRUPT CODE
$prevErrLvl = error_reporting(0);

use WebSocket;
try
{
    require '../listener/composer/vendor/autoload.php';

    $tempClient = new WebSocket\Client("ws://localhost:8767");

    $tempClient->addMiddleware(new WebSocket\Middleware\CloseHandler());
    $tempClient->addMiddleware(new WebSocket\Middleware\PingResponder());

    $message = json_encode(array(
                                    "actionType" => (($actionType === "entry" || $actionType === "ice") ? "entry" : $actionType),
                                    "targetID" => intval($targetID),
                                    "userID" => intval($userID),
                                    "newData" => $userName ?? $newData
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

switch($actionType)
{
    case "entry":
    case "ice":
        $updateQuery = "UPDATE {$dbName}.sim_entries
                        SET state = :newData, previous = :oldData
                        WHERE id = :targetID";

        $updateStatement = $pdo->prepare($updateQuery);

        $updateStatement->execute([':newData' => $newData, ':oldData' => $oldData, ':targetID' => $targetID]);
        break;
    case "log":
        if($newData === "") // WIPE TRACKS
        {
            $updateQuery = "UPDATE {$dbName}.sim_access_logs
                            SET state = 'wiped'
                            WHERE id = :targetID";

            $updateStatement = $pdo->prepare($updateQuery);

            $updateStatement->execute([':targetID' => $targetID]);
        }
        else // REASSIGN
        {
            $updateQuery = "UPDATE {$dbName}.sim_access_logs
                            SET reassignee = :newData
                            WHERE id = :targetID";

            $updateStatement = $pdo->prepare($updateQuery);

            $updateStatement->execute([':newData' => $newData, ':targetID' => $targetID]);
        }
        break;
    case "brick":
        $updateQuery = "UPDATE {$dbName}.sim_terminals
                        SET state = 'bricked',
                            stateData = :newData
                        WHERE id = :targetID";

        $updateStatement = $pdo->prepare($updateQuery);

        $updateStatement->execute([':newData' => $newData, ':targetID' => $targetID]);
        break;
    case "rig":
        $updateQuery = "UPDATE {$dbName}.sim_terminals
                        SET state = 'rigged'
                        WHERE id = :targetID";

        $updateStatement = $pdo->prepare($updateQuery);

        $updateStatement->execute([':targetID' => $targetID]);
        break;
    case "root":
        $updateQuery = "UPDATE {$dbName}.sim_terminals
                        SET state = 'rooting',
                            stateData = :newData
                        WHERE id = :targetID";

        $updateStatement = $pdo->prepare($updateQuery);

        $updateStatement->execute([':newData' => time(), ':targetID' => $targetID]);
        break;
    case "rooted":
        $updateQuery = "UPDATE {$dbName}.sim_terminals
                        SET state = 'rooted',
                            stateData = NULL
                        WHERE id = :targetID";

        $updateStatement = $pdo->prepare($updateQuery);

        $updateStatement->execute([':targetID' => $targetID]);
        break;
}