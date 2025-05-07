<?php

require('..\\..\\resources\\scripts\\db\\dbConnect.php');

$action = $_POST["action"];
$terminal = $_POST["terminal"];

if($action === "CREATE")
{
    $createQuery = "INSERT INTO cpu_term.terminals
                                (slug, jobCode, displayName, access, state)
                    VALUES (:slug, :jobCode, :displayName, :accessCost, 'active')";
    
    $createStatement = $pdo->prepare($createQuery);
    $createStatement->execute([ ':slug' => $terminal["termSlug"],
                                        ':jobCode' => $terminal["jobCode"],
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

        $insertQuery = "INSERT INTO cpu_term.entries
                                    (terminal_id, icon, path, type, access, modify, title, contents, state)
                        VALUES ( ?,?,?,?,?,?,?,?,? " . str_repeat("), ( ?,?,?,?,?,?,?,?,? ",(count($entryArray) / 9) - 1) . ")";

        $insertStatement = $pdo->prepare($insertQuery);
        $insertStatement->execute($entryArray);
    }

    echo json_encode("Success!");
}
elseif($action === "SAVE")
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
        array_push($returnArray,$termID, $entry["icon"], $entry["path"], strtolower($entry["type"]), $entry["access"], $entry["modify"], $entry["title"], $entry["contents"], $entry["state"]);

        if(array_key_exists("subIce", $entry))
        {
            $returnArray = array_merge($returnArray, getEntries($termID, $entry["subIce"]));
        }
    }

    return $returnArray;
}