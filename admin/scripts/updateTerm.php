<?php

require('..\\..\\resources\\scripts\\db\\dbConnect.php');

$action = $_POST["action"];
$terminal = $_POST["terminal"];

if($action === "SAVE")
{
    $updateQuery = "UPDATE cpu_term.terminals
                    SET slug=:slug, jobCode=:jobCode, displayName=:displayName, access=:accessCost
                    WHERE id=:termID";
    
    $updateStatement = $pdo->prepare($updateQuery);
    $updateStatement->execute([ ':slug' => $terminal["termSlug"],
                                        ':jobCode' => $terminal["jobCode"],
                                        ':displayName' => $terminal["displayName"],
                                        ':accessCost' => $terminal["termAccess"],
                                        ':termID' => $terminal["termID"]]);

    if($terminal["entries"] !== null)
    {
        $deleteQuery = "DELETE from cpu_term.entries
                        WHERE terminal_id=:termID";
        
        $deleteStatement = $pdo->prepare($deleteQuery);
        $deleteStatement->execute([':termID' => $terminal["termID"]]);


        $entryArray = array();

        foreach(json_decode($terminal["entries"],true) as $icon)
        {
            $entryArray = array_merge($entryArray,getEntries($terminal["termID"],$icon));
        }

        $insertQuery = "INSERT INTO cpu_term.entries
                                    (terminal_id, icon, path, type, access, modify, title, contents, state)
                        VALUES ( ?,?,?,?,?,?,?,?,? " . str_repeat("), ( ?,?,?,?,?,?,?,?,? ",(count($entryArray) / 9) - 1) . ")";

        $insertStatement = $pdo->prepare($insertQuery);
        $insertStatement->execute($entryArray);
    }

    echo json_encode("Success!");
}
else if ($action === "DELETE")
{
    $deleteQuery = "DELETE FROM cpu_term.terminals
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
        array_push($returnArray,$termID, $entry["icon"], $entry["path"], $entry["type"], $entry["access"], $entry["modify"], $entry["title"], $entry["contents"], $entry["state"]);

        if(array_key_exists("subIce", $entry))
        {
            $returnArray = array_merge($returnArray, getEntries($termID, $entry["subIce"]));
        }
    }

    return $returnArray;
}