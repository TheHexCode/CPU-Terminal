<?php
require('dbConnect.php');

$actionType = $_POST["actionType"];
$entryID = $_POST["entryID"];
$newData = $_POST["newData"];

//INTERRUPT CODE HERE?

switch($actionType)
{
    case "entry":
    case "ice":
        $updateQuery = "UPDATE CPU_Terminal.dbo.entries
                        SET state = :newData
                        WHERE id = :entryID";

        $updateStatement = $pdo->prepare($updateQuery);

        $updateStatement->execute([':newData' => $newData, ':entryID' => $entryID]);
        break;
    case "log":
        if($newData === "") // WIPE TRACKS
        {
            $updateQuery = "UPDATE CPU_Terminal.dbo.accessLogs
                            SET state = 'wiped'
                            WHERE id = :entryID";

            $updateStatement = $pdo->prepare($updateQuery);

            $updateStatement->execute([':entryID' => $entryID]);
        }
        else // REASSIGN
        {
            $updateQuery = "UPDATE CPU_Terminal.dbo.accessLogs
                            SET reassignee = :newData
                            WHERE id = :entryID";

            $updateStatement = $pdo->prepare($updateQuery);

            $updateStatement->execute([':newData' => $newData, ':entryID' => $entryID]);
        }
        break;
    case "brick":
        $updateQuery = "UPDATE CPU_Terminal.dbo.terminals
                        SET state = 'bricked',
                            stateData = :newData
                        WHERE id = :entryID";

        $updateStatement = $pdo->prepare($updateQuery);

        $updateStatement->execute([':newData' => $newData, ':entryID' => $entryID]);
        break;
    case "rig":
        $updateQuery = "UPDATE CPU_Terminal.dbo.terminals
                        SET state = 'rigged'
                        WHERE id = :entryID";

        $updateStatement = $pdo->prepare($updateQuery);

        $updateStatement->execute([':entryID' => $entryID]);
        break;
    case "root":
        $updateQuery = "UPDATE CPU_Terminal.dbo.terminals
                        SET state = 'rooting',
                            stateData = :newData
                        WHERE id = :entryID";

        $updateStatement = $pdo->prepare($updateQuery);

        $updateStatement->execute([':newData' => time(), ':entryID' => $entryID]);
        break;
    //Items?
}