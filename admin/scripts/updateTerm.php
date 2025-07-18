<?php

require('../../resources/scripts/terminal/db/dbConnect.php');

$action = $_POST["action"];
$terminal = $_POST["terminal"];

if($action === "CREATE")
{
    $createQuery = "INSERT INTO {$dbName}.sim_terminals
                                (slug, jobCode, displayName, access, state, remoteEnabled)
                    VALUES (:slug, :jobCode, :displayName, :accessCost, 'active', 0)";
    
    $createStatement = $pdo->prepare($createQuery);
    $createStatement->execute([ ':slug' => $terminal["termSlug"],
                                        ':jobCode' => strtoupper($terminal["jobCode"]),
                                        ':displayName' => $terminal["displayName"],
                                        ':accessCost' => $terminal["termAccess"]]);

    $termIDQuery = "SELECT LAST_INSERT_ID();";
    $termIDStatement = $pdo->prepare($termIDQuery);
    $termIDStatement->execute();

    $termID = $termIDStatement->fetch(PDO::FETCH_COLUMN);

    if($terminal["entries"] !== null)
    {
        $entryArray = array();

        foreach(json_decode($terminal["entries"],true) as $icon)
        {
            $entryArray = array_merge($entryArray,getEntries($termID,$icon));
        }

        if(!empty($entryArray))
        {
            $insertQuery = "INSERT INTO {$dbName}.sim_entries
                                        (terminal_id, icon, path, type, access, modify, title, contents, state)
                            VALUES ( ?,?,?,?,?,?,?,?,? " . str_repeat("), ( ?,?,?,?,?,?,?,?,? ",(count($entryArray) / 9) - 1) . ")";

            $insertStatement = $pdo->prepare($insertQuery);
            $insertStatement->execute($entryArray);
        }
    }

    if($terminal["puzzles"] !== null)
    {
        $puzzleArray = array();

        foreach(json_decode($terminal["puzzles"],true) as $puzzle)
        {
            array_push($puzzleArray, $termID, $puzzle["puzzle_type"], intval($puzzle["cost"]), (is_numeric($puzzle["repeat"]) ? intval($puzzle["repeat"]) : null), $puzzle["know_reqs"], $puzzle["reward_type"], (is_numeric($puzzle["reward"]) ? intval($puzzle["reward"]) : $puzzle["reward"]), 0);
        };

        if(!empty($puzzleArray))
        {
            $insertQuery = "INSERT INTO {$dbName}.sim_puzzles
                                        (terminal_id, puzzle_type, cost, `repeat`, know_reqs, reward_type, reward, global)
                            VALUES ( ?,?,?,?,?,?,?,?" . str_repeat("), ( ?,?,?,?,?,?,?,?", (count($puzzleArray) / 8) - 1) . ")";

            $insertStatement = $pdo->prepare($insertQuery);
            $insertStatement->execute($puzzleArray);
        }
    }

    echo json_encode("Success!");
}
elseif($action === "SAVE")
{
    $updateQuery = "UPDATE {$dbName}.sim_terminals
                    SET slug=:slug, jobCode=:jobCode, displayName=:displayName, access=:accessCost
                    WHERE id=:termID";
    
    $updateStatement = $pdo->prepare($updateQuery);
    $updateStatement->execute([ ':slug' => $terminal["termSlug"],
                                        ':jobCode' => strtoupper($terminal["jobCode"]),
                                        ':displayName' => $terminal["displayName"],
                                        ':accessCost' => $terminal["termAccess"],
                                        ':termID' => $terminal["termID"]]);

    if($terminal["entries"] !== null)
    {
        $deleteQuery = "DELETE from {$dbName}.sim_entries
                        WHERE terminal_id=:termID";
        
        $deleteStatement = $pdo->prepare($deleteQuery);
        $deleteStatement->execute([':termID' => $terminal["termID"]]);


        $entryArray = array();

        foreach(json_decode($terminal["entries"],true) as $icon)
        {
            $entryArray = array_merge($entryArray,getEntries($terminal["termID"],$icon));
        }

        if(!empty($entryArray))
        {
            $insertQuery = "INSERT INTO {$dbName}.sim_entries
                                        (terminal_id, icon, path, type, access, modify, title, contents, state)
                            VALUES ( ?,?,?,?,?,?,?,?,? " . str_repeat("), ( ?,?,?,?,?,?,?,?,? ",(count($entryArray) / 9) - 1) . ")";

            $insertStatement = $pdo->prepare($insertQuery);
            $insertStatement->execute($entryArray);
        }
    }

    if($terminal["puzzles"] !== null)
    {
        $deleteQuery = "DELETE from {$dbName}.sim_puzzles
                        WHERE terminal_id=:termID";
        
        $deleteStatement = $pdo->prepare($deleteQuery);
        $deleteStatement->execute([':termID' => $terminal["termID"]]);

        $puzzleArray = array();

        foreach(json_decode($terminal["puzzles"],true) as $puzzle)
        {
            array_push($puzzleArray, $terminal["termID"], $puzzle["puzzle_type"], intval($puzzle["cost"]), (is_numeric($puzzle["repeat"]) ? intval($puzzle["repeat"]) : null), $puzzle["know_reqs"], $puzzle["reward_type"], (is_numeric($puzzle["reward"]) ? intval($puzzle["reward"]) : $puzzle["reward"]), 0);
        };
        
        if(!empty($puzzleArray))
        {
            $insertQuery = "INSERT INTO {$dbName}.sim_puzzles
                                        (terminal_id, puzzle_type, cost, `repeat`, know_reqs, reward_type, reward, global)
                            VALUES ( ?,?,?,?,?,?,?,?" . str_repeat("), ( ?,?,?,?,?,?,?,?", (count($puzzleArray) / 8) - 1) . ")";

            $insertStatement = $pdo->prepare($insertQuery);
            $insertStatement->execute($puzzleArray);
        }
    }

    echo json_encode("Success!");
}
else if ($action === "DELETE")
{
    $deleteQuery = "DELETE FROM {$dbName}.sim_terminals
                    WHERE id=:termID";
        
    $deleteStatement = $pdo->prepare($deleteQuery);
    $deleteStatement->execute([':termID' => $terminal["termID"]]);

    echo json_encode("Success!");
}

function getEntries($termID, $entryList)
{
    $returnArray = array();
    
    foreach($entryList as $entry)
    {
        array_push($returnArray,$termID, $entry["icon"], $entry["path"], strtolower($entry["type"]), $entry["access"], $entry["modify"], $entry["title"], $entry["contents"], $entry["state"]);

        if(array_key_exists("subIce", $entry))
        {
            $returnArray = array_merge($returnArray, getEntries($termID, $entry["subIce"]));
        }
    }

    return $returnArray;
}