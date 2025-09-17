<?php
require('dbConnect.php');

$actionType = $_POST["actionType"];
$termID = $_POST["terminalID"];
$targetID = $_POST["targetID"];
$userID = $_POST["userID"];
$newData = $_POST["newData"];
$oldData = $_POST["oldData"];

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
                                    "termID" => intval($termID),
                                    "actionType" => (($actionType === "entry" || $actionType === "ice") ? "entry" : $actionType),
                                    "targetID" => intval($targetID),
                                    "userID" => intval($userID),
                                    "newData" => $newData
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