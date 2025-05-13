<?php
require('dbConnect.php');

$actionType = $_POST["actionType"];
$entryID = $_POST["entryID"];
$newData = $_POST["newData"];
$oldData = $_POST["oldData"];

//INTERRUPT CODE HERE?

switch($actionType)
{
    case "entry":
    case "ice":
        $updateQuery = "UPDATE {$dbName}.sim_entries
                        SET state = :newData, previous = :oldData
                        WHERE id = :entryID";

        $updateStatement = $pdo->prepare($updateQuery);

        $updateStatement->execute([':newData' => $newData, ':oldData' => $oldData, ':entryID' => $entryID]);
        break;
    case "log":
        if($newData === "") // WIPE TRACKS
        {
            $updateQuery = "UPDATE {$dbName}.sim_access_logs
                            SET state = 'wiped'
                            WHERE id = :entryID";

            $updateStatement = $pdo->prepare($updateQuery);

            $updateStatement->execute([':entryID' => $entryID]);
        }
        else // REASSIGN
        {
            $updateQuery = "UPDATE {$dbName}.sim_access_logs
                            SET reassignee = :newData
                            WHERE id = :entryID";

            $updateStatement = $pdo->prepare($updateQuery);

            $updateStatement->execute([':newData' => $newData, ':entryID' => $entryID]);
        }
        break;
    case "brick":
        $updateQuery = "UPDATE {$dbName}.sim_terminals
                        SET state = 'bricked',
                            stateData = :newData
                        WHERE id = :entryID";

        $updateStatement = $pdo->prepare($updateQuery);

        $updateStatement->execute([':newData' => $newData, ':entryID' => $entryID]);
        break;
    case "rig":
        $updateQuery = "UPDATE {$dbName}.sim_terminals
                        SET state = 'rigged'
                        WHERE id = :entryID";

        $updateStatement = $pdo->prepare($updateQuery);

        $updateStatement->execute([':entryID' => $entryID]);
        break;
    case "root":
        $updateQuery = "UPDATE {$dbName}.sim_terminals
                        SET state = 'rooting',
                            stateData = :newData
                        WHERE id = :entryID";

        $updateStatement = $pdo->prepare($updateQuery);

        $updateStatement->execute([':newData' => time(), ':entryID' => $entryID]);
        break;
    case "rooted":
        $updateQuery = "UPDATE {$dbName}.sim_terminals
                        SET state = 'rooted',
                            stateData = NULL
                        WHERE id = :entryID";

        $updateStatement = $pdo->prepare($updateQuery);

        $updateStatement->execute([':entryID' => $entryID]);
        break;
}